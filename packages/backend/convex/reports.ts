import { Result } from "better-result";
import { type MapLink } from "@firecrawl/firecrawl-convex";
import { zid } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { publicMutation, publicQuery } from "./lib/customFunctions";
import { firecrawl } from "./lib/firecrawl";

//#region Public functions

export const getReportStatus = publicQuery({
  args: { reportId: zid("reports") },
  returns: z
    .object({
      _id: zid("reports"),
      _creationTime: z.number(),
      url: z.string(),
      phase: z.enum(["queued", "mapping", "scraping", "completed", "failed"]),
      mappedUrls: z.array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          score: z.number(),
        }),
      ),
      scrapes: z.array(
        z.object({
          url: z.string(),
          phase: z.enum(["pending", "completed", "failed"]),
          error: z.string().optional(),
        }),
      ),
      totalScrapes: z.number(),
      finishedScrapes: z.number(),
      results: z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
          url: z.string(),
        }),
      ),
      error: z.string().optional(),
    })
    .nullable(),
  handler: (ctx, args) => ctx.db.get(args.reportId),
});

export const startReport = publicMutation({
  args: { url: z.string().min(1) },
  returns: z.object({ reportId: zid("reports") }),
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("reports", {
      url: args.url,
      phase: "queued",
      mappedUrls: [],
      scrapes: [],
      totalScrapes: 0,
      finishedScrapes: 0,
      results: [],
    });

    await ctx.scheduler.runAfter(0, internal.reports.runReport, {
      reportId,
      url: args.url,
    });

    return { reportId };
  },
});

//#endregion Public functions

//#region Internal functions

