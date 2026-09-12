import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { usePaginatedQuery } from "convex/react";

import { VenuesPage } from "@/components/venues-page";

const INITIAL_VENUE_COUNT = 20;
const VENUE_PAGE_SIZE = 20;

export const Route = createFileRoute("/venues")({
  component: VenuesRouteComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors · Venues",
      },
      {
        name: "description",
        content: "Review saved venue names, source URLs, and accessibility answers.",
      },
    ],
  }),
});

function VenuesRouteComponent() {
  const {
    results: venues,
    status,
    loadMore,
  } = usePaginatedQuery(api.venues.listVenues, {}, { initialNumItems: INITIAL_VENUE_COUNT });

  return (
    <VenuesPage
      venues={venues}
      isLoading={status === "LoadingFirstPage"}
      canLoadMore={status === "CanLoadMore"}
      isLoadingMore={status === "LoadingMore"}
      onLoadMore={() => loadMore(VENUE_PAGE_SIZE)}
    />
  );
}
