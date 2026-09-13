import { Result } from "better-result";
import { type MapLink } from "@firecrawl/firecrawl-convex";
import { zid } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import { env, internalAction, internalMutation } from "./_generated/server";
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
      name: z.string(),
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
  handler: (ctx, args) => ctx.db.get("reports", args.reportId),
});

export const startReport = publicMutation({
  args: { url: z.string().min(1) },
  returns: z.object({ reportId: zid("reports") }),
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("reports", {
      url: args.url,
      name: "",
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

//#region Private functions

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
    const report = await ctx.db.get("reports", args.reportId);
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
    const report = await ctx.db.get("reports", args.reportId);
    if (report === null) return null;

    await ctx.db.patch(args.reportId, {
      mappedUrls: args.mappedUrls,
      scrapes: args.scrapes,
      totalScrapes: args.scrapes.length,
      phase: "scraping",
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
    name: v.string(),
    maxTotalResults: v.number(),
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
    const report = await ctx.db.get("reports", args.reportId);
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
      args.error === undefined
        ? [...report.results, ...args.results].slice(0, args.maxTotalResults)
        : report.results;
    const allFinished = finishedScrapes === scrapes.length;
    const hasSuccess = scrapes.some((item) => item.phase === "completed");

    await ctx.db.patch(args.reportId, {
      scrapes,
      finishedScrapes,
      results,
      ...(report.name === "" && args.name !== "" ? { name: args.name } : {}),
      ...(allFinished && !hasSuccess
        ? { phase: "failed" as const, error: "All page scrapes failed" }
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
    const limits = getReportLimits();
    let selectedUrlCount = 0;
    let hasSuccessfulScrape = false;

    const reportResult = await Result.tryPromise({
      try: async () => {
        const resultSchema = accessibilityQaResultSchema(limits.maxResultsPerPage);
        const prompt = accessibilityQaPrompt(limits.maxResultsPerPage);

        // Mark the report as mapping before contacting Firecrawl.
        await ctx.runMutation(internal.reports.setReportPhase, {
          reportId: args.reportId,
          phase: "mapping",
        });

        // Map candidate pages and rank them by accessibility relevance.
        const mapResult = await firecrawl.map(ctx, args.url, { limit: limits.maxMappedUrls });
        const mappedUrls = rankLinks(mapResult.links, limits.maxMappedUrls);
        const selectedUrls = mappedUrls.slice(0, limits.maxPagesToScrape);
        selectedUrlCount = selectedUrls.length;

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
                    prompt,
                    schema: z.toJSONSchema(resultSchema, {
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
              name: "",
              maxTotalResults: limits.maxTotalResults,
              results: [],
              error: scrapeResult.error,
            });
            continue;
          }

          hasSuccessfulScrape = true;
          const extracted = extractScrape(
            scrapeResult.value.json,
            scrapeResult.value.metadata?.sourceURL ?? link.url,
            limits.maxResultsPerPage,
          );

          await ctx.runMutation(internal.reports.recordReportScrape, {
            reportId: args.reportId,
            url: link.url,
            name: extracted.name,
            maxTotalResults: limits.maxTotalResults,
            results: extracted.results,
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

    // Save the venue snapshot before marking the report completed for subscribers.
    const saveResult = await Result.tryPromise({
      try: () =>
        ctx.runMutation(internal.venues.saveReportToVenues, {
          reportId: args.reportId,
        }),
      catch: getErrorMessage,
    });

    if (saveResult.isErr()) {
      if (reportResult.isOk()) {
        await ctx.runMutation(internal.reports.setReportPhase, {
          reportId: args.reportId,
          phase: "failed",
          error: saveResult.error,
        });
      }
      return null;
    }

    if (reportResult.isOk() && (selectedUrlCount === 0 || hasSuccessfulScrape)) {
      await ctx.runMutation(internal.reports.setReportPhase, {
        reportId: args.reportId,
        phase: "completed",
      });
    }

    return null;
  },
});

//#endregion Private functions

//#region Utils

const DEFAULT_REPORT_LIMITS = {
  maxMappedUrls: 100,
  maxPagesToScrape: 5,
  maxResultsPerPage: 10,
  maxTotalResults: 10,
};

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

function accessibilityQaPrompt(maxResultsPerPage: number) {
  return `Extract the venue's name and accessibility-related questions and answers from this webpage.

Use the venue name explicitly shown on the page. Return an empty string if the page does not identify it. Do not invent or infer answers.
Focus on practical accessibility information for visitors, attendees, or users.
Return at most ${maxResultsPerPage} concise question-and-answer pairs. If there are no relevant pairs, return an empty questions array.`;
}

function accessibilityQaResultSchema(maxResultsPerPage: number) {
  return z
    .object({
      name: z.string(),
      questions: z
        .array(
          z
            .object({
              question: z.string().trim().min(1),
              answer: z.string().trim().min(1),
            })
            .strict(),
        )
        .max(maxResultsPerPage),
    })
    .strict();
}

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

type ExtractedScrape = {
  name: string;
  results: ExtractedResult[];
};

function getReportLimits() {
  return {
    maxMappedUrls: Number(env.REPORT_MAX_MAPPED_URLS ?? DEFAULT_REPORT_LIMITS.maxMappedUrls),
    maxPagesToScrape: Number(
      env.REPORT_MAX_PAGES_TO_SCRAPE ?? DEFAULT_REPORT_LIMITS.maxPagesToScrape,
    ),
    maxResultsPerPage: Number(
      env.REPORT_MAX_RESULTS_PER_PAGE ?? DEFAULT_REPORT_LIMITS.maxResultsPerPage,
    ),
    maxTotalResults: Number(env.REPORT_MAX_TOTAL_RESULTS ?? DEFAULT_REPORT_LIMITS.maxTotalResults),
  };
}

function rankLinks(links: MapLink[], maxMappedUrls: number): RankedLink[] {
  return links
    .slice(0, maxMappedUrls)
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

function extractScrape(json: unknown, url: string, maxResultsPerPage: number): ExtractedScrape {
  const parsed = accessibilityQaResultSchema(maxResultsPerPage).safeParse(json);
  if (!parsed.success) return { name: "", results: [] };

  return {
    name: parsed.data.name.trim(),
    results: parsed.data.questions.map(({ question, answer }) => ({ question, answer, url })),
  };
}

//#endregion Utils
