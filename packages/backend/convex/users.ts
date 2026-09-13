import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { zid } from "convex-helpers/server/zod4";
import { z } from "zod/v4";
import { authQuery } from "./lib/customFunctions";

//#region Authenticated functions
export const getCurrentUser = authQuery({
  args: {},
  returns: z.object({
    id: zid("users"),
    username: z.string(),
  }),
  handler: async (ctx) => {
    const username = await ctx.runQuery(components.authUsername.public.getUsername, {
      userId: ctx.userId,
    });

    if (username === null) {
      throw new Error(`User ${ctx.userId} unexpectedly has no username`);
    }

    return { id: ctx.user._id, username };
  },
});
//#endregion Authenticated functions

//#region Private functions
export const createUser = internalMutation({
  args: {
    provider: v.literal("password"),
    providerAccountId: v.string(),
    profile: v.object({ username: v.string() }),
  },
  returns: v.id("users"),
  handler: async (ctx) => ctx.db.insert("users", {}),
});
//#endregion Private functions
