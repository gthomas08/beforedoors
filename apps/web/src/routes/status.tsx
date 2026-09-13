import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useQuery } from "convex/react";

import Header from "@/components/header";
import { TrailheadSurface } from "@/components/trailhead-surface";

export const Route = createFileRoute("/status")({
  component: StatusComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors · System status",
      },
      {
        name: "description",
        content: "Live connection status for the BeforeDoors development environment.",
      },
    ],
  }),
});

const checkDetails = [
  ["System", "Convex"],
  ["Check", "api.healthCheck.get"],
  ["Expected result", "OK"],
  ["Refresh", "Live query"],
  ["Scope", "Connection only"],
] as const;

const statusStates = {
  checking: {
    label: "Checking",
    code: "PENDING",
    explanation: "Waiting for the live Convex query to respond.",
    signalClass: "bg-status-pending animate-pulse motion-reduce:animate-none",
    textClass: "text-status-pending",
  },
  connected: {
    label: "Connected",
    code: "OK",
    explanation: "The live Convex health query returned OK.",
    signalClass: "bg-status-verified",
    textClass: "text-status-verified",
  },
  error: {
    label: "Error",
    code: "ERROR",
    explanation: "The live Convex health query returned an unexpected result.",
    signalClass: "bg-status-signal",
    textClass: "text-status-signal",
  },
};

function StatusComponent() {
  const healthCheck = useQuery(api.healthCheck.get);
  let state = statusStates.error;
  if (healthCheck === undefined) state = statusStates.checking;
  else if (healthCheck === "OK") state = statusStates.connected;

  return (
    <>
      <div className="grid h-svh grid-rows-[auto_1fr] overflow-hidden bg-(--app-bg) text-(--app-ink)">
        <Header alignment="status" />
        <main className="relative min-h-0 overflow-y-auto bg-(--app-bg) px-5 sm:px-8">
          <TrailheadSurface />
          <article className="relative z-10 mx-auto flex min-h-full w-full max-w-176 flex-col border-x border-(--app-line) bg-(--app-bg)">
            <header className="px-5 py-8 sm:px-8 sm:py-10">
              <h1 className="max-w-[12ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                System status
              </h1>
              <p className="mt-3 max-w-[58ch] text-sm leading-6 text-muted-foreground sm:text-base">
                A live connection check for the BeforeDoors development environment.
              </p>
            </header>

            <section aria-labelledby="connection-status" className="border-y">
              <div className="px-5 py-12 sm:px-8 sm:py-16">
                <div
                  className="flex items-center gap-4"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span
                    aria-hidden="true"
                    className={`size-3 shrink-0 rounded-full ${state.signalClass}`}
                  />
                  <h2
                    id="connection-status"
                    className={`text-[clamp(3.25rem,13vw,6rem)] leading-[0.88] font-semibold tracking-[-0.04em] ${state.textClass}`}
                  >
                    {state.label}
                  </h2>
                </div>
                <p className="mt-6 max-w-[48ch] text-base leading-6 text-foreground">
                  {state.explanation}
                </p>
              </div>

              <dl className="border-t font-mono text-xs tabular-nums">
                {checkDetails.map(([term, description]) => (
                  <div
                    key={term}
                    className="grid min-w-0 grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] border-b last:border-b-0"
                  >
                    <dt className="px-5 py-3 font-medium text-muted-foreground sm:px-8">{term}</dt>
                    <dd className="min-w-0 border-l px-5 py-3 text-right wrap-break-word text-foreground sm:px-8">
                      {description}
                    </dd>
                  </div>
                ))}
                <div className="grid min-w-0 grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] border-t">
                  <dt className="px-5 py-3 font-medium text-muted-foreground sm:px-8">
                    Current result
                  </dt>
                  <dd
                    className={`border-l px-5 py-3 text-right font-semibold sm:px-8 ${state.textClass}`}
                  >
                    {state.code}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="grid gap-8 px-5 py-8 sm:grid-cols-2 sm:px-8 sm:py-10">
              <div>
                <h2 className="text-sm font-medium">What this confirms</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This page confirms whether the client receives the expected response from the
                  Convex health query. It updates with the live query result.
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium">What remains unverified</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This check does not verify Firecrawl, AgentMail, a venue inquiry, or any
                  accessibility evidence.
                </p>
              </div>
            </section>

            <footer className="mt-auto border-t px-5 py-4 text-xs text-muted-foreground sm:px-8">
              Internal diagnostic · BeforeDoors · Know before you go
            </footer>
          </article>
        </main>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </>
  );
}
