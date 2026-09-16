/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_firecrawl from "../lib/firecrawl.js";
import type * as lib_pagination from "../lib/pagination.js";
import type * as reports from "../reports.js";
import type * as users from "../users.js";
import type * as venueQuestions from "../venueQuestions.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  healthCheck: typeof healthCheck;
  http: typeof http;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/firecrawl": typeof lib_firecrawl;
  "lib/pagination": typeof lib_pagination;
  reports: typeof reports;
  users: typeof users;
  venueQuestions: typeof venueQuestions;
  venues: typeof venues;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  auth: import("@convex-dev/auth/core/_generated/component.js").ComponentApi<"auth">;
  authPasswordProvider: import("@convex-dev/auth/providers/password/_generated/component.js").ComponentApi<"authPasswordProvider">;
  authUsername: import("@convex-dev/auth/username/_generated/component.js").ComponentApi<"authUsername">;
  firecrawl: import("@firecrawl/firecrawl-convex/_generated/component.js").ComponentApi<"firecrawl">;
  agentmail: import("../components/agentmail/_generated/component.js").ComponentApi<"agentmail">;
};
