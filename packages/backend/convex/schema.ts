import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
  }),
  reports: defineTable({
    url: v.string(),
    // The URL submitted by the user. `url` becomes the resolved canonical
    // venue page once research identifies the target.
    seedUrl: v.string(),
    siteUrl: v.string(),
    researchLanguage: v.string(),
    name: v.string(),
    contactEmail: v.optional(v.string()),
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
    candidateVenues: v.array(
      v.object({
        name: v.string(),
        url: v.string(),
      }),
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
  venues: defineTable({
    url: v.string(),
    seedUrl: v.string(),
    siteUrl: v.string(),
    researchLanguage: v.string(),
    name: v.string(),
    contactEmail: v.optional(v.string()),
    updatedAt: v.number(),
    answerCount: v.number(),
    publishedCount: v.number(),
    confirmedCount: v.number(),
  }).index("by_url", ["url"]),
  venueSearch: defineTable({
    venueId: v.id("venues"),
    searchText: v.string(),
  })
    .index("by_venue_id", ["venueId"])
    .searchIndex("search_text", { searchField: "searchText" }),
  venueFavorites: defineTable({
    userId: v.id("users"),
    venueId: v.id("venues"),
  })
    .index("by_user_and_venue", ["userId", "venueId"])
    .index("by_user", ["userId"]),
  venueQuestionRequests: defineTable({
    userId: v.id("users"),
    requestKey: v.string(),
    venueName: v.string(),
    venueUrl: v.string(),
    recipientEmail: v.string(),
    questions: v.array(v.string()),
    outboundId: v.string(),
    threadId: v.optional(v.string()),
  })
    .index("by_user_and_request_key", ["userId", "requestKey"])
    .index("by_user_and_venue_url", ["userId", "venueUrl"])
    .index("by_user", ["userId"])
    .index("by_thread_id", ["threadId"]),
  venueReplyExtractions: defineTable({
    requestId: v.id("venueQuestionRequests"),
    messageId: v.string(),
    eventId: v.string(),
    threadId: v.string(),
    from: v.string(),
    subject: v.optional(v.string()),
    body: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("completed"),
      v.literal("skipped"),
      v.literal("failed"),
    ),
    answerCount: v.number(),
    error: v.optional(v.string()),
  })
    .index("by_message_id", ["messageId"])
    .index("by_request_id", ["requestId"]),
  venueAnswers: defineTable({
    venueId: v.id("venues"),
    language: v.string(),
    answerIndex: v.number(),
    question: v.string(),
    answer: v.string(),
    url: v.string(),
    status: v.union(v.literal("published"), v.literal("confirmed")),
    searchText: v.string(),
  })
    .index("by_venue_and_answer_index", ["venueId", "answerIndex"])
    .searchIndex("search_text", {
      searchField: "searchText",
      filterFields: ["venueId"],
    }),
  researchPageCache: defineTable({
    cacheKey: v.string(),
    url: v.string(),
    sourceUrl: v.string(),
    markdown: v.string(),
    links: v.array(v.string()),
    scrapedAt: v.number(),
  }).index("by_cache_key", ["cacheKey"]),
});
