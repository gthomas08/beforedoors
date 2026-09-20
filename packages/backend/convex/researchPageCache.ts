import type { FirecrawlDocument, ScrapeOptions } from "@firecrawl/firecrawl-convex";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery } from "./_generated/server";
import { firecrawl } from "./lib/firecrawl";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_MARKDOWN_CHARS = 80_000;
const MAX_LINKS = 200;

type FirecrawlActionCtx = Parameters<typeof firecrawl.scrape>[0];

export const getPage = internalQuery({
  args: { cacheKey: v.string() },
  returns: v.union(
    v.object({
      cacheKey: v.string(),
      url: v.string(),
      sourceUrl: v.string(),
      markdown: v.string(),
      links: v.array(v.string()),
      scrapedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("researchPageCache")
      .withIndex("by_cache_key", (query) => query.eq("cacheKey", args.cacheKey))
      .unique();
    if (page === null) return null;
    return {
      cacheKey: page.cacheKey,
      url: page.url,
      sourceUrl: page.sourceUrl,
      markdown: page.markdown,
      links: page.links,
      scrapedAt: page.scrapedAt,
    };
  },
});

export const upsertPage = internalMutation({
  args: {
    cacheKey: v.string(),
    url: v.string(),
    sourceUrl: v.string(),
    markdown: v.string(),
    links: v.array(v.string()),
    scrapedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("researchPageCache")
      .withIndex("by_cache_key", (query) => query.eq("cacheKey", args.cacheKey))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("researchPageCache", args);
    }
    return null;
  },
});

export async function scrapeCachedPage(
  ctx: FirecrawlActionCtx,
  args: {
    url: string;
    profile: "research" | "validation";
    options: ScrapeOptions;
  },
): Promise<FirecrawlDocument> {
  const cacheKey = `${args.profile}:${args.url}`;
  const cached = await ctx.runQuery(internal.researchPageCache.getPage, { cacheKey });
  if (cached && Date.now() - cached.scrapedAt <= CACHE_TTL_MS) {
    return {
      markdown: cached.markdown,
      links: cached.links,
      metadata: {
        sourceURL: cached.sourceUrl,
        cacheState: "hit",
      },
    };
  }

  const result = await firecrawl.scrape(ctx, args.url, {
    ...args.options,
    maxAge: CACHE_TTL_MS,
  });
  const markdown =
    typeof result.markdown === "string" ? result.markdown.slice(0, MAX_MARKDOWN_CHARS) : "";
  const links = Array.from(
    new Set((result.links ?? []).filter((link): link is string => typeof link === "string")),
  ).slice(0, MAX_LINKS);
  const sourceUrl = result.metadata?.sourceURL ?? args.url;

  await ctx.runMutation(internal.researchPageCache.upsertPage, {
    cacheKey,
    url: args.url,
    sourceUrl,
    markdown,
    links,
    scrapedAt: Date.now(),
  });

  return result;
}
