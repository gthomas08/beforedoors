import { useState } from "react";
import { toast } from "sonner";

import Header from "@/components/header";
import { ReportContourLines } from "@/components/report-contour-lines";
import { TrailheadSurface } from "@/components/trailhead-surface";

export type EvidenceStatus =
  | "Published by venue"
  | "Confirmed by venue"
  | "Confirmed by attendee"
  | "Unknown"
  | "Conflicting";

export interface EvidenceRecord {
  source: string;
  date: string;
  excerpt: string;
}

export interface ReportQuestion {
  id: string;
  question: string;
  answer: string;
  status: EvidenceStatus;
  evidence?: EvidenceRecord;
}

export interface AccessibilityReport {
  mode: "demo";
  event: {
    name: string;
    date: string;
    location: string;
    mapRef: string;
    briefId: string;
    version: string;
  };
  provenance: {
    label: string;
    updated: string;
  };
  questions: ReportQuestion[];
}

function StatusLabel({ status }: { status: EvidenceStatus }) {
  const tone =
    status === "Unknown" || status === "Conflicting"
      ? "text-[var(--app-accent-hover)]"
      : status === "Confirmed by attendee"
        ? "text-[var(--app-muted)]"
        : "text-[var(--app-ink)]";

  return <span className={`text-[0.72rem] leading-[1.35] font-semibold ${tone}`}>{status}</span>;
}

function StatusIndicator({ status }: { status: EvidenceStatus }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)]" />
      <StatusLabel status={status} />
    </span>
  );
}

