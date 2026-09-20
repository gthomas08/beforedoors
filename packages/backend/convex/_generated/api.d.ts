/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as answerDeduplication from "../answerDeduplication.js";
import type * as auth from "../auth.js";
import type * as favorites from "../favorites.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_firecrawl from "../lib/firecrawl.js";
import type * as lib_pagination from "../lib/pagination.js";
import type * as lib_researchResults from "../lib/researchResults.js";
import type * as reports from "../reports.js";
import type * as researchPageCache from "../researchPageCache.js";
import type * as urlRanking from "../urlRanking.js";
import type * as users from "../users.js";
import type * as venueQuestions from "../venueQuestions.js";
import type * as venueReplyExtraction from "../venueReplyExtraction.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  answerDeduplication: typeof answerDeduplication;
  auth: typeof auth;
  favorites: typeof favorites;
  healthCheck: typeof healthCheck;
  http: typeof http;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/firecrawl": typeof lib_firecrawl;
  "lib/pagination": typeof lib_pagination;
  "lib/researchResults": typeof lib_researchResults;
  reports: typeof reports;
  researchPageCache: typeof researchPageCache;
  urlRanking: typeof urlRanking;
  users: typeof users;
  venueQuestions: typeof venueQuestions;
  venueReplyExtraction: typeof venueReplyExtraction;
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
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  firecrawlPool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"firecrawlPool">;
  firecrawl: import("@firecrawl/firecrawl-convex/_generated/component.js").ComponentApi<"firecrawl">;
  agentmail: import("../components/agentmail/_generated/component.js").ComponentApi<"agentmail">;
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
};
