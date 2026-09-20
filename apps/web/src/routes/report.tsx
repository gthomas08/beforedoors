import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

import { PendingReportPage } from "@/components/pending-report-page";
import { VenueInfoMessage, VenueInfoPage, VenueSelectionPage } from "@/components/report-page";
import { createSiteMeta } from "@/lib/site-meta";

export const Route = createFileRoute("/report")({
  validateSearch: (search: Record<string, unknown>) => ({
    url: typeof search.url === "string" ? search.url : "",
    ...(typeof search.reportId === "string" ? { reportId: search.reportId } : {}),
  }),
  component: ReportRouteComponent,
  head: () => ({
    meta: createSiteMeta({
      title: "BeforeDoors · Venue information",
      description: "Review a venue's accessibility answers and source URLs before you go.",
    }),
  }),
});

function ReportRouteComponent() {
  const { url, reportId } = Route.useSearch();

  if (!url) {
    return (
      <VenueInfoMessage
        title="Venue URL missing"
        message="Open a venue from the venues list to view its saved answers."
      />
    );
  }

  return reportId ? (
    <TrackedReport key={reportId} reportId={reportId} />
  ) : (
    <SavedVenueReport url={url} />
  );
}

function TrackedReport({ reportId }: { reportId: string }) {
  const report = useQuery(api.reports.getReportStatus, {
    reportId: reportId as Id<"reports">,
  });
  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  const isResearchComplete = report?.phase === "completed";
  const venue = useQuery(
    api.venues.getVenueByUrl,
    isResearchComplete ? { url: report.url } : "skip",
  );

  useEffect(() => {
    if (!isResearchComplete) return;

    const completionTimer = window.setTimeout(() => setHasShownCompletion(true), 1000);
    return () => window.clearTimeout(completionTimer);
  }, [isResearchComplete]);

  if (report === undefined) {
    return <PendingReportPage phase="queued" />;
  }

  if (report === null) {
    return (
      <VenueInfoMessage
        title="Research not found"
        message="This research link is no longer available. Start a new search to try again."
      />
    );
  }

  if (report.phase === "selection") {
    if (report.candidateVenues.length === 0) {
      return (
        <VenueInfoMessage
          title="No specific venue links found"
          message="This page lists multiple venues, but no individual venue pages were available to choose."
        />
      );
    }

    return (
      <VenueSelectionPage
        reportId={report._id}
        seedUrl={report.seedUrl}
        candidates={report.candidateVenues}
      />
    );
  }

  if (report.phase === "failed") {
    return (
      <VenueInfoMessage
        title="Research couldn’t be completed"
        message="We couldn’t finish checking this venue. Please try starting a new search."
      />
    );
  }

  if (report.phase === "completed") {
    if (!hasShownCompletion || venue === undefined) {
      return (
        <PendingReportPage
          phase="completed"
          totalPages={report.totalScrapes}
          finishedPages={report.finishedScrapes}
        />
      );
    }

    if (venue.venue === null) {
      return (
        <VenueInfoMessage
          title="No venue information found"
          message="The pages we checked did not contain sourced accessibility answers to save."
        />
      );
    }

    return <VenueInfoPage venue={venue.venue} />;
  }

  return (
    <PendingReportPage
      phase={report.phase}
      totalPages={report.totalScrapes}
      finishedPages={report.finishedScrapes}
    />
  );
}

function SavedVenueReport({ url }: { url: string }) {
  const result = useQuery(api.venues.getVenueByUrl, { url });

  if (result === undefined) {
    return (
      <VenueInfoMessage
        title="Loading venue information"
        message="Fetching the latest saved venue details."
        isLoading
      />
    );
  }

  if (result.venue === null) {
    return (
      <VenueInfoMessage
        title="Venue not found"
        message="There are no saved venue answers for this URL yet."
      />
    );
  }

  return <VenueInfoPage venue={result.venue} />;
}
