import { paginationOptsValidator } from "convex/server";
import { zid } from "convex-helpers/server/zod4";
import { convexToZod } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod";

import { authMutation, authQuery } from "./lib/customFunctions";
import { paginationResultSchema } from "./lib/pagination";

const favoriteStateSchema = z.object({
  isFavorite: z.boolean(),
});

const favoriteVenueValidator = v.object({
  _id: v.id("venueFavorites"),
  _creationTime: v.number(),
  venueId: v.id("venues"),
  name: v.string(),
  url: v.string(),
  updatedAt: v.number(),
  answerCount: v.number(),
  publishedCount: v.number(),
  confirmedCount: v.number(),
});

export const listMyFavoriteVenues = authQuery({
  args: { paginationOpts: convexToZod(paginationOptsValidator) },
  returns: paginationResultSchema(favoriteVenueValidator),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("venueFavorites")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const favoriteVenues = [];
    for (const favorite of page.page) {
      const venue = await ctx.db.get("venues", favorite.venueId);
      if (venue === null) continue;

      favoriteVenues.push({
        _id: favorite._id,
        _creationTime: favorite._creationTime,
        venueId: venue._id,
        name: venue.name,
        url: venue.url,
        updatedAt: venue.updatedAt,
        answerCount: venue.answerCount,
        publishedCount: venue.publishedCount,
        confirmedCount: venue.confirmedCount,
      });
    }

    return { ...page, page: favoriteVenues };
  },
});

export const getVenueFavorite = authQuery({
  args: { venueId: zid("venues") },
  returns: favoriteStateSchema,
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("venueFavorites")
      .withIndex("by_user_and_venue", (q) => q.eq("userId", ctx.userId).eq("venueId", args.venueId))
      .unique();

    return { isFavorite: favorite !== null };
  },
});

export const setVenueFavorite = authMutation({
  args: {
    venueId: zid("venues"),
    isFavorite: z.boolean(),
  },
  returns: favoriteStateSchema,
  handler: async (ctx, args) => {
    const venue = await ctx.db.get("venues", args.venueId);
    if (venue === null) throw new Error("Venue not found");

    const favorite = await ctx.db
      .query("venueFavorites")
      .withIndex("by_user_and_venue", (q) => q.eq("userId", ctx.userId).eq("venueId", args.venueId))
      .unique();

    if (args.isFavorite && favorite === null) {
      await ctx.db.insert("venueFavorites", {
        userId: ctx.userId,
        venueId: args.venueId,
      });
    } else if (!args.isFavorite && favorite !== null) {
      await ctx.db.delete("venueFavorites", favorite._id);
    }

    return { isFavorite: args.isFavorite };
  },
});
