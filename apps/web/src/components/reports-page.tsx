import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";

import Header from "@/components/header";
import { ReportContourLines } from "@/components/report-contour-lines";
import { TrailheadSurface } from "@/components/trailhead-surface";
import type { AccessibilityReport, EvidenceStatus } from "@/components/report-page";

function statusDotClass(status: EvidenceStatus) {
  switch (status) {
    case "Confirmed by venue":
    case "Confirmed by attendee":
      return "bg-status-verified";
    case "Unknown":
      return "bg-status-pending";
    case "Conflicting":
      return "bg-status-signal";
    case "Published by venue":
    default:
      return "bg-[var(--app-muted)]";
  }
}

function reportStatuses(report: AccessibilityReport) {
  const statuses = Array.from(new Set(report.questions.map((question) => question.status)));
  return statuses.length ? statuses : (["Unknown"] as EvidenceStatus[]);
}

function EvidenceSummary({ report }: { report: AccessibilityReport }) {
  return (
    <div className="flex flex-col gap-1.5">
      {reportStatuses(report).map((status) => (
        <span key={status} className="inline-flex items-center gap-2 text-[0.76rem] leading-5">
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${statusDotClass(status)}`}
          />
          <span>{status}</span>
        </span>
      ))}
    </div>
  );
}

function ReportRow({ report }: { report: AccessibilityReport }) {
  const { event, provenance } = report;

  return (
    <tr className="group border-b border-[var(--app-line)] align-top last:border-b-0">
      <th scope="row" className="px-4 py-5 text-left sm:px-6 sm:py-6">
        <div className="flex gap-4">
          <span aria-hidden="true" className="mt-1.5 flex w-2 shrink-0 flex-col items-center">
            <span className="size-2 bg-[var(--app-accent)]" />
            <span className="mt-1.5 h-full min-h-8 w-px bg-[var(--app-accent)]/45" />
          </span>
          <div className="min-w-0">
            <Link
              to="/report"
              search={{ url: "" }}
              className="inline-flex items-center gap-2 text-[1.04rem] leading-[1.2] font-semibold tracking-[-0.025em] text-[var(--app-ink)] underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-200 group-hover:text-[var(--app-accent-hover)] group-hover:decoration-[var(--app-accent)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4 motion-reduce:transition-none sm:text-[1.15rem]"
            >
              <span>{event.name}</span>
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </Link>
            <p className="mt-2 mb-0 font-mono text-[0.68rem] leading-5 text-[var(--app-muted)]">
              {event.briefId} · v{event.version}
            </p>
          </div>
        </div>
      </th>
      <td className="px-4 py-5 text-[0.82rem] leading-6 sm:px-6 sm:py-6">
        <time>{event.date}</time>
      </td>
      <td className="px-4 py-5 text-[0.82rem] leading-6 sm:px-6 sm:py-6">
        <span className="block">{event.location}</span>
        <span className="mt-1 block font-mono text-[0.65rem] leading-5 text-[var(--app-muted)]">
          {event.mapRef}
        </span>
      </td>
      <td className="px-4 py-5 sm:px-6 sm:py-6">
        <EvidenceSummary report={report} />
      </td>
      <td className="px-4 py-5 text-[0.78rem] leading-5 sm:px-6 sm:py-6">
        <span className="block font-mono text-[0.72rem] text-[var(--app-ink)]">
          {provenance.updated}
        </span>
        <span className="mt-1 block max-w-[14ch] text-[0.68rem] leading-4 text-[var(--app-muted)]">
          {provenance.label}
        </span>
      </td>
      <td className="px-4 py-5 sm:px-6 sm:py-6">
        <Link
          to="/report"
          search={{ url: "" }}
          className="inline-flex items-center gap-2 whitespace-nowrap text-[0.72rem] font-semibold tracking-[0.1em] text-[var(--app-accent-hover)] uppercase underline decoration-[var(--app-accent)] decoration-1 underline-offset-4 transition-[color] duration-200 hover:text-[var(--app-ink)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4 motion-reduce:transition-none"
        >
          Open report
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </td>
    </tr>
  );
}

function MobileReportRow({ report }: { report: AccessibilityReport }) {
  const { event, provenance } = report;

  return (
    <li className="border-b border-[var(--app-line)] px-4 py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span aria-hidden="true" className="mt-1.5 flex w-2 shrink-0 flex-col items-center">
            <span className="size-2 bg-[var(--app-accent)]" />
            <span className="mt-1.5 h-full min-h-8 w-px bg-[var(--app-accent)]/45" />
          </span>
          <div className="min-w-0">
            <Link
              to="/report"
              search={{ url: "" }}
              className="inline-flex items-center gap-2 text-[1rem] leading-[1.2] font-semibold tracking-[-0.025em] text-[var(--app-ink)] underline decoration-[var(--app-accent)] decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4"
            >
              <span>{event.name}</span>
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </Link>
            <p className="mt-2 mb-0 font-mono text-[0.66rem] leading-5 text-[var(--app-muted)]">
              {event.briefId} · v{event.version}
            </p>
          </div>
        </div>
        <Link
          to="/report"
          search={{ url: "" }}
          className="inline-flex shrink-0 items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.08em] text-[var(--app-accent-hover)] uppercase underline decoration-[var(--app-accent)] decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4"
        >
          Open
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--app-line)] pt-4">
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-[var(--app-muted)] uppercase">
            Event date
          </dt>
          <dd className="mt-1.5 mb-0 text-[0.78rem] leading-5">{event.date}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-[var(--app-muted)] uppercase">
            Location
          </dt>
          <dd className="mt-1.5 mb-0 text-[0.78rem] leading-5">
            {event.location}
            <span className="mt-1 block font-mono text-[0.62rem] leading-4 text-[var(--app-muted)]">
              {event.mapRef}
            </span>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-[var(--app-muted)] uppercase">
            Evidence
          </dt>
          <dd className="mt-1.5 mb-0">
            <EvidenceSummary report={report} />
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-[0.1em] text-[var(--app-muted)] uppercase">
            Updated
          </dt>
          <dd className="mt-1.5 mb-0 text-[0.72rem] leading-5">
            <span className="block font-mono">{provenance.updated}</span>
            <span className="mt-1 block text-[0.66rem] leading-4 text-[var(--app-muted)]">
              {provenance.label}
            </span>
          </dd>
        </div>
      </dl>
    </li>
  );
}

export function ReportsPage({ report }: { report: AccessibilityReport }) {
  const reportCount = report.questions.length ? 1 : 0;

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-ink)]">
      <Header alignment="report" variant="reports" />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-[var(--app-bg)] px-5 pb-12 max-[680px]:px-0">
        <TrailheadSurface />
        <div className="relative z-[1] mx-auto w-full max-w-[88rem] border-x border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))] max-[680px]:border-x-0">
          <header className="relative isolate flex min-h-64 items-end justify-between gap-8 border-b border-[var(--app-line)] px-8 pt-12 pb-10 max-[760px]:items-start max-[760px]:flex-col max-[680px]:min-h-[17rem] max-[680px]:px-4 max-[680px]:pt-10 max-[680px]:pb-8">
            <div className="relative z-10 min-w-0">
              <div className="mb-6 flex items-center gap-3 font-mono text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--app-accent-hover)] uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-[var(--app-accent)]" />
                <span>Reports / {String(reportCount).padStart(2, "0")}</span>
              </div>
              <h1 className="m-0 max-w-none text-[clamp(3rem,7vw,5.6rem)] leading-[0.88] font-semibold tracking-[-0.055em]">
                Reports
              </h1>
              <p className="mt-5 mb-0 max-w-[58ch] text-[0.95rem] leading-7 text-[var(--app-muted)] sm:text-base">
                Saved accessibility briefs, organized so you can find the right details before you
                go.
              </p>
            </div>

            <div className="relative z-10 flex shrink-0 flex-col items-start gap-3 max-[760px]:flex-row max-[760px]:items-center">
              <p className="m-0 font-mono text-[0.7rem] leading-5 text-[var(--app-muted)]">
                {reportCount === 1 ? "1 saved report" : "No saved reports"}
                <br />
                <span className="text-[var(--app-accent-hover)]">Evidence stays attached</span>
              </p>
              <Link
                to="/"
                className="inline-flex h-9 items-center gap-2 border border-[var(--app-accent)] bg-transparent px-3 text-[0.7rem] font-semibold tracking-[0.1em] text-[var(--app-accent-hover)] uppercase transition-[background-color,color] duration-200 hover:bg-[var(--app-accent)] hover:text-[var(--app-accent-ink)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4 motion-reduce:transition-none"
              >
                <Plus aria-hidden="true" className="size-3.5" />
                New report
              </Link>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 z-[-1] w-[52%] max-[680px]:inset-0 max-[680px]:w-full max-[680px]:opacity-55">
              <ReportContourLines />
            </div>
          </header>

          <div
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 border-b border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-bg))] px-8 py-2.5 text-xs max-[680px]:px-4"
            role="status"
          >
            <p className="m-0 text-[var(--app-muted)]">
              Demo data · live crawling is not connected yet.
            </p>
            <p className="m-0 font-mono text-[0.68rem] text-[var(--app-muted)]">
              Source-aware · {report.event.briefId}
            </p>
          </div>

          {report.questions.length ? (
            <>
              <div
                className="hidden overflow-x-auto focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-[-2px] min-[681px]:block"
                tabIndex={0}
              >
                <table
                  className="w-full min-w-[68rem] border-collapse text-left"
                  aria-label="Saved accessibility reports"
                >
                  <caption className="sr-only">Saved BeforeDoors accessibility reports</caption>
                  <colgroup>
                    <col className="w-[29%]" />
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                    <col className="w-[18%]" />
                    <col className="w-[13%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead className="border-b border-[var(--app-line)] bg-[color-mix(in_oklch,var(--app-field)_42%,transparent)]">
                    <tr className="font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--app-muted)] uppercase">
                      <th scope="col" className="px-4 py-3.5 sm:px-6">
                        Report
                      </th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6">
                        Event date
                      </th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6">
                        Location
                      </th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6">
                        Evidence
                      </th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6">
                        Updated
                      </th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6">
                        Open
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <ReportRow report={report} />
                  </tbody>
                </table>
              </div>
              <ol
                className="m-0 list-none p-0 min-[681px]:hidden"
                aria-label="Saved accessibility reports"
              >
                <MobileReportRow report={report} />
              </ol>
            </>
          ) : (
            <div className="px-8 py-14 max-[680px]:px-4">
              <h2 className="m-0 text-[1.35rem] tracking-[-0.025em]">No reports yet</h2>
              <p className="mt-3 mb-0 max-w-[55ch] text-[0.9rem] leading-[1.65] text-[var(--app-muted)]">
                Start with a venue or event link and your first sourced brief will appear here.
              </p>
            </div>
          )}

          <footer className="flex justify-between gap-4 border-t border-[var(--app-line)] px-8 py-4 font-mono text-[0.68rem] leading-[1.5] text-[var(--app-muted)] max-[680px]:flex-col max-[680px]:px-4">
            <span>BeforeDoors · Know before you go</span>
            <span>Rows open the full evidence brief</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
