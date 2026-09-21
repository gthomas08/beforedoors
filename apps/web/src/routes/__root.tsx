import { Toaster } from "@/components/ui/sonner";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { ReportTaskStatus } from "@/components/report-task-status";
import { createSiteMeta } from "@/lib/site-meta";
import "../styles.css";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: createSiteMeta({ title: "BeforeDoors — Know before you go" }),
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/beforedoors-mark.svg",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <ReportTaskStatus />
      <Toaster />
    </>
  );
}
