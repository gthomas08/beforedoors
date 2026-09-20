import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { convexToZod, zid } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { publicQuery } from "./lib/customFunctions";
import { paginationResultSchema } from "./lib/pagination";
import { deduplicateResearchResults, researchResultKey } from "./lib/researchResults";

const venueAnswerSchema = z.object({
  answerIndex: z.number(),
  question: z.string(),
  answer: z.string(),
  url: z.string(),
  status: z.enum(["published", "confirmed"]),
});

const venueSummaryValidator = v.object({
  _id: v.id("venues"),
  _creationTime: v.number(),
  url: v.string(),
  name: v.string(),
  contactEmail: v.optional(v.string()),
  updatedAt: v.number(),
  answerCount: v.number(),
  publishedCount: v.number(),
  confirmedCount: v.number(),
});
const venueSummarySchema = convexToZod(venueSummaryValidator);

// Public functions

export const getVenueByUrl = publicQuery({
  args: { url: z.string() },
  returns: z.object({
    venue: venueSummarySchema.extend({ answers: z.array(venueAnswerSchema) }).nullable(),
  }),
  handler: async (ctx, args) => {
    const venue = await ctx.db
      .query("venues")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();
    if (venue === null) return { venue: null };

    const answerRows =
      venue.answerCount > 0
        ? await ctx.db
            .query("venueAnswers")
            .withIndex("by_venue_and_answer_index", (q) => q.eq("venueId", venue._id))
            .order("asc")
            .take(venue.answerCount)
        : [];
    const answers = answerRows.map(({ answerIndex, question, answer, url, status }) => ({
      answerIndex,
      question,
      answer,
      url,
      status,
    }));

    return {
      venue: {
        _id: venue._id,
        _creationTime: venue._creationTime,
        url: venue.url,
        name: venue.name,
        contactEmail: venue.contactEmail,
        updatedAt: venue.updatedAt,
        answerCount: venue.answerCount,
        publishedCount: venue.publishedCount,
        confirmedCount: venue.confirmedCount,
        answers,
      },
    };
  },
});

export const searchVenueAnswers = publicQuery({
  args: {
    venueId: zid("venues"),
    searchTerm: z.string().min(1).max(200),
  },
  returns: z.object({ results: z.array(venueAnswerSchema) }),
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.trim();
    if (searchTerm.length === 0) return { results: [] };

    const results = await ctx.db
      .query("venueAnswers")
      .withSearchIndex("search_text", (q) =>
        q.search("searchText", searchTerm).eq("venueId", args.venueId),
      )
      .take(5);

    return {
      results: results.map(({ answerIndex, question, answer, url, status }) => ({
        answerIndex,
        question,
        answer,
        url,
        status,
      })),
    };
  },
});

export const listVenues = publicQuery({
  args: {
    paginationOpts: convexToZod(paginationOptsValidator),
    searchTerm: z.string().max(200).optional(),
  },
  returns: paginationResultSchema(venueSummaryValidator),
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm?.trim() ?? "";
    if (searchTerm.length > 0) {
      const searchPage = await ctx.db
        .query("venueSearch")
        .withSearchIndex("search_text", (q) => q.search("searchText", searchTerm))
        .paginate(args.paginationOpts);
      const searchVenues = await Promise.all(
        searchPage.page.map((entry) => ctx.db.get("venues", entry.venueId)),
      );

      return {
        ...searchPage,
        page: searchVenues
          .filter((venue): venue is Doc<"venues"> => venue !== null)
          .map(toVenueSummary),
      };
    }

    const page = await ctx.db.query("venues").order("desc").paginate(args.paginationOpts);
    return {
      ...page,
      page: page.page.map(toVenueSummary),
    };
  },
});

//#region Private functions