function EvidenceDetails({
  evidence,
  status,
  isOpen,
  onToggle,
  panelId,
}: {
  evidence: EvidenceRecord;
  status: EvidenceStatus;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <>
      <div className="flex min-w-0 items-start justify-end max-[900px]:mt-0.5 max-[900px]:justify-start">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-[var(--app-ink)] underline decoration-[var(--app-accent)] decoration-1 underline-offset-4 hover:text-[var(--app-accent-hover)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4"
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <StatusIndicator status={status} />
        </button>
      </div>
      {isOpen ? (
        <div
          id={panelId}
          className="col-span-2 col-start-2 min-w-0 border-t border-[var(--app-line)] pt-2 text-left max-[900px]:col-span-full max-[900px]:col-start-1"
          role="note"
        >
          <div className="grid gap-0.5 font-mono text-[0.66rem] leading-[1.35] text-[var(--app-muted)] sm:grid-cols-[auto_1fr] sm:gap-x-3">
            <span className="font-semibold text-[var(--app-ink)]">{evidence.source}</span>
            <span>{evidence.date}</span>
          </div>
          <p className="mt-1.5 mb-0 max-w-[100ch] font-mono text-[0.7rem] leading-[1.4] text-[var(--app-field-ink)]">
            “{evidence.excerpt}”
          </p>
        </div>
      ) : null}
    </>
  );
}

function QuestionRow({
  question,
  isEvidenceOpen,
  onToggleEvidence,
}: {
  question: ReportQuestion;
  isEvidenceOpen: boolean;
  onToggleEvidence: () => void;
}) {
  const evidencePanelId = `evidence-${question.id}`;

  return (
    <li className="border-b border-[var(--app-line)] px-8 py-4 last:border-b-0 max-[680px]:px-4 max-[680px]:py-4">
      <article className="grid grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.5fr)_minmax(13rem,0.8fr)] gap-4 max-[900px]:grid-cols-1 max-[900px]:gap-2">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 font-mono text-[0.72rem] font-bold tracking-[0.12em] text-[var(--app-accent-hover)]"
          >
            Q
          </span>
          <h2 className="m-0 max-w-none text-[clamp(0.95rem,1.8vw,1.25rem)] leading-[1.15] font-semibold tracking-[-0.03em] max-[900px]:text-[0.95rem]">
            {question.question}
          </h2>
        </div>

        <div className="min-w-0">
          <p className="m-0 max-w-[64ch] text-[0.92rem] leading-[1.5]">{question.answer}</p>
        </div>

        {question.evidence ? (
          <EvidenceDetails
            evidence={question.evidence}
            status={question.status}
            isOpen={isEvidenceOpen}
            onToggle={onToggleEvidence}
            panelId={evidencePanelId}
          />
        ) : (
          <div className="flex min-w-0 items-start justify-end max-[900px]:mt-0.5 max-[900px]:justify-start">
            <StatusIndicator status={question.status} />
          </div>
        )}
      </article>
    </li>
  );
}

export function AccessibilityReportPage({ report }: { report: AccessibilityReport }) {
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);

  const handleShare = async () => {
    const shareData = {
      title: `${report.event.name} · BeforeDoors`,
      text: "Accessibility answers from BeforeDoors",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Brief link copied");
    } catch {
      toast.error("Copy this page’s URL to share the brief");
    }
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-ink)]">
      <Header alignment="report" variant="report" onShare={() => void handleShare()} />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-[var(--app-bg)] px-5 pb-12 max-[680px]:px-0">
        <TrailheadSurface />
        <div className="relative z-[1] mx-auto w-full max-w-[88rem] border-x border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))] max-[680px]:border-x-0">
          <header className="relative isolate flex min-h-44 items-end justify-between gap-5 border-b border-[var(--app-line)] px-8 pt-10 pb-8 max-[760px]:items-start max-[760px]:flex-col max-[680px]:min-h-[13rem] max-[680px]:px-4 max-[680px]:py-8">
            <div className="relative z-10 min-w-0">
              <h1 className="m-0 max-w-none text-[clamp(2.75rem,6vw,5rem)] leading-[0.92] font-semibold tracking-[-0.05em] min-[1280px]:whitespace-nowrap max-[680px]:text-[clamp(2.4rem,13vw,4rem)]">
                {report.event.name}
              </h1>
              <p className="mt-4 mb-0 font-mono text-[clamp(0.8rem,1.3vw,1rem)] leading-6">
                {report.event.date} <span aria-hidden="true">·</span> {report.event.location}
              </p>
            </div>
            <p className="z-10 m-0 max-w-[15rem] shrink-0 font-mono text-[0.72rem] leading-[1.5] text-[var(--app-muted)] max-[760px]:mt-4">
              {report.provenance.label}
              <br />
              <strong className="font-semibold text-[var(--app-accent-hover)]">
                {report.provenance.updated}
              </strong>
            </p>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[-1] w-[48%] max-[680px]:inset-0 max-[680px]:w-full max-[680px]:opacity-60">
              <ReportContourLines />
            </div>
          </header>

          <div
            className="border-b border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-bg))] px-8 py-2.5 text-xs max-[680px]:px-4"
            role="status"
          >
            <p className="m-0 text-[var(--app-muted)]">
              Demo data · live crawling is not connected yet.
            </p>
          </div>

          {report.questions.length ? (
            <ol className="m-0 list-none p-0" aria-label="Venue answers">
              {report.questions.map((question) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  isEvidenceOpen={openSourceId === question.id}
                  onToggleEvidence={() =>
                    setOpenSourceId((currentId) => (currentId === question.id ? null : question.id))
                  }
                />
              ))}
            </ol>
          ) : (
            <div className="px-8 py-12 max-[680px]:px-4">
              <h2 className="m-0 text-[1.35rem] tracking-[-0.025em]">No venue answers yet</h2>
              <p className="mt-3 mb-0 max-w-[55ch] text-[0.9rem] leading-[1.65] text-[var(--app-muted)]">
                We’ll show a question here when the venue provides a sourced answer.
              </p>
            </div>
          )}

          <aside className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-t border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-field)_70%,var(--app-accent)_4%)] px-8 py-3.5 max-[680px]:px-4">
            <p className="m-0 text-[0.78rem] leading-[1.45] text-[var(--app-muted)]">
              Only sourced answers are shown. Missing information is not a no.
            </p>
            <p className="m-0 font-mono text-[0.68rem] leading-[1.4] text-[var(--app-muted)]">
              {report.questions.length} {report.questions.length === 1 ? "answer" : "answers"} ·
              from venue information
            </p>
          </aside>

          <footer className="flex justify-between gap-4 border-t border-[var(--app-line)] px-8 py-3.5 font-mono text-[0.68rem] leading-[1.5] text-[var(--app-muted)] max-[680px]:flex-col max-[680px]:px-4">
            <span>BeforeDoors · Know before you go</span>
            <span>Answers carry their source</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
