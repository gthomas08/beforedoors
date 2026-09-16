import { defineApp } from "convex/server";
import { v } from "convex/values";
import agentmail from "./components/agentmail/convex.config.js";
import auth from "@convex-dev/auth/core/convex.config.js";
import firecrawl from "@firecrawl/firecrawl-convex/convex.config";
import passwordProvider from "@convex-dev/auth/providers/password/convex.config.js";
import username from "@convex-dev/auth/username/convex.config.js";

const app = defineApp({
  env: {
    AUTH_PRIVATE_KEY: v.string(),
    AUTH_JWKS: v.string(),
    FIRECRAWL_API_KEY: v.string(),
    REPORT_MAX_MAPPED_URLS: v.optional(v.string()),
    REPORT_MAX_PAGES_TO_SCRAPE: v.optional(v.string()),
    REPORT_MAX_RESULTS_PER_PAGE: v.optional(v.string()),
    REPORT_MAX_TOTAL_RESULTS: v.optional(v.string()),
    AGENTMAIL_API_KEY: v.string(),
    AGENTMAIL_WEBHOOK_SECRET: v.string(),
    AGENTMAIL_BASE_URL: v.optional(v.string()),
    BEFOREDOORS_EMAIL: v.optional(v.string()),
    TEST_VENUE_EMAIL: v.optional(v.string()),
  },
});

app.use(auth, {
  httpPrefix: "/auth",
  env: {
    AUTH_PRIVATE_KEY: app.env.AUTH_PRIVATE_KEY,
    AUTH_JWKS: app.env.AUTH_JWKS,
  },
});
app.use(passwordProvider);
app.use(username);

app.use(firecrawl, {
  env: {
    FIRECRAWL_API_KEY: app.env.FIRECRAWL_API_KEY,
  },
});

app.use(agentmail, {
  env: {
    AGENTMAIL_API_KEY: app.env.AGENTMAIL_API_KEY,
    AGENTMAIL_BASE_URL: app.env.AGENTMAIL_BASE_URL,
  },
});

export default app;
