import { defineApp } from "convex/server";
import { v } from "convex/values";
import firecrawl from "@firecrawl/firecrawl-convex/convex.config";

const app = defineApp({
  env: {
    FIRECRAWL_API_KEY: v.string(),
    REPORT_MAX_MAPPED_URLS: v.optional(v.string()),
    REPORT_MAX_PAGES_TO_SCRAPE: v.optional(v.string()),
    REPORT_MAX_RESULTS_PER_PAGE: v.optional(v.string()),
    REPORT_MAX_TOTAL_RESULTS: v.optional(v.string()),
  },
});

app.use(firecrawl, {
  env: {
    FIRECRAWL_API_KEY: app.env.FIRECRAWL_API_KEY,
  },
});

export default app;
