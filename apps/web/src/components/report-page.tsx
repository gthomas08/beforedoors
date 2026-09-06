import { useState } from "react";
import { toast } from "sonner";

import Header from "@/components/header";
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

export interface ReportClaim {
  id: string;
  label: string;
  claim: string;
  status: EvidenceStatus;
  unknownReason?: string;
  evidence?: EvidenceRecord;
}

export interface ReportCategory {
  id: string;
  number: string;
  name: string;
  preview: string[];
  coreLabel: string;
  coreQuestions: ReportClaim[];
  additionalDetails?: ReportClaim[];
  evidenceNote?: EvidenceRecord;
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
  overview: string;
  provenance: {
    label: string;
    updated: string;
  };
  categories: ReportCategory[];
  method: {
    title: string;
    description: string;
    note: string;
  };
}

function ReportContourLines() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      viewBox="0 0 900 300"
      preserveAspectRatio="none"
    >
      <g fill="none" stroke="#345f4a" strokeWidth="1" opacity="0.16">
        <path d="M0 80c120-64 190 34 290-8s180-56 300 12 230 74 310 5" />
        <path d="M0 112c120-64 190 34 290-8s180-56 300 12 230 74 310 5" />
        <path d="M0 144c120-64 190 34 290-8s180-56 300 12 230 74 310 5" />
        <path d="M460-20c-30 74 70 116 26 190s10 104 92 132 38 82-8 120" />
        <path d="M492-20c-30 74 70 116 26 190s10 104 92 132 38 82-8 120" />
      </g>
    </svg>
  );
}

function StatusLabel({ status }: { status: EvidenceStatus }) {
  const tone =
    status === "Unknown" || status === "Conflicting"
      ? "text-[var(--app-accent-hover)]"
      : status === "Confirmed by attendee"
        ? "text-[var(--app-muted)]"
        : "text-[var(--app-ink)]";

  return <span className={`text-[0.76rem] leading-[1.35] font-semibold ${tone}`}>{status}</span>;
}

