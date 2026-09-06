import { Toaster } from "@/components/ui/sonner";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { ThemeProvider } from "@/components/theme-provider";

import "../styles.css";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>
    </>
  );
}
