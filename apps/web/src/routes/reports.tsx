import { createFileRoute } from "@tanstack/react-router";

import { ReportsPage } from "@/components/reports-page";
import type { AccessibilityReport } from "@/components/report-page";
import demoReport from "@/data/demo-report.json";

const reportData = demoReport as unknown as AccessibilityReport;

export const Route = createFileRoute("/reports")({
  loader: () => ({ report: reportData }),
  component: ReportsRouteComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors · Reports",
      },
      {
        name: "description",
        content: "Find saved BeforeDoors accessibility briefs and open their evidence.",
      },
    ],
  }),
});

function ReportsRouteComponent() {
  const { report } = Route.useLoaderData();

  return <ReportsPage report={report} />;
}
