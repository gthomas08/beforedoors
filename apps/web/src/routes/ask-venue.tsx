import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { AskVenuePage } from "@/components/ask-venue-page";
import { createSiteMeta } from "@/lib/site-meta";

export const Route = createFileRoute("/ask-venue")({
  validateSearch: (search: Record<string, unknown>) => ({
    venueName: typeof search.venueName === "string" ? search.venueName : "the venue",
    venueUrl: typeof search.venueUrl === "string" ? search.venueUrl : "",
  }),
  component: AskVenueRouteComponent,
  head: () => ({
    meta: createSiteMeta({
      title: "BeforeDoors · Ask the venue",
      description: "Prepare a focused accessibility question for a venue before you go.",
    }),
  }),
});

function AskVenueRouteComponent() {
  const { venueName, venueUrl } = Route.useSearch();
  const venueResult = useQuery(api.venues.getVenueByUrl, venueUrl ? { url: venueUrl } : "skip");

  return (
    <AskVenuePage
      venueName={venueName}
      venueUrl={venueUrl}
      venueEmail={venueResult?.venue?.contactEmail ?? null}
      isVenueLoading={venueResult === undefined}
    />
  );
}