export const getVenueValidationInput = internalQuery({
  args: { venueId: v.id("venues") },
  returns: v.union(
    v.null(),
    v.object({
      venueId: v.id("venues"),
      url: v.string(),
      answers: v.array(
        v.object({
          answerIndex: v.number(),
          question: v.string(),
          answer: v.string(),
          url: v.string(),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const venue = await ctx.db.get("venues", args.venueId);
    if (venue === null) return null;

    const answers = await ctx.db
      .query("venueAnswers")
      .withIndex("by_venue_and_answer_index", (q) => q.eq("venueId", venue._id))
      .order("asc")
      .take(1001);
    if (answers.length > 1000) {
      throw new Error(`Venue ${venue._id} exceeds the supported answer count`);
    }

    return {
      venueId: venue._id,
      url: venue.url,
      answers: answers
        .filter((answer) => answer.status === "published")
        .map(({ answerIndex, question, answer, url }) => ({
          answerIndex,
          question,
          answer,
          url,
        })),
    };
  },
});

export const listVenueValidationPage = internalQuery({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(
    v.object({
      _id: v.id("venues"),
      url: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("venues").order("asc").paginate(args.paginationOpts);
    return {
      ...page,
      page: page.page.map(({ _id, url }) => ({ _id, url })),
    };
  },
});

export const applyVenueValidation = internalMutation({
  args: {
    venueId: v.id("venues"),
    results: v.array(
      v.object({
        answerIndex: v.number(),
        question: v.string(),
        answer: v.string(),
        url: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const venue = await ctx.db.get("venues", args.venueId);
    if (venue === null) return null;

    const existingRows = await ctx.db
      .query("venueAnswers")
      .withIndex("by_venue_and_answer_index", (q) => q.eq("venueId", venue._id))
      .order("asc")
      .take(1001);
    if (existingRows.length > 1000) {
      throw new Error(`Venue ${venue._id} exceeds the supported answer count`);
    }

    const publishedByIndex = new Map(
      existingRows.filter((row) => row.status === "published").map((row) => [row.answerIndex, row]),
    );
    const confirmedResults = existingRows
      .filter((row) => row.status === "confirmed")
      .map(({ question, answer, url, language }) => ({
        question,
        answer,
        url,
        language,
        status: "confirmed" as const,
      }));
    const confirmedKeys = new Set(confirmedResults.map(researchResultKey));
    const validatedCandidates = args.results.flatMap((result) => {
      const existing = publishedByIndex.get(result.answerIndex);
      const question = result.question.trim();
      const answer = result.answer.trim();
      if (
        existing === undefined ||
        existing.url !== result.url ||
        question.length === 0 ||
        answer.length === 0
      ) {
        return [];
      }
      return [{ question, answer, url: existing.url, language: existing.language }];
    });
    const languageByResult = new Map(
      validatedCandidates.map((result) => [researchResultKey(result), result.language]),
    );
    const validatedPublished = deduplicateResearchResults(validatedCandidates)
      .map((result) => {
        const language = languageByResult.get(researchResultKey(result));
        if (language === undefined) {
          throw new Error("Validated venue answer is missing its research language");
        }
        return { ...result, language };
      })
      .filter((result) => !confirmedKeys.has(researchResultKey(result)))
      .map((result) => ({ ...result, status: "published" as const }));
    const results = [...validatedPublished, ...confirmedResults];
    const counts = countAnswerStatuses(results);

    await ctx.db.patch(args.venueId, {
      answerCount: results.length,
      ...counts,
      updatedAt: Date.now(),
    });
    await replaceVenueAnswerRows(ctx, args.venueId, results);
    return null;
  },
});

export const saveReportToVenues = internalMutation({
  args: { reportId: v.id("reports") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (
      report === null ||
      (report.name === "" && report.results.length === 0 && !report.contactEmail?.trim())
    )
      return null;

    const venue = await ctx.db
      .query("venues")
      .withIndex("by_url", (q) => q.eq("url", report.url))
      .unique();
    const name = report.name || venue?.name || "";
    const previousRows =
      venue === null
        ? []
        : await ctx.db
            .query("venueAnswers")
            .withIndex("by_venue_and_answer_index", (q) => q.eq("venueId", venue._id))
            .take(1001);
    if (previousRows.length > 1000) {
      throw new Error("Venue exceeds the supported answer count");
    }
    const confirmedResults = previousRows
      .filter((row) => row.status === "confirmed")
      .map(({ question, answer, url, language }) => ({
        question,
        answer,
        url,
        language,
        status: "confirmed" as const,
      }));
    const confirmedKeys = new Set(confirmedResults.map(researchResultKey));
    const publishedResults = deduplicateResearchResults(report.results)
      .filter((result) => !confirmedKeys.has(researchResultKey(result)))
      .map((result) => ({
        ...result,
        language: report.researchLanguage,
        status: "published" as const,
      }));
    const results = [...publishedResults, ...confirmedResults];
    const counts = countAnswerStatuses(results);
    const contactEmail = report.contactEmail?.trim() || venue?.contactEmail?.trim() || undefined;
    const metadata = {
      url: report.url,
      seedUrl: report.seedUrl,
      siteUrl: report.siteUrl,
      researchLanguage: report.researchLanguage,
      name,
      updatedAt: Date.now(),
      answerCount: results.length,
      ...counts,
      ...(contactEmail ? { contactEmail } : {}),
    };
    const venueId =
      venue === null
        ? await ctx.db.insert("venues", metadata)
        : (await ctx.db.replace(venue._id, metadata), venue._id);

    const savedVenue = await ctx.db.get("venues", venueId);
    if (savedVenue !== null) {
      await upsertVenueSearch(ctx, savedVenue);
    }

    await replaceVenueAnswerRows(ctx, venueId, results);
    return null;
  },
});

//#endregion Private functions

// Utilities

function toVenueSummary(venue: Doc<"venues">) {
  return {
    _id: venue._id,
    _creationTime: venue._creationTime,
    url: venue.url,
    name: venue.name,
    contactEmail: venue.contactEmail,
    updatedAt: venue.updatedAt,
    answerCount: venue.answerCount,
    publishedCount: venue.publishedCount,
    confirmedCount: venue.confirmedCount,
  };
}

async function upsertVenueSearch(ctx: MutationCtx, venue: Doc<"venues">) {
  const existing = await ctx.db
    .query("venueSearch")
    .withIndex("by_venue_id", (q) => q.eq("venueId", venue._id))
    .unique();
  const searchText = `${venue.name}\n${venue.url}`;

  if (existing === null) {
    await ctx.db.insert("venueSearch", { venueId: venue._id, searchText });
  } else if (existing.searchText !== searchText) {
    await ctx.db.patch(existing._id, { searchText });
  }
}

function countAnswerStatuses(answers: Array<{ status: "published" | "confirmed" }>) {
  let publishedCount = 0;
  let confirmedCount = 0;
  for (const answer of answers) {
    if (answer.status === "published") publishedCount++;
    else confirmedCount++;
  }
  return { publishedCount, confirmedCount };
}

async function replaceVenueAnswerRows(
  ctx: MutationCtx,
  venueId: Id<"venues">,
  results: Array<{
    question: string;
    answer: string;
    url: string;
    language: string;
    status: "published" | "confirmed";
  }>,
) {
  if (results.length > 1000) {
    throw new Error(`Venue ${venueId} exceeds the supported answer count`);
  }

  const previousRows = await ctx.db
    .query("venueAnswers")
    .withIndex("by_venue_and_answer_index", (q) => q.eq("venueId", venueId))
    .take(1001);
  if (previousRows.length > 1000) {
    throw new Error(`Venue ${venueId} exceeds the supported answer count`);
  }

  for (const row of previousRows) {
    await ctx.db.delete("venueAnswers", row._id);
  }

  for (const [answerIndex, result] of results.entries()) {
    await ctx.db.insert("venueAnswers", {
      venueId,
      answerIndex,
      ...result,
      searchText: `${result.question}\n${result.answer}`,
    });
  }
}
