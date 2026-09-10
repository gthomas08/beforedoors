# Hackathon log

- **Project:** BeforeDoors
- **Event:** Convex All Gas Hackathon
- **What it does:** A web app where someone pastes a venue or event URL and reviews a structured, evidence-first accessibility brief; its Convex backend maps relevant pages and extracts sourced accessibility Q&A.
- **Live app:** not deployed
- **Repo:** https://github.com/gthomas08/beforedoors
- **Frontend:** not deployed
- **Convex deployment:** not deployed
- **Components:** none
- **Convex features:** schema, tables, queries, mutations, actions, scheduled functions, realtime queries
- **Auth:** none
- **AI models:** none
- **Started:** 2026-09-02T18:35:17Z
- **Last updated:** 2026-09-10T21:17:52Z

## Log

### 2026-09-02 - 7d404f2

Initialized the Better T Stack application with a TanStack Router web frontend and Convex backend. Added the initial Convex schema and health-check query, plus the frontend health-status view (`packages/backend/convex/schema.ts`, `packages/backend/convex/healthCheck.ts`, `apps/web/src/routes/index.tsx`). Convex features: schema, query, realtime query.

### 2026-09-02 - b03a277

Simplified the workspace by moving shadcn/ui components, styles, utilities, and hooks into `apps/web/src`, and removing the separate UI and config packages. The Convex backend behavior was unchanged.

### 2026-09-02 - a62cc70

Moved web environment validation into `apps/web/src/env.ts` and removed the standalone env package. The web app continues to connect to Convex through `VITE_CONVEX_URL`; no new Convex backend behavior was added.

### 2026-09-04 - bc16984

Rebranded the status page as BeforeDoors and documented the product and Access Field Guide design system. Replaced the scaffold banner and rounded health panel with a responsive diagnostic receipt that preserves the live Convex `healthCheck` query and separates confirmed connection state from unverified integrations (`apps/web/src/routes/index.tsx`, `apps/web/src/components/header.tsx`, `apps/web/src/routes/__root.tsx`, `apps/web/src/styles/globals.css`, `PRODUCT.md`, `DESIGN.md`). Convex features: realtime query.

### 2026-09-05 - 2a4f628

Replaced the root diagnostic landing with a focused venue or event URL intake form using TanStack Form. Moved the live Convex health status to `/status`, added the D1B Trailhead visual system with warm paper, contour lines, evergreen ink, and a bright orange route, and centralized the shared light/dark tokens so both routes use the same theme (`apps/web/src/routes/index.tsx`, `apps/web/src/routes/status.tsx`, `apps/web/src/styles.css`, `DESIGN.md`). Valid URL submission is still a native confirmation placeholder; no research mutation exists yet. Convex features: realtime query.

### 2026-09-06 - 0890de4

Added the first structured `/report` route and connected the landing URL form to it. The report reads demo JSON and presents five accessibility categories with core questions, additional findings, evidence excerpts, explicit unknown states, and contextual Method and Share controls; the shared trailhead surface and header now span the app (`apps/web/src/routes/report.tsx`, `apps/web/src/components/report-page.tsx`, `apps/web/src/data/demo-report.json`, `apps/web/src/components/header.tsx`). Convex features: the existing realtime health query remains on `/status`; no research backend or live crawler is connected yet.

### 2026-09-06 - c77d68b

Replaced the category-based report with a flat Q&A list showing only venue-sourced answers, compact status/source disclosure, and a provenance note. Added a sixth accessibility question to exercise longer answers and extracted the report contour artwork into its own component; the report remains demo data and the existing Convex health query remains the only backend feature (`apps/web/src/components/report-page.tsx`, `apps/web/src/data/demo-report.json`, `apps/web/src/components/report-contour-lines.tsx`, `apps/web/src/routes/report.tsx`). Convex features: realtime query; no research backend or live crawler is connected yet.

### 2026-09-09 - 1167107

Added a responsive `/reports` index for saved accessibility briefs, with evidence summaries, provenance metadata, and navigation into individual reports. The page remains backed by demo data while the live report workflow is developed (`apps/web/src/components/reports-page.tsx`, `apps/web/src/routes/reports.tsx`, `apps/web/src/components/header.tsx`).

### 2026-09-10 - d0404cf

Added the backend MVP for generating accessibility reports. `startReport` creates a report and schedules `runReport`, which maps up to 100 URLs, ranks accessibility-related pages, scrapes up to five pages, extracts up to 10 sourced Q&A pairs with Zod, and records progress and failures (`packages/backend/convex/reports.ts`, `packages/backend/convex/schema.ts`). Registered the Firecrawl Convex integration with typed API-key configuration (`packages/backend/convex/convex.config.ts`). Convex features: schema, table, query, mutation, action, scheduled function.
