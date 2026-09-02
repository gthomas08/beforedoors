# Hackathon log

- **Project:** beforedoors
- **Event:** Convex All Gas Hackathon
- **What it does:** A TanStack Router web app that displays the status of a Convex health-check query.
- **Live app:** not deployed
- **Repo:** https://github.com/gthomas08/beforedoors
- **Frontend:** not deployed
- **Convex deployment:** not deployed
- **Components:** none
- **Convex features:** schema, queries, realtime queries
- **Auth:** none
- **AI models:** none
- **Started:** 2026-09-02T18:35:17Z
- **Last updated:** 2026-09-02T18:53:55Z

## Log

### 2026-09-02 - 7d404f2

Initialized the Better T Stack application with a TanStack Router web frontend and Convex backend. Added the initial Convex schema and health-check query, plus the frontend health-status view (`packages/backend/convex/schema.ts`, `packages/backend/convex/healthCheck.ts`, `apps/web/src/routes/index.tsx`). Convex features: schema, query, realtime query.

### 2026-09-02 - b03a277

Simplified the workspace by moving shadcn/ui components, styles, utilities, and hooks into `apps/web/src`, and removing the separate UI and config packages. The Convex backend behavior was unchanged.

### 2026-09-02 - a62cc70

Moved web environment validation into `apps/web/src/env.ts` and removed the standalone env package. The web app continues to connect to Convex through `VITE_CONVEX_URL`; no new Convex backend behavior was added.
