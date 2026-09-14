import { paginationOptsValidator } from "convex/server";
import { convexToZod, zid } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { publicQuery } from "./lib/customFunctions";
import { paginationResultSchema } from "./lib/pagination";

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
  args: { paginationOpts: convexToZod(paginationOptsValidator) },
  returns: paginationResultSchema(venueSummaryValidator),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("venues").order("desc").paginate(args.paginationOpts);
    return {
      ...page,
      page: page.page.map((venue) => ({
        _id: venue._id,
        _creationTime: venue._creationTime,
        url: venue.url,
        name: venue.name,
        updatedAt: venue.updatedAt,
        answerCount: venue.answerCount,
        publishedCount: venue.publishedCount,
        confirmedCount: venue.confirmedCount,
      })),
    };
  },
});

export const saveReportToVenues = internalMutation({
  args: { reportId: v.id("reports") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (report === null || (report.name === "" && report.results.length === 0)) return null;

    const venue = await ctx.db
      .query("venues")
      .withIndex("by_url", (q) => q.eq("url", report.url))
      .unique();
    const name = report.name || venue?.name || "";
    const results = report.results.map((result) => ({ ...result, status: "published" as const }));
    const counts = countAnswerStatuses(results);
    const metadata = {
      url: report.url,
      name,
      updatedAt: Date.now(),
      answerCount: results.length,
      ...counts,
    };
    const venueId =
      venue === null
        ? await ctx.db.insert("venues", metadata)
        : (await ctx.db.replace(venue._id, metadata), venue._id);

    await replaceVenueAnswerRows(ctx, venueId, results);
    return null;
  },
});

// Utilities

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
