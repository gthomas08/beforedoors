import { Result } from "better-result";
import { type MapLink } from "@firecrawl/firecrawl-convex";
import { zid } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import { env, internalAction, internalMutation } from "./_generated/server";
import { publicMutation, publicQuery } from "./lib/customFunctions";
import { firecrawl, firecrawlPool } from "./lib/firecrawl";
import { scrapeCachedPage } from "./researchPageCache";

//#region Public functions

export const getReportStatus = publicQuery({
  args: { reportId: zid("reports") },
  returns: z
    .object({
      _id: zid("reports"),
      _creationTime: z.number(),
      url: z.string(),
      seedUrl: z.string(),
      siteUrl: z.string(),
      researchLanguage: z.string(),
      name: z.string(),
      contactEmail: z.string().optional(),
      phase: z.enum([
        "queued",
        "resolving",
        "selection",
        "mapping",
        "scraping",
        "finalizing",
        "completed",
        "failed",
      ]),
      candidateVenues: z.array(
        z.object({
          name: z.string(),
          url: z.string(),
        }),
      ),
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
      seedUrl: args.url,
      siteUrl: getSiteOrigin(args.url),
      researchLanguage: "en",
      name: "",
      phase: "queued",
      candidateVenues: [],
      mappedUrls: [],
      scrapes: [],
      totalScrapes: 0,
      finishedScrapes: 0,
      results: [],
    });

    await firecrawlPool.enqueueAction(
      ctx,
      internal.reports.runReport,
      {
        reportId,
        url: args.url,
      },
      { retry: false },
    );

    return { reportId };
  },
});

export const selectReportVenue = publicMutation({
  args: {
    reportId: zid("reports"),
    venueUrl: z.string().url(),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (report === null || report.phase !== "selection") {
      throw new Error("This research no longer needs a venue selection");
    }

    const selected = report.candidateVenues.find((candidate) => candidate.url === args.venueUrl);
    if (selected === undefined) {
      throw new Error("Choose one of the venues found on the submitted page");
    }

    await ctx.db.patch(args.reportId, {
      url: selected.url,
      name: selected.name,
      candidateVenues: [],
      phase: "queued",
      mappedUrls: [],
      scrapes: [],
      totalScrapes: 0,
      finishedScrapes: 0,
      results: [],
    });
    await firecrawlPool.enqueueAction(
      ctx,
      internal.reports.runReport,
      {
        reportId: args.reportId,
        url: selected.url,
      },
      { retry: false },
    );
    return null;
  },
});

//#endregion Public functions

//#region Private functions

