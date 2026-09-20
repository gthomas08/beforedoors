import { Check } from "lucide-react";

import Header from "@/components/header";
import { PageHero } from "@/components/page-hero";
import { TrailheadSurface } from "@/components/trailhead-surface";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

type ResearchPhase = "queued" | "resolving" | "mapping" | "scraping" | "finalizing" | "completed";

const steps: {
  id: Exclude<ResearchPhase, "completed">;
  title: string;
  description: string;
}[] = [
  {
    id: "queued",
    title: "Request received",
    description: "The venue link is in the research queue.",
  },
  {
    id: "resolving",
    title: "Identifying the venue",
    description: "Resolving the specific venue page before checking its site.",
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
  {
    id: "finalizing",
    title: "Preparing your brief",
    description: "Organizing the sourced answers before opening them.",
  },
];

const phaseIndex: Record<Exclude<ResearchPhase, "completed">, number> = {
  queued: 0,
  resolving: 1,
  mapping: 2,
  scraping: 3,
  finalizing: 4,
};

export function PendingReportPage({
  phase,
  totalPages = 0,
  finishedPages = 0,
}: {
  phase: ResearchPhase;
  totalPages?: number;
  finishedPages?: number;
}) {
  const isResearchComplete = phase === "completed";
  const currentIndex = isResearchComplete ? steps.length : phaseIndex[phase];
  const currentStep = isResearchComplete ? { title: "Research complete" } : steps[currentIndex];
  const boundedFinishedPages = Math.min(Math.max(finishedPages, 0), Math.max(totalPages, 0));
  const measuredProgress =
    totalPages > 0 ? Math.round((boundedFinishedPages / totalPages) * 100) : 0;
  const progressPercentage = isResearchComplete ? 100 : measuredProgress;

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header linkToVenues />
      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-0 pb-12 sm:px-5">
        <TrailheadSurface />
        <article className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))]">
          <PageHero
            title={isResearchComplete ? "Research is complete" : "Research is in progress"}
            description={
              isResearchComplete
                ? "The venue’s published information is ready. Opening the sourced answers now."
                : "We’re checking the venue’s own published information and tracking the work as it progresses."
            }
          />

          <section
            className={`border-b px-8 py-6 transition-colors duration-200 motion-reduce:transition-none max-[680px]:px-4 ${
              isResearchComplete
                ? "border-status-verified bg-[color-mix(in_oklch,var(--status-verified)_12%,var(--app-bg))]"
                : "border-(--app-line)"
            }`}
            aria-labelledby="research-status"
          >
            <div
              className="flex items-center gap-2.5 text-sm font-medium text-(--app-ink)"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${
                  isResearchComplete
                    ? "bg-status-verified"
                    : "animate-pulse bg-status-pending motion-reduce:animate-none"
                }`}
              />
              <h2
                id="research-status"
                className={`m-0 text-sm font-medium ${
                  isResearchComplete ? "text-status-verified" : ""
                }`}
              >
                {currentStep.title}
              </h2>
            </div>
          </section>

          <ol className="m-0 list-none p-0" aria-label="Research steps">
            {steps.map((step, index) => {
              const isComplete = isResearchComplete || index < currentIndex;
              const isCurrent = !isResearchComplete && index === currentIndex;
              let progressClassName = "border-(--app-line) text-(--app-muted)";
              if (isComplete) progressClassName = "border-status-verified text-status-verified";
              else if (isCurrent) progressClassName = "border-status-pending text-status-pending";
              const titleClassName =
                isCurrent || isResearchComplete ? "text-(--app-ink)" : "text-(--app-muted)";

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
                  <div className="min-w-0 flex-1">
                    <h3 className={`m-0 text-sm font-semibold ${titleClassName}`}>{step.title}</h3>
                    <p className="mt-1 mb-0 text-xs leading-5 text-(--app-muted)">
                      {step.description}
                    </p>
                    {step.id === "scraping" && isCurrent && (
                      <div className="mt-4 max-w-lg">
                        <Progress
                          value={progressPercentage}
                          aria-valuetext={`${progressPercentage}% complete`}
                          className={`gap-2 **:data-[slot=progress-indicator]:transition-[width,background-color] **:data-[slot=progress-indicator]:duration-200 **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:bg-[color-mix(in_oklch,var(--app-line)_55%,transparent)] ${
                            isResearchComplete
                              ? "**:data-[slot=progress-indicator]:bg-status-verified"
                              : "**:data-[slot=progress-indicator]:bg-status-pending"
                          }`}
                        >
                          <ProgressLabel className="font-mono text-xs font-semibold tracking-[0.08em] text-(--app-muted) uppercase">
                            Overall progress
                          </ProgressLabel>
                          <ProgressValue className="font-mono text-sm font-semibold text-(--app-ink) tabular-nums" />
                        </Progress>
                      </div>
                    )}
                    {step.id === "finalizing" && isCurrent && (
                      <p className="mt-3 mb-0 text-xs leading-5 text-(--app-muted)">
                        Almost ready — opening your sourced brief next.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <footer className="border-t border-(--app-line) bg-[color-mix(in_oklch,var(--app-field)_70%,var(--app-accent)_4%)] px-8 py-3.5 max-[680px]:px-4">
            <p className="m-0 font-mono text-[0.68rem] leading-normal text-(--app-muted)">
              Research status
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}
