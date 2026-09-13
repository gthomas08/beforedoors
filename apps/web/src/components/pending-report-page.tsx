import { Check } from "lucide-react";

import Header from "@/components/header";
import { TrailheadSurface } from "@/components/trailhead-surface";

type ResearchPhase = "queued" | "mapping" | "scraping";

const steps: {
  id: ResearchPhase;
  title: string;
  description: string;
}[] = [
  {
    id: "queued",
    title: "Request received",
    description: "The venue link is in the research queue.",
  },
  {
    id: "mapping",
    title: "Finding relevant pages",
    description: "Looking for the venue’s own published information.",
  },
  {
    id: "scraping",
    title: "Reading published details",
    description: "Collecting answers with their source pages.",
  },
];

const phaseIndex: Record<ResearchPhase, number> = {
  queued: 0,
  mapping: 1,
  scraping: 2,
};

export function PendingReportPage({ url, phase }: { url: string; phase: ResearchPhase }) {
  const currentIndex = phaseIndex[phase];
  const currentStep = steps[currentIndex];

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header alignment="report" linkToVenues />
      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-5 pb-12 max-[680px]:px-0">
        <TrailheadSurface />
        <article className="relative z-1 mx-auto w-full max-w-176 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))]">
          <header className="border-b border-(--app-line) px-8 py-10 max-[680px]:px-4 max-[680px]:py-8">
            <h1 className="m-0 max-w-[12ch] text-[clamp(2.5rem,8vw,4.25rem)] leading-[0.94] font-semibold tracking-tighter">
              Research is in progress
            </h1>
            <p className="mt-4 mb-0 max-w-[52ch] text-sm leading-6 text-(--app-muted)">
              We’re checking the venue’s own published information and tracking the work as it
              progresses.
            </p>
          </header>

          <section
            className="border-b border-(--app-line) px-8 py-6 max-[680px]:px-4"
            aria-labelledby="research-status"
          >
            <p className="mb-3 font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-(--app-muted) uppercase">
              Venue URL
            </p>
            <p className="m-0 font-mono text-xs leading-5 break-all text-(--app-ink)">{url}</p>
            <div
              className="mt-6 flex items-center gap-2.5 text-sm font-medium text-(--app-ink)"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 animate-pulse rounded-full bg-status-pending motion-reduce:animate-none"
              />
              <h2 id="research-status" className="m-0 text-sm font-medium">
                {currentStep.title}
              </h2>
            </div>
          </section>

          <ol className="m-0 list-none p-0" aria-label="Research steps">
            {steps.map((step, index) => {
              const isComplete = index < currentIndex;
              const isCurrent = index === currentIndex;
              let progressClassName = "border-(--app-line) text-(--app-muted)";
              if (isComplete) progressClassName = "border-status-verified text-status-verified";
              else if (isCurrent) progressClassName = "border-status-pending text-status-pending";
              const titleClassName = isCurrent ? "text-(--app-ink)" : "text-(--app-muted)";

              return (
                <li
                  key={step.id}
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex gap-4 border-b border-(--app-line) px-8 py-5 last:border-b-0 max-[680px]:px-4"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center border ${progressClassName}`}
                  >
                    {isComplete ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
                  </span>
                  <div>
                    <h3 className={`m-0 text-sm font-semibold ${titleClassName}`}>{step.title}</h3>
                    <p className="mt-1 mb-0 text-xs leading-5 text-(--app-muted)">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <footer className="border-t border-(--app-line) bg-[color-mix(in_oklch,var(--app-field)_70%,var(--app-accent)_4%)] px-8 py-3.5 max-[680px]:px-4">
            <p className="m-0 font-mono text-[0.68rem] leading-normal text-(--app-muted)">
              Research status · updates automatically
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}