export const setReportPhase = internalMutation({
  args: {
    reportId: v.id("reports"),
    phase: v.union(
      v.literal("queued"),
      v.literal("resolving"),
      v.literal("selection"),
      v.literal("mapping"),
      v.literal("scraping"),
      v.literal("finalizing"),
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

export const setReportTarget = internalMutation({
  args: {
    reportId: v.id("reports"),
    url: v.string(),
    siteUrl: v.string(),
    researchLanguage: v.string(),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (report === null) return null;

    await ctx.db.patch(args.reportId, {
      url: args.url,
      siteUrl: args.siteUrl,
      researchLanguage: args.researchLanguage,
      ...(args.name.trim() && report.name === "" ? { name: args.name.trim() } : {}),
      candidateVenues: [],
    });
    return null;
  },
});

export const setReportCandidates = internalMutation({
  args: {
    reportId: v.id("reports"),
    siteUrl: v.string(),
    researchLanguage: v.string(),
    candidates: v.array(v.object({ name: v.string(), url: v.string() })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (report === null) return null;

    await ctx.db.patch(args.reportId, {
      siteUrl: args.siteUrl,
      researchLanguage: args.researchLanguage,
      candidateVenues: args.candidates,
      phase: "selection",
    });
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
    const allFinished = finishedScrapes === scrapes.length;
    const hasSuccess = scrapes.some((item) => item.phase === "completed");

    await ctx.db.patch(args.reportId, {
      scrapes,
      finishedScrapes,
      ...(allFinished && !hasSuccess
        ? { phase: "failed" as const, error: "All page scrapes failed" }
        : {}),
    });
    return null;
  },
});

export const finalizeReportResearch = internalMutation({
  args: {
    reportId: v.id("reports"),
    name: v.string(),
    contactEmail: v.optional(v.string()),
    results: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        url: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (report === null) return null;

    const contactEmail = args.contactEmail?.trim();
    await ctx.db.patch(args.reportId, {
      name: args.name,
      results: args.results,
      ...(contactEmail ? { contactEmail } : {}),
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
    const collectedPages: ResearchPage[] = [];

    await ctx.runMutation(internal.reports.setReportPhase, {
      reportId: args.reportId,
      phase: "resolving",
    });

    const targetResult = await Result.tryPromise({
      try: () =>
        ctx.runAction(internal.answerDeduplication.resolveVenueTarget, {
          userId: args.reportId,
          url: args.url,
        }),
      catch: getErrorMessage,
    });

    if (targetResult.isErr()) {
      await ctx.runMutation(internal.reports.setReportPhase, {
        reportId: args.reportId,
        phase: "failed",
        error: targetResult.error,
      });
      return null;
    }

    if (targetResult.value.kind === "selection_required") {
      await ctx.runMutation(internal.reports.setReportCandidates, {
        reportId: args.reportId,
        siteUrl: targetResult.value.siteUrl,
        researchLanguage: targetResult.value.language,
        candidates: targetResult.value.candidates,
      });
      return null;
    }

    await ctx.runMutation(internal.reports.setReportTarget, {
      reportId: args.reportId,
      url: targetResult.value.url,
      siteUrl: targetResult.value.siteUrl,
      researchLanguage: targetResult.value.language,
      name: targetResult.value.name,
    });

    const targetUrl = targetResult.value.url;
    const targetName = targetResult.value.name;
    const targetSiteUrl = targetResult.value.siteUrl;
    const researchLanguage = targetResult.value.language;
    const reportResult = await Result.tryPromise({
      try: async () => {
        // Mark the report as mapping before contacting Firecrawl.
        await ctx.runMutation(internal.reports.setReportPhase, {
          reportId: args.reportId,
          phase: "mapping",
        });

        // Map candidate pages, then let the language model rank them for the research brief.
        const mapResult = await firecrawl.map(ctx, targetUrl, {
          limit: limits.maxMappedUrls,
          search: "accessibility access visitor FAQ guest services contact",
          sitemap: "include",
          ignoreQueryParameters: true,
        });
        const candidates = uniqueMappedLinks(mapResult.links).slice(0, limits.maxMappedUrls);
        const mappedUrls: RankedLink[] =
          candidates.length === 0
            ? []
            : await ctx.runAction(internal.urlRanking.rankLinks, {
                userId: args.reportId,
                links: candidates,
                targetName,
                targetUrl,
                siteUrl: targetSiteUrl,
                language: researchLanguage,
              });
        const selectedUrls = selectScrapeUrls(mappedUrls, targetUrl, limits.maxPagesToScrape);
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

        // Fetch selected pages one at a time. The shared Firecrawl workpool
        // serializes reports globally and avoids concurrent browser requests.
        for (let index = 0; index < selectedUrls.length; index += SCRAPE_CONCURRENCY) {
          const batch = selectedUrls.slice(index, index + SCRAPE_CONCURRENCY);
          const batchResults = await Promise.all(
            batch.map(async (link) => ({
              link,
              result: await Result.tryPromise({
                try: () =>
                  scrapeCachedPage(ctx, {
                    url: link.url,
                    profile: "research",
                    options: { onlyMainContent: true, formats: ["markdown", "links"] },
                  }),
                catch: getErrorMessage,
              }),
            })),
          );

          for (const { link, result: scrapeResult } of batchResults) {
            if (scrapeResult.isErr()) {
              await ctx.runMutation(internal.reports.recordReportScrape, {
                reportId: args.reportId,
                url: link.url,
                error: scrapeResult.error,
              });
              continue;
            }

            hasSuccessfulScrape = true;
            collectedPages.push({
              url: link.url,
              content: buildResearchPageContent(scrapeResult.value),
            });
            await ctx.runMutation(internal.reports.recordReportScrape, {
              reportId: args.reportId,
              url: link.url,
            });
          }
        }

        if (selectedUrlCount > 0 && !hasSuccessfulScrape) {
          throw new Error("All selected venue pages failed to load");
        }
        await ctx.runMutation(internal.reports.setReportPhase, {
          reportId: args.reportId,
          phase: "finalizing",
        });

        const extractionResult = await Result.tryPromise({
          try: () =>
            ctx.runAction(internal.answerDeduplication.extractAndDeduplicateAnswers, {
              userId: args.reportId,
              targetName,
              targetUrl,
              siteUrl: targetSiteUrl,
              language: researchLanguage,
              maxResults: limits.maxTotalResults,
              pages: collectedPages,
            }),
          catch: getErrorMessage,
        });
        if (extractionResult.isErr()) throw new Error(extractionResult.error);

        // Persist the consolidated set only after every selected page has been processed.
        await ctx.runMutation(internal.reports.finalizeReportResearch, {
          reportId: args.reportId,
          name: extractionResult.value.name || targetName,
          ...(extractionResult.value.contactEmail
            ? { contactEmail: extractionResult.value.contactEmail }
            : {}),
          results: extractionResult.value.results,
        });

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
  maxMappedUrls: 25,
  maxPagesToScrape: 4,
  maxResultsPerPage: 10,
  maxTotalResults: 10,
};

type RankedLink = {
  url: string;
  title?: string;
  description?: string;
  score: number;
};

type ResearchPage = { url: string; content: string };
const SCRAPE_CONCURRENCY = 1;

function getReportLimits() {
  return {
    maxMappedUrls: readLimit(
      env.REPORT_MAX_MAPPED_URLS,
      DEFAULT_REPORT_LIMITS.maxMappedUrls,
      DEFAULT_REPORT_LIMITS.maxMappedUrls,
    ),
    maxPagesToScrape: readLimit(
      env.REPORT_MAX_PAGES_TO_SCRAPE,
      DEFAULT_REPORT_LIMITS.maxPagesToScrape,
      DEFAULT_REPORT_LIMITS.maxPagesToScrape,
    ),
    maxResultsPerPage: readLimit(
      env.REPORT_MAX_RESULTS_PER_PAGE,
      DEFAULT_REPORT_LIMITS.maxResultsPerPage,
      DEFAULT_REPORT_LIMITS.maxResultsPerPage,
    ),
    maxTotalResults: readLimit(
      env.REPORT_MAX_TOTAL_RESULTS,
      DEFAULT_REPORT_LIMITS.maxTotalResults,
      100,
    ),
  };
}

function readLimit(value: string | undefined, fallback: number, maximum: number) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(maximum, Math.trunc(parsed))) : fallback;
}

function selectScrapeUrls(links: RankedLink[], requestedUrl: string, maxPages: number) {
  if (maxPages <= 0) return [];

  const prioritized = [{ url: canonicalizeUrl(requestedUrl) }, ...links];
  const seen = new Set<string>();

  return prioritized
    .filter((link) => {
      const canonicalUrl = canonicalizeUrl(link.url);
      if (seen.has(canonicalUrl)) return false;
      seen.add(canonicalUrl);
      return true;
    })
    .map((link) => ({ ...link, url: canonicalizeUrl(link.url) }))
    .slice(0, maxPages);
}

function uniqueMappedLinks(links: MapLink[]) {
  const seen = new Set<string>();
  return links.flatMap((link) => {
    const url = canonicalizeUrl(link.url);
    if (seen.has(url)) return [];

    seen.add(url);
    return [{ ...link, url }];
  });
}

function canonicalizeUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();

    if (
      (url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")
    ) {
      url.port = "";
    }

    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/iu.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.searchParams.sort();

    url.pathname = url.pathname.replace(/\/{2,}/gu, "/");
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/u, "");
    return url.toString();
  } catch {
    return value.trim();
  }
}

function getSiteOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim();
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function buildResearchPageContent(page: { markdown?: string; links?: string[] }) {
  const content = [page.markdown, ...(page.links ?? [])]
    .filter((value): value is string => Boolean(value))
    .join("\n");
  if (content.length <= 40_000) return content;
  const half = 20_000;
  return `${content.slice(0, half)}\n\n[page content truncated]\n\n${content.slice(-half)}`;
}

//#endregion Utils
