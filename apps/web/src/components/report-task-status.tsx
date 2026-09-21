import { api } from "@beforedoors/backend/convex/_generated/api";
import type { Id } from "@beforedoors/backend/convex/_generated/dataModel";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowRight, Check, X } from "lucide-react";

import { forgetReport, useTrackedReport } from "@/lib/report-task-store";

const phaseLabels = {
  queued: "In the research queue",
  resolving: "Identifying the venue",
  mapping: "Finding relevant pages",
  selection: "Choose a venue to continue",
  scraping: "Reading published details",
  finalizing: "Preparing your brief",
  completed: "Research is ready",
  failed: "Research could not be completed",
} as const;

function getVenueLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "your venue";
  }
}

function isTrackedReportRoute(locationHref: string, reportId: string) {
  const currentLocation = new URL(locationHref, "http://beforedoors.local");
  return (
    currentLocation.pathname === "/report" &&
    currentLocation.searchParams.get("reportId") === reportId
  );
}

export function ReportTaskStatus() {
  const locationHref = useLocation({ select: (location) => location.href });
  const trackedReport = useTrackedReport();
  const isOnTrackedReport = trackedReport
    ? isTrackedReportRoute(locationHref, trackedReport.reportId)
    : false;
  const report = useQuery(
    api.reports.getReportStatus,
    trackedReport && !isOnTrackedReport
      ? { reportId: trackedReport.reportId as Id<"reports"> }
      : "skip",
  );

  if (!trackedReport || isOnTrackedReport) return null;

  const isUnavailable = report === null;
  const phase = isUnavailable ? "failed" : (report?.phase ?? "queued");
  const isComplete = phase === "completed";
  const isFailed = phase === "failed";
  const venueLabel = getVenueLabel(report?.url ?? trackedReport.url);
  const progress =
    report && report.totalScrapes > 0
      ? `${Math.min(report.finishedScrapes, report.totalScrapes)} of ${report.totalScrapes} pages`
      : undefined;
  const detail = isUnavailable
    ? "The saved research link is no longer available"
    : report === undefined
      ? "Checking current status…"
      : (progress ?? venueLabel);
  const reportUrl = report?.url ?? trackedReport.url;

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-5 sm:pb-5"
      aria-label="Background research status"
    >
      <div className="mx-auto flex max-w-352 items-center gap-3 border border-(--app-field-border) bg-(--app-field) px-3 py-3 text-(--app-ink) shadow-overlay-medium sm:gap-4 sm:px-4">
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${
            isComplete
              ? "bg-status-verified"
              : isFailed
                ? "bg-status-signal"
                : "animate-pulse bg-status-pending motion-reduce:animate-none"
          }`}
        />

        <div className="min-w-0 flex-1" role="status" aria-live="polite" aria-atomic="true">
          <p className="m-0 font-mono text-xs leading-4 tracking-[0.12em] text-(--app-muted) uppercase">
            Background research
          </p>
          <p className="m-0 truncate text-xs leading-5 font-semibold sm:text-sm">
            {phaseLabels[phase]} <span className="font-normal text-(--app-muted)">· {detail}</span>
          </p>
        </div>

        <Link
          to="/report"
          search={{ url: reportUrl, reportId: trackedReport.reportId }}
          className="inline-flex shrink-0 items-center gap-1 border border-(--app-line) px-2.5 py-2 text-xs font-semibold tracking-[0.08em] text-(--app-ink) uppercase transition-colors hover:border-(--app-accent) hover:bg-[color-mix(in_oklch,var(--app-accent)_10%,var(--app-field))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) max-[480px]:px-2"
        >
          <span className="max-[480px]:sr-only">Open report</span>
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>

        <button
          type="button"
          aria-label="Dismiss background research status"
          onClick={() => forgetReport(trackedReport.reportId)}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center border border-transparent text-(--app-muted) transition-colors hover:border-(--app-line) hover:text-(--app-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
        >
          {isComplete ? (
            <Check aria-hidden="true" className="size-3.5" />
          ) : (
            <X aria-hidden="true" className="size-3.5" />
          )}
        </button>
      </div>
    </aside>
  );
}
