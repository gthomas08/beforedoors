# Hackathon log

- **Project:** BeforeDoors
- **Event:** Convex All Gas Hackathon
- **What it does:** A web app where people submit venue URLs, follow Convex research progress, search sourced accessibility Q&A, review reports, ask authenticated venue-specific questions, and view replies; the backend uses Firecrawl to map relevant pages and extract answers, while AgentMail handles venue inquiries.
- **Live app:** not deployed
- **Repo:** https://github.com/gthomas08/beforedoors
- **Frontend:** Convex static hosting
- **Convex deployment:** not deployed
- **Components:** @convex-dev/agent, @convex-dev/auth, @convex-dev/static-hosting, @convex-dev/workpool
- **Convex features:** authentication, components, schema, tables, indexes, full-text search, queries, mutations, actions, HTTP actions, scheduled functions, realtime queries, paginated queries, queued background work, static hosting, AgentMail webhooks
- **Auth:** Convex Auth
- **AI models:** gpt-5.6-luna
- **Started:** 2026-09-02T18:35:17Z
- **Last updated:** 2026-09-20T19:27:20Z

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

### 2026-09-12 - a38bf06

Connected venue research to the Convex backend. Submitting a URL starts a report; `/report` displays queued, mapping, and scraping progress before showing the saved venue Q&A. Reports are saved as URL-keyed venues, with public lookup by URL and a paginated venue list. Report limits can be configured with `REPORT_*` environment variables and retain their existing defaults. Registered the Firecrawl Convex component and added a reusable pagination helper (`packages/backend/convex/reports.ts`, `packages/backend/convex/venues.ts`, `packages/backend/convex/lib/pagination.ts`, `packages/backend/convex/convex.config.ts`, `apps/web/src/routes/index.tsx`, `apps/web/src/routes/report.tsx`, `apps/web/src/routes/venues.tsx`). Convex features: component, tables, indexes, queries, mutations, actions, scheduled functions, realtime queries, paginated queries.

### 2026-09-13 - 0cfc8a3

Added username/password sign-in with Convex Auth, authenticated query/mutation
wrappers, and a current-user query. The header offers sign-in/sign-up controls,
and `/account` shows account details. Improved loading/error handling on venue
and report views, added venue Q&A search, refined shared UI/Tailwind classes,
and enabled React Doctor rules in Oxlint. Documented frontend conditional
rendering and backend function-region conventions (`packages/backend/convex/auth.config.ts`,
`packages/backend/convex/lib/customFunctions.ts`, `packages/backend/convex/users.ts`,
`apps/web/src/components/auth-controls.tsx`, `apps/web/src/routes/account.tsx`,
`apps/web/src/components/report-page.tsx`, `.oxlintrc.json`,
`apps/web/AGENTS.md`, `packages/backend/AGENTS.md`). Convex features:
authentication, authenticated queries and mutations.

### 2026-09-14 - c8335cb

Added venue-scoped full-text search for accessibility questions and answers. Convex indexes each saved answer's question and answer, and a reactive query returns up to five matches for the dialog; keyboard selection jumps to the chosen answer (`packages/backend/convex/schema.ts`, `packages/backend/convex/venues.ts`, `apps/web/src/components/report-page.tsx`). Convex features: full-text search.

### 2026-09-16 - 630daf6

Added an authenticated venue-question workflow with a TanStack Form, distinct question fields, a read-only email preview, and delivery/reply states on `/ask-venue`. The backend persists requests, queues mail through the registered local AgentMail component, tracks delivery, validates the AgentMail webhook, and exposes replies through a reactive query (`apps/web/src/components/ask-venue-page.tsx`, `apps/web/src/routes/ask-venue.tsx`, `packages/backend/convex/venueQuestions.ts`, `packages/backend/convex/http.ts`, `packages/backend/convex/convex.config.ts`). Convex features: authenticated query and mutation, component, tables, indexes, HTTP action, webhook handling, and realtime query.

### 2026-09-17 - b0489b8

Expanded the private account record with required usernames, paginated sent and received venue-question threads, delivery and reply states, account filters, and a paginated list of user-saved venues. Added a `venueFavorites` junction table with authenticated Convex query and mutation APIs; venue reports can save or remove venues, and the account list links back to sourced reports (`packages/backend/convex/favorites.ts`, `packages/backend/convex/schema.ts`, `packages/backend/convex/venueQuestions.ts`, `packages/backend/convex/users.ts`, `apps/web/src/routes/account.tsx`, `apps/web/src/components/report-page.tsx`). Convex features: authenticated queries and mutations, schema, table, indexes, paginated queries, and realtime queries. Also upgraded the workspace to Convex 1.46.0 and excluded nested generated Convex code from lint and format checks.

### 2026-09-20 - 0791bc9

Turned research into a venue-specific, language-aware workflow that resolves a canonical target, ranks candidate pages with `gpt-5.6-luna` through the Convex Agent component, caches and queues Firecrawl work with Workpool, validates and deduplicates extracted answers, and reports finalization progress (`packages/backend/convex/reports.ts`, `packages/backend/convex/urlRanking.ts`, `packages/backend/convex/answerDeduplication.ts`, `packages/backend/convex/researchPageCache.ts`).

Made contact email optional, added AgentMail reply extraction into confirmed venue answers, and shipped indexed venue search plus paginated favorites and email activity (`packages/backend/convex/venueReplyExtraction.ts`, `packages/backend/convex/venueQuestions.ts`, `packages/backend/convex/venues.ts`, `packages/backend/convex/schema.ts`). Unified the responsive frontend with shared page heroes, clearer answer states, and consistent filters, then registered Convex static hosting and added public social metadata (`apps/web/src/components/page-hero.tsx`, `apps/web/src/components/answer-status.ts`, `packages/backend/convex/convex.config.ts`, `apps/web/src/lib/site-meta.ts`).
