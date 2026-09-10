import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  reports: defineTable({
    url: v.string(),
    phase: v.union(
      v.literal("queued"),
      v.literal("mapping"),
      v.literal("scraping"),
      v.literal("completed"),
      v.literal("failed"),
    ),
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
        error: v.optional(v.string()),
      }),
    ),
    totalScrapes: v.number(),
    finishedScrapes: v.number(),
    results: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        url: v.string(),
      }),
    ),
    error: v.optional(v.string()),
  }),
});
