import { paginationOptsValidator } from "convex/server";
import { convexToZod, zid } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod";
import { internalMutation } from "./_generated/server";
import { publicQuery } from "./lib/customFunctions";
import { paginationResultSchema } from "./lib/pagination";

//#region Public functions

export const getVenueByUrl = publicQuery({
  args: { url: z.string() },
  returns: z.object({
    venue: z
      .object({
        _id: zid("venues"),
        _creationTime: z.number(),
        url: z.string(),
        name: z.string(),
        updatedAt: z.number(),
        results: z.array(
          z.object({
            question: z.string(),
            answer: z.string(),
            url: z.string(),
            status: z.enum(["published", "confirmed"]),
          }),
        ),
      })
      .nullable(),
  }),
  handler: async (ctx, args) => {
    const venue = await ctx.db
      .query("venues")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();
    return { venue };
  },
});

export const listVenues = publicQuery({
  args: { paginationOpts: convexToZod(paginationOptsValidator) },
  returns: paginationResultSchema(
    v.object({
      _id: v.id("venues"),
      _creationTime: v.number(),
      url: v.string(),
      name: v.string(),
      updatedAt: v.number(),
      results: v.array(
        v.object({
          question: v.string(),
          answer: v.string(),
          url: v.string(),
          status: v.union(v.literal("published"), v.literal("confirmed")),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.query("venues").order("desc").paginate(args.paginationOpts);
  },
});

//#endregion Public functions

//#region Internal functions

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
    const updatedAt = Date.now();

    if (venue === null) {
      await ctx.db.insert("venues", { url: report.url, name, results, updatedAt });
    } else {
      await ctx.db.patch("venues", venue._id, { name, results, updatedAt });
    }

    return null;
  },
});

//#endregion Internal functions
