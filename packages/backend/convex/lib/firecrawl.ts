import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import { Workpool } from "@convex-dev/workpool";
import { components } from "../_generated/api";

export const firecrawl = new FirecrawlClient(components.firecrawl);

/** A single durable queue serializes Firecrawl work across all app jobs. */
export const firecrawlPool = new Workpool(components.firecrawlPool, {
  maxParallelism: 1,
});
