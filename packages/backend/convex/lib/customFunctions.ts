import { customCtx, NoOp } from "convex-helpers/server/customFunctions";
import { zCustomMutation, zCustomQuery } from "convex-helpers/server/zod4";
import { getAuthUserId } from "@convex-dev/auth/core";
import { mutation, query, type MutationCtx, type QueryCtx } from "../_generated/server";

export const publicMutation = zCustomMutation(mutation, NoOp);
export const publicQuery = zCustomQuery(query, NoOp);

async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("You must be signed in to call this function");
  }

  const user = await ctx.db.get("users", userId);
  if (user === null) {
    throw new Error("The authenticated user does not exist");
  }

  return { user, userId };
}

const authenticatedQueryContext = customCtx(async (ctx: QueryCtx) => getAuthenticatedUser(ctx));
const authenticatedMutationContext = customCtx(async (ctx: MutationCtx) =>
  getAuthenticatedUser(ctx),
);

export const authQuery = zCustomQuery(query, authenticatedQueryContext);
export const authMutation = zCustomMutation(mutation, authenticatedMutationContext);