function EvidenceDisclosure({
  evidence,
  open,
  onToggle,
}: {
  evidence: EvidenceRecord;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        className="cursor-pointer border-0 bg-transparent p-1 text-right text-xs leading-[1.35] text-[var(--app-ink)] underline-offset-4 hover:text-[var(--app-ink)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4"
        aria-expanded={open}
        onClick={onToggle}
      >
        {open ? "Hide evidence" : "View evidence"}
      </button>
      {open ? (
        <div
          className="absolute top-[calc(100%+0.45rem)] right-0 z-10 w-[min(22rem,60vw)] border border-[var(--app-line)] bg-[var(--app-field)] p-3.5 shadow-[var(--shadow-overlay-medium)] max-[680px]:static max-[680px]:mt-1.5 max-[680px]:w-full"
          role="note"
        >
          <p className="mb-1.5 font-mono text-[0.65rem] font-bold tracking-[0.1em] text-[var(--app-accent-hover)] uppercase">
            Source
          </p>
          <p className="font-mono text-[0.7rem] leading-[1.5] font-semibold">{evidence.source}</p>
          <p className="mt-0.5 font-mono text-[0.7rem] leading-[1.5] text-[var(--app-muted)]">
            {evidence.date}
          </p>
          <p className="mt-2 font-mono text-[0.7rem] leading-[1.5] text-[var(--app-field-ink)]">
            “{evidence.excerpt}”
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ClaimRow({
  claim,
  openEvidenceId,
  onToggleEvidence,
}: {
  claim: ReportClaim;
  openEvidenceId: string | null;
  onToggleEvidence: (claimId: string) => void;
}) {
  const hasEvidence = Boolean(claim.evidence);
  const isOpen = openEvidenceId === claim.id;

  return (
    <div className="relative grid grid-cols-[minmax(9rem,0.85fr)_minmax(18rem,2.1fr)_minmax(10rem,1.05fr)_minmax(8.5rem,0.75fr)] items-start gap-4 border-b border-[var(--app-line)] px-5 py-3 last:border-b-0 max-[900px]:grid-cols-[minmax(9rem,0.8fr)_minmax(0,2fr)_minmax(9.5rem,1fr)] max-[680px]:grid-cols-1 max-[680px]:gap-1.5 max-[680px]:px-4 max-[680px]:py-3.5">
      <div className="text-[0.95rem] leading-[1.35] font-semibold">{claim.label}</div>
      <div className="min-w-0 text-[0.82rem] leading-[1.45]">
        <p className="m-0">{claim.claim}</p>
        {claim.unknownReason ? (
          <span className="mt-1 block font-mono text-[0.68rem] leading-[1.4] text-[var(--app-muted)]">
            {claim.unknownReason}
          </span>
        ) : null}
      </div>
      <div className="pt-0.5">
        <StatusLabel status={claim.status} />
      </div>
      <div className="flex min-w-0 justify-end max-[900px]:col-start-3 max-[900px]:row-start-1 max-[900px]:row-span-2 max-[680px]:col-auto max-[680px]:row-auto max-[680px]:justify-start">
        {hasEvidence ? (
          <EvidenceDisclosure
            evidence={claim.evidence as EvidenceRecord}
            open={isOpen}
            onToggle={() => onToggleEvidence(claim.id)}
          />
        ) : (
          <span className="font-mono text-[0.66rem] leading-[1.4] text-right text-[var(--app-muted)] max-[680px]:text-left">
            No source found
          </span>
        )}
      </div>
    </div>
  );
}

function EvidenceNote({ note }: { note: EvidenceRecord }) {
  return (
    <aside
      className="grid grid-cols-[minmax(12rem,0.75fr)_minmax(0,2fr)] gap-6 border-t border-l border-[var(--app-line)] border-l-[var(--app-accent)] bg-[color-mix(in_oklch,var(--app-accent)_5%,var(--app-bg))] px-5 pt-4 pb-[1.1rem] max-[680px]:grid-cols-1 max-[680px]:gap-2 max-[680px]:px-4"
      aria-label="Evidence note"
    >
      <div>
        <p className="mb-1.5 font-mono text-[0.65rem] font-bold tracking-[0.1em] text-[var(--app-accent-hover)] uppercase">
          Evidence note
        </p>
        <p className="mt-2 font-mono text-[0.7rem] leading-[1.5] font-semibold">{note.source}</p>
        <p className="mt-0.5 font-mono text-[0.7rem] leading-[1.5] text-[var(--app-muted)]">
          {note.date}
        </p>
      </div>
      <p className="mt-4 mb-0 text-[0.85rem] leading-[1.5] max-[680px]:mt-2">{note.excerpt}</p>
    </aside>
  );
}

function CategorySection({
  category,
  expanded,
  openEvidenceId,
  onToggle,
  onToggleEvidence,
}: {
  category: ReportCategory;
  expanded: boolean;
  openEvidenceId: string | null;
  onToggle: () => void;
  onToggleEvidence: (claimId: string) => void;
}) {
  return (
    <section className="border-b border-[var(--app-line)]" aria-labelledby={`${category.id}-title`}>
      <div
        className={`grid min-h-[3.65rem] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-5 px-8 max-[680px]:grid-cols-[1fr_auto] max-[680px]:gap-2.5 max-[680px]:px-4 max-[680px]:py-3.5 ${expanded ? "border-l border-[var(--app-accent)] bg-[color-mix(in_oklch,var(--app-field)_80%,var(--app-accent)_6%)]" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-5 max-[680px]:items-start max-[680px]:gap-3">
          <span className="w-[2.1rem] shrink-0 font-mono text-[0.85rem] text-[var(--app-accent-hover)]">
            {category.number}
          </span>
          <div className="flex min-w-0 items-baseline gap-6 max-[680px]:block">
            <h2
              id={`${category.id}-title`}
              className="m-0 flex-none text-[clamp(1.2rem,2vw,1.55rem)] leading-[1.1] font-semibold tracking-[-0.035em] max-[680px]:text-[1.15rem]"
            >
              {category.name}
            </h2>
            <p className="m-0 min-w-0 overflow-hidden font-mono text-[0.72rem] leading-[1.5] text-[var(--app-muted)] text-ellipsis whitespace-nowrap max-[680px]:mt-1.5 max-[680px]:overflow-visible max-[680px]:whitespace-normal">
              {category.preview.join(" · ")}
            </p>
          </div>
        </div>
        <span className="border-r border-[var(--app-line)] pr-5 font-mono text-[0.72rem] leading-[1.35] text-[var(--app-muted)] max-[680px]:hidden">
          {category.coreLabel}
        </span>
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-1 text-right text-xs leading-[1.35] text-[var(--app-muted)] underline-offset-4 hover:text-[var(--app-ink)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4"
          aria-expanded={expanded}
          aria-controls={`${category.id}-details`}
          onClick={onToggle}
        >
          {expanded ? "Hide details" : "View details"}
        </button>
      </div>

      {expanded ? (
        <div
          id={`${category.id}-details`}
          className="border-t border-[var(--app-line)] ml-[3.8rem] max-[680px]:ml-0"
        >
          <div className="border-b border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-accent)_7%,var(--app-bg))] px-5 py-2.5 font-mono text-[0.68rem] leading-[1.4] font-bold tracking-[0.12em] text-[var(--app-ink)] uppercase">
            {category.coreLabel}
          </div>
          {category.coreQuestions.length ? (
            <div>
              {category.coreQuestions.map((claim) => (
                <ClaimRow
                  key={claim.id}
                  claim={claim}
                  openEvidenceId={openEvidenceId}
                  onToggleEvidence={onToggleEvidence}
                />
              ))}
            </div>
          ) : (
            <p className="m-0 border-b border-[var(--app-line)] px-5 pt-3.5 pb-4 text-[var(--app-muted)] max-[680px]:px-4">
              No detailed findings are available in this preview.
            </p>
          )}

          {category.additionalDetails?.length ? (
            <div className="border-t border-[var(--app-line)]">
              <div className="border-b border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-ink)_9%,var(--app-bg))] px-5 py-2.5 font-mono text-[0.68rem] leading-[1.4] font-bold tracking-[0.12em] text-[var(--app-ink)] uppercase">
                Additional details found
              </div>
              <div>
                {category.additionalDetails.map((claim) => (
                  <ClaimRow
                    key={claim.id}
                    claim={claim}
                    openEvidenceId={openEvidenceId}
                    onToggleEvidence={onToggleEvidence}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {category.evidenceNote ? <EvidenceNote note={category.evidenceNote} /> : null}
        </div>
      ) : null}
    </section>
  );
}

export function AccessibilityReportPage({
  requestedUrl,
  report,
}: {
  requestedUrl: string;
  report: AccessibilityReport;
}) {
  const reportData = report;
  const [expandedCategoryId, setExpandedCategoryId] = useState("enter-move");
  const [openEvidenceId, setOpenEvidenceId] = useState<string | null>(null);

  const handleShare = async () => {
    const shareData = {
      title: `${reportData.event.name} · BeforeDoors`,
      text: "Accessibility brief from BeforeDoors",
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

  const toggleEvidence = (claimId: string) => {
    setOpenEvidenceId((current) => (current === claimId ? null : claimId));
  };

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-ink)]">
      <Header alignment="report" variant="report" onShare={() => void handleShare()} />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-[var(--app-bg)] px-5 pb-12 max-[680px]:px-0">
        <TrailheadSurface />
        <div className="relative z-[1] mx-auto w-full max-w-[80rem] border-x border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))] max-[680px]:border-x-0">
          <header className="relative isolate flex min-h-44 items-end justify-between gap-8 border-b border-[var(--app-line)] px-8 pt-10 pb-8 max-[900px]:items-start max-[900px]:flex-col max-[680px]:min-h-[13rem] max-[680px]:px-4 max-[680px]:py-8">
            <div className="relative z-10">
              <h1 className="m-0 max-w-[12ch] text-[clamp(2.75rem,6vw,5rem)] leading-[0.92] font-semibold tracking-[-0.05em] max-[680px]:text-[clamp(2.4rem,13vw,4rem)]">
                {reportData.event.name}
              </h1>
              <p className="mt-4 mb-0 font-mono text-[clamp(0.8rem,1.3vw,1rem)] leading-6">
                {reportData.event.date} <span aria-hidden="true">·</span>{" "}
                {reportData.event.location}
              </p>
            </div>
            <dl className="z-10 grid min-w-56 gap-1.5 self-end font-mono text-[0.72rem] leading-[1.35] max-[900px]:mt-4 max-[900px]:w-full max-[900px]:max-w-[22rem] max-[900px]:self-auto max-[680px]:mt-4">
              <div className="grid grid-cols-[4.5rem_1fr] gap-2.5">
                <dt className="text-[var(--app-muted)] uppercase">Map ref</dt>
                <dd className="m-0 text-right max-[900px]:text-left">{reportData.event.mapRef}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-2.5">
                <dt className="text-[var(--app-muted)] uppercase">Brief ID</dt>
                <dd className="m-0 text-right max-[900px]:text-left">{reportData.event.briefId}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] gap-2.5">
                <dt className="text-[var(--app-muted)] uppercase">Version</dt>
                <dd className="m-0 text-right max-[900px]:text-left">{reportData.event.version}</dd>
              </div>
            </dl>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[-1] w-[44%] max-[680px]:inset-0 max-[680px]:w-full max-[680px]:opacity-60">
              <ReportContourLines />
            </div>
          </header>

          <section
            className="grid min-h-[7.25rem] grid-cols-[minmax(14rem,1fr)_minmax(24rem,1.65fr)_minmax(13rem,0.95fr)] items-center gap-10 border-b border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-field)_70%,var(--app-accent)_4%)] px-8 py-7 max-[900px]:grid-cols-1 max-[900px]:gap-4 max-[680px]:px-4 max-[680px]:py-6"
            aria-labelledby="overview-title"
          >
            <h2
              id="overview-title"
              className="m-0 text-[clamp(1.55rem,2.7vw,2.2rem)] leading-none font-semibold tracking-[-0.04em]"
            >
              Accessibility at a glance
            </h2>
            <p className="m-0 max-w-[52ch] text-base leading-6">{reportData.overview}</p>
            <div className="flex flex-wrap justify-end gap-x-2 gap-y-1 font-mono text-[0.72rem] leading-6 text-right max-[900px]:justify-start max-[900px]:text-left">
              <span>{reportData.provenance.label}</span>
              <span aria-hidden="true">·</span>
              <strong className="font-semibold text-[var(--app-accent-hover)]">
                {reportData.provenance.updated}
              </strong>
            </div>
          </section>

          <div
            className="flex items-baseline gap-3 border-b border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-bg))] px-8 py-2.5 text-xs max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-1 max-[680px]:px-4"
            role="status"
          >
            <span className="shrink-0 font-mono text-[0.68rem] leading-[1.4] font-bold tracking-[0.12em] text-[var(--app-accent-hover)] uppercase">
              Preview data
            </span>
            <p className="m-0 text-[var(--app-muted)]">
              {requestedUrl
                ? `Showing the structured demo brief for ${requestedUrl}.`
                : "Showing the structured demo brief."}{" "}
              Live crawling is not connected yet.
            </p>
          </div>

          <div>
            {reportData.categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                expanded={expandedCategoryId === category.id}
                openEvidenceId={openEvidenceId}
                onToggle={() => {
                  setExpandedCategoryId((current) => (current === category.id ? "" : category.id));
                  setOpenEvidenceId(null);
                }}
                onToggleEvidence={toggleEvidence}
              />
            ))}
          </div>

          <section
            id="method"
            className="max-w-[60rem] border-t border-[var(--app-line)] px-8 py-8 max-[680px]:px-4"
            aria-labelledby="method-title"
          >
            <p className="m-0 font-mono text-[0.68rem] leading-[1.4] font-bold tracking-[0.12em] text-[var(--app-ink)] uppercase">
              Method
            </p>
            <h2 id="method-title" className="mt-2.5 mb-0 text-[1.35rem] tracking-[-0.025em]">
              {reportData.method.title}
            </h2>
            <p className="mt-3 mb-0 max-w-[64ch] text-[0.9rem] leading-[1.65] text-[var(--app-muted)]">
              {reportData.method.description}
            </p>
            <p className="mt-3 mb-0 font-mono text-[0.72rem] leading-[1.5] text-[var(--app-accent-hover)]">
              {reportData.method.note}
            </p>
          </section>

          <footer className="flex justify-between gap-4 border-t border-[var(--app-line)] px-8 py-3.5 font-mono text-[0.68rem] leading-[1.5] text-[var(--app-muted)] max-[680px]:flex-col max-[680px]:px-4">
            <span>BeforeDoors · Know before you go</span>
            <span>Evidence-first · uncertainty visible</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
