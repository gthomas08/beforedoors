import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { PendingReportPage } from "@/components/pending-report-page";
import { VenueInfoMessage, VenueInfoPage } from "@/components/report-page";

export const Route = createFileRoute("/report")({
  validateSearch: (search: Record<string, unknown>) => ({
    url: typeof search.url === "string" ? search.url : "",
    ...(typeof search.reportId === "string" ? { reportId: search.reportId } : {}),
  }),
  component: ReportRouteComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors · Venue information",
      },
      {
        name: "description",
        content: "Review a venue's accessibility answers and source URLs before you go.",
      },
    ],
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
    <TrackedReport key={reportId} reportId={reportId} url={url} />
  ) : (
    <SavedVenueReport url={url} />
  );
}

function TrackedReport({ reportId, url }: { reportId: string; url: string }) {
  const report = useQuery(api.reports.getReportStatus, {
    reportId: reportId as Id<"reports">,
  });
  const venue = useQuery(
    api.venues.getVenueByUrl,
    report?.phase === "completed" ? { url: report.url } : "skip",
  );

  if (report === undefined) {
    return <PendingReportPage url={url} phase="queued" />;
  }

  if (report === null) {
    return (
      <VenueInfoMessage
        title="Research not found"
        message="This research link is no longer available. Start a new search to try again."
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
    if (venue === undefined) {
      return (
        <VenueInfoMessage
          title="Saving venue information"
          message="The research is complete. We’re saving its answers and sources now."
          isLoading
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

  return <PendingReportPage url={url} phase={report.phase} />;
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