export const setReportPhase = internalMutation({
  args: {
    reportId: v.id("reports"),
    phase: v.union(
      v.literal("queued"),
      v.literal("mapping"),
      v.literal("scraping"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (report === null) return null;

    await ctx.db.patch(
      args.reportId,
      args.error === undefined ? { phase: args.phase } : { phase: args.phase, error: args.error },
    );
    return null;
  },
});

export const setReportMappedUrls = internalMutation({
  args: {
    reportId: v.id("reports"),
    mappedUrls: v.array(
      v.object({
        url: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        score: v.number(),
      }),
    ),
    scrapes: v.array(
      v.object({
        url: v.string(),
        phase: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (report === null) return null;

    await ctx.db.patch(args.reportId, {
      mappedUrls: args.mappedUrls,
      scrapes: args.scrapes,
      totalScrapes: args.scrapes.length,
      phase: args.scrapes.length === 0 ? "completed" : "scraping",
      finishedScrapes: 0,
      results: [],
    });
    return null;
  },
});

export const recordReportScrape = internalMutation({
  args: {
    reportId: v.id("reports"),
    url: v.string(),
    results: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        url: v.string(),
      }),
    ),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (report === null) return null;

    const scrape = report.scrapes.find((item) => item.url === args.url);
    if (scrape === undefined || scrape.phase !== "pending") {
      return null;
    }

    const scrapes = report.scrapes.map((item) =>
      item.url !== args.url
        ? item
        : args.error === undefined
          ? { ...item, phase: "completed" as const }
          : { ...item, phase: "failed" as const, error: args.error },
    );
    const finishedScrapes = scrapes.filter(
      (item) => item.phase === "completed" || item.phase === "failed",
    ).length;
    const results =
      args.error === undefined ? [...report.results, ...args.results].slice(0, 10) : report.results;
    const allFinished = finishedScrapes === scrapes.length;
    const hasSuccess = scrapes.some((item) => item.phase === "completed");

    await ctx.db.patch(args.reportId, {
      scrapes,
      finishedScrapes,
      results,
      ...(allFinished
        ? hasSuccess
          ? { phase: "completed" as const }
          : { phase: "failed" as const, error: "All page scrapes failed" }
        : {}),
    });
    return null;
  },
});

export const runReport = internalAction({
  args: {
    reportId: v.id("reports"),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const reportResult = await Result.tryPromise({
      try: async () => {
        // Mark the report as mapping before contacting Firecrawl.
        await ctx.runMutation(internal.reports.setReportPhase, {
          reportId: args.reportId,
          phase: "mapping",
        });

        // Map candidate pages and rank them by accessibility relevance.
        const mapResult = await firecrawl.map(ctx, args.url, { limit: MAX_MAPPED_URLS });
        const mappedUrls = rankLinks(mapResult.links);
        const selectedUrls = mappedUrls.slice(0, 5);

        // Initialize progress tracking for the selected pages.
        await ctx.runMutation(internal.reports.setReportMappedUrls, {
          reportId: args.reportId,
          mappedUrls,
          scrapes: selectedUrls.map((link) => ({
            url: link.url,
            phase: "pending" as const,
          })),
        });

        // Scrape each selected page and record its results.
        for (const link of selectedUrls) {
          const scrapeResult = await Result.tryPromise({
            try: () =>
              firecrawl.scrape(ctx, link.url, {
                onlyMainContent: true,
                formats: [
                  {
                    type: "json",
                    prompt: ACCESSIBILITY_QA_PROMPT,
                    schema: z.toJSONSchema(ACCESSIBILITY_QA_RESULT_SCHEMA, {
                      target: "openapi-3.0",
                    }),
                  },
                ],
              }),
            catch: getErrorMessage,
          });

          if (scrapeResult.isErr()) {
            await ctx.runMutation(internal.reports.recordReportScrape, {
              reportId: args.reportId,
              url: link.url,
              results: [],
              error: scrapeResult.error,
            });
            continue;
          }

          await ctx.runMutation(internal.reports.recordReportScrape, {
            reportId: args.reportId,
            url: link.url,
            results: extractQuestions(
              scrapeResult.value.json,
              scrapeResult.value.metadata?.sourceURL ?? link.url,
            ),
          });
        }

        return null;
      },
      catch: getErrorMessage,
    });

    if (reportResult.isErr()) {
      // Record orchestration failures so the report cannot remain in progress.
      await ctx.runMutation(internal.reports.setReportPhase, {
        reportId: args.reportId,
        phase: "failed",
        error: reportResult.error,
      });
    }

    return null;
  },
});

//#endregion Internal functions

//#region Utils

const MAX_MAPPED_URLS = 100;

const ACCESSIBILITY_KEYWORDS = [
  "accessibility",
  "faq",
  "question",
  "answer",
  "frequent",
  "accessible",
  "a11y",
  "ada",
  "wheelchair",
  "mobility",
  "deaf",
  "hard of hearing",
  "caption",
  "sign language",
  "asl",
  "blind",
  "low vision",
  "sensory",
  "service animal",
  "assistive",
  "accommodation",
  "elevator",
  "accessible seating",
];

const ACCESSIBILITY_QA_PROMPT = `Extract accessibility-related questions and answers from this webpage.

Only include information explicitly supported by the page. Do not invent or infer answers.
Focus on practical accessibility information for visitors, attendees, or users.
Return at most 10 concise question-and-answer pairs. If there are no relevant pairs, return an empty questions array.`;

const ACCESSIBILITY_QA_RESULT_SCHEMA = z
  .object({
    questions: z
      .array(
        z
          .object({
            question: z.string().trim().min(1),
            answer: z.string().trim().min(1),
          })
          .strict(),
      )
      .max(10),
  })
  .strict();

type RankedLink = {
  url: string;
  title?: string;
  description?: string;
  score: number;
};

type ExtractedResult = {
  question: string;
  answer: string;
  url: string;
};

function rankLinks(links: MapLink[]): RankedLink[] {
  return links
    .slice(0, MAX_MAPPED_URLS)
    .map((link, index) => {
      const searchableText = [link.url, link.title, link.description]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLowerCase();
      const score = ACCESSIBILITY_KEYWORDS.reduce(
        (total, keyword) => total + (searchableText.includes(keyword) ? 1 : 0),
        0,
      );

      return {
        url: link.url,
        ...(link.title ? { title: link.title } : {}),
        ...(link.description ? { description: link.description } : {}),
        score,
        index,
      };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ index: _index, ...link }) => link);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function extractQuestions(json: unknown, url: string): ExtractedResult[] {
  const parsed = ACCESSIBILITY_QA_RESULT_SCHEMA.safeParse(json);
  if (!parsed.success) return [];

  return parsed.data.questions.map(({ question, answer }) => ({ question, answer, url }));
}

//#endregion Utils
