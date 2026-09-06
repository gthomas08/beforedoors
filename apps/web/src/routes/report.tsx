import { createFileRoute } from "@tanstack/react-router";

import { AccessibilityReportPage, type AccessibilityReport } from "@/components/report-page";
import demoReport from "@/data/demo-report.json";

const reportData = demoReport as unknown as AccessibilityReport;

export const Route = createFileRoute("/report")({
  validateSearch: (search: Record<string, unknown>) => ({
    url: typeof search.url === "string" ? search.url : "",
  }),
  loader: () => ({ report: reportData }),
  component: ReportRouteComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors · Accessibility brief",
      },
      {
        name: "description",
        content: "Review a venue or event's evidence-based accessibility brief before you go.",
      },
    ],
  }),
});

function ReportRouteComponent() {
  const { report } = Route.useLoaderData();

  return <AccessibilityReportPage report={report} />;
}
