import { createFileRoute } from "@tanstack/react-router";

import { AskVenuePage } from "@/components/ask-venue-page";

export const Route = createFileRoute("/ask-venue")({
  validateSearch: (search: Record<string, unknown>) => ({
    venueName: typeof search.venueName === "string" ? search.venueName : "the venue",
    venueUrl: typeof search.venueUrl === "string" ? search.venueUrl : "",
  }),
  component: AskVenueRouteComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors · Ask the venue",
      },
      {
        name: "description",
        content: "Prepare a focused accessibility question for a venue before you go.",
      },
    ],
  }),
});

function AskVenueRouteComponent() {
  const { venueName, venueUrl } = Route.useSearch();

  return <AskVenuePage venueName={venueName} venueUrl={venueUrl} />;
}
