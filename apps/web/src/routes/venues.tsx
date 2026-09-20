import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { usePaginatedQuery } from "convex/react";
import { useState } from "react";

import { VenuesPage } from "@/components/venues-page";
import { createSiteMeta } from "@/lib/site-meta";

const INITIAL_VENUE_COUNT = 20;
const VENUE_PAGE_SIZE = 20;

export const Route = createFileRoute("/venues")({
  component: VenuesRouteComponent,
  head: () => ({
    meta: createSiteMeta({
      title: "BeforeDoors · Venues",
      description: "Review saved venue names, source URLs, and accessibility answers.",
    }),
  }),
});

function VenuesRouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    results: venues,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.venues.listVenues,
    { searchTerm },
    { initialNumItems: INITIAL_VENUE_COUNT },
  );

  return (
    <VenuesPage
      venues={venues}
      isLoading={status === "LoadingFirstPage"}
      canLoadMore={status === "CanLoadMore"}
      isLoadingMore={status === "LoadingMore"}
      onLoadMore={() => loadMore(VENUE_PAGE_SIZE)}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
    />
  );
}
