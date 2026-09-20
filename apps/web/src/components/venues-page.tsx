import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";

import type { Doc } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { answerStatusMeta, type AnswerStatus } from "@/components/answer-status";
import Header from "@/components/header";
import { PageHero } from "@/components/page-hero";
import { SearchField } from "@/components/search-field";
import { TrailheadSurface } from "@/components/trailhead-surface";
import { formatUpdatedAt } from "@/lib/format-date";

type Venue = Pick<Doc<"venues">, "name" | "url" | "updatedAt"> & {
  answerCount: number;
  publishedCount: number;
  confirmedCount: number;
};

function StatusSummary({ venue }: { venue: Venue }) {
  if (venue.answerCount === 0) {
    return <span className="text-[0.76rem] text-(--app-muted)">No saved answers</span>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {venue.publishedCount > 0 && <StatusCount status="published" count={venue.publishedCount} />}
      {venue.confirmedCount > 0 && <StatusCount status="confirmed" count={venue.confirmedCount} />}
    </div>
  );
}

function StatusCount({ status, count }: { status: AnswerStatus; count: number }) {
  const statusMeta = answerStatusMeta[status];

  return (
    <span className="inline-flex items-center gap-2 text-[0.76rem] leading-5 text-(--app-ink)">
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${statusMeta.dotClassName}`}
      />
      <span>
        {statusMeta.shortLabel} · {count}
      </span>
    </span>
  );
}

function VenueSource({ venue }: { venue: Venue }) {
  return (
    <a
      href={venue.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full min-w-0 items-center gap-1.5 overflow-hidden font-mono text-[0.68rem] leading-4 text-(--app-ink) underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
      aria-label={`Open venue source ${venue.url} in a new tab`}
    >
      <span className="min-w-0 truncate">{venue.url}</span>
      <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  );
}

function VenueRow({ venue }: { venue: Venue }) {
  return (
    <tr className="border-b border-(--app-line) align-top last:border-b-0">
      <th scope="row" className="px-4 py-4 text-left sm:px-6 sm:py-4">
        <Link
          to="/report"
          search={{ url: venue.url }}
          className="inline-flex items-center gap-2 text-lg leading-tight font-semibold tracking-[-0.02em] underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
        >
          {venue.name || "Name not recorded"}
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>
        <span className="mt-1.5 block max-w-full text-(--app-muted)">
          <VenueSource venue={venue} />
        </span>
      </th>
      <td className="px-4 py-4 text-[0.82rem] leading-6 sm:px-6 sm:py-4">
        {venue.answerCount} {venue.answerCount === 1 ? "answer" : "answers"}
      </td>
      <td className="px-4 py-4 sm:px-6 sm:py-4">
        <StatusSummary venue={venue} />
      </td>
      <td className="px-4 py-4 text-[0.76rem] leading-5 text-(--app-muted) sm:px-6 sm:py-4">
        {formatUpdatedAt(venue.updatedAt)}
      </td>
    </tr>
  );
}

function MobileVenueRow({ venue }: { venue: Venue }) {
  return (
    <li className="border-b border-(--app-line) px-4 py-4 last:border-b-0">
      <div className="min-w-0">
        <h2 className="m-0 text-lg leading-tight font-semibold tracking-[-0.02em]">
          <Link
            to="/report"
            search={{ url: venue.url }}
            className="inline-flex items-center gap-2 underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
          >
            {venue.name || "Name not recorded"}
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </h2>
        <div className="mt-1.5 text-(--app-muted)">
          <VenueSource venue={venue} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-(--app-line) pt-3">
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-wide text-(--app-muted) uppercase">
            Answers
          </dt>
          <dd className="mt-1 mb-0 text-[0.78rem] leading-5">
            {venue.answerCount} {venue.answerCount === 1 ? "answer" : "answers"}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-wide text-(--app-muted) uppercase">
            Last updated
          </dt>
          <dd className="mt-1 mb-0 text-[0.72rem] leading-5 text-(--app-muted)">
            {formatUpdatedAt(venue.updatedAt)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="font-mono text-[0.62rem] font-semibold tracking-wide text-(--app-muted) uppercase">
            Answer status
          </dt>
          <dd className="mt-1 mb-0">
            <StatusSummary venue={venue} />
          </dd>
        </div>
      </dl>
    </li>
  );
}

function DesktopVenueList({
  venues,
  isLoadingFirstPage,
  searchTerm,
}: {
  venues: Venue[];
  isLoadingFirstPage: boolean;
  searchTerm: string;
}) {
  const hasVenues = venues.length > 0;
  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <div
      className="hidden overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--app-focus) min-[681px]:block"
      tabIndex={0}
    >
      <table className="w-full min-w-232 border-collapse text-left" aria-label="Venues">
        <caption className="sr-only">
          Saved venues, source URLs, accessibility answer counts, and answer status.
        </caption>
        <colgroup>
          <col className="w-[46%]" />
          <col className="w-[13%]" />
          <col className="w-[23%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead className="border-b border-(--app-line) bg-[color-mix(in_oklch,var(--app-field)_42%,transparent)]">
          <tr className="font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-(--app-muted) uppercase">
            <th scope="col" className="px-4 py-3.5 sm:px-6">
              Venue · source URL
            </th>
            <th scope="col" className="px-4 py-3.5 sm:px-6">
              Answers
            </th>
            <th scope="col" className="px-4 py-3.5 sm:px-6">
              Answer status
            </th>
            <th scope="col" className="px-4 py-3.5 sm:px-6">
              Last updated
            </th>
          </tr>
        </thead>
        <tbody>
          {hasVenues ? (
            venues.map((venue) => <VenueRow key={venue.url} venue={venue} />)
          ) : (
            <tr>
              <td colSpan={4} className="px-8 py-14">
                {isLoadingFirstPage ? (
                  <p className="m-0 text-(--app-muted)" role="status">
                    Loading venues…
                  </p>
                ) : (
                  <>
                    <h2 className="m-0 text-[1.2rem] tracking-[-0.02em]">
                      {hasSearchTerm ? "No venues match this search" : "No venues saved yet"}
                    </h2>
                    <p className="mt-3 mb-0 max-w-[55ch] text-[0.9rem] leading-[1.65] text-(--app-muted)">
                      {hasSearchTerm
                        ? "Try a different venue name or URL."
                        : "Research a venue to save its name, source URL, and answers here."}
                    </p>
                  </>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MobileVenueList({
  venues,
  isLoadingFirstPage,
  searchTerm,
}: {
  venues: Venue[];
  isLoadingFirstPage: boolean;
  searchTerm: string;
}) {
  const hasVenues = venues.length > 0;
  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <>
      {hasVenues && (
        <ol className="m-0 list-none p-0 min-[681px]:hidden" aria-label="Saved venues">
          {venues.map((venue) => (
            <MobileVenueRow key={venue.url} venue={venue} />
          ))}
        </ol>
      )}

      {!hasVenues && isLoadingFirstPage && (
        <p className="m-0 px-4 py-10 text-(--app-muted) min-[681px]:hidden" role="status">
          Loading venues…
        </p>
      )}

      {!hasVenues && !isLoadingFirstPage && (
        <div className="px-4 py-10 min-[681px]:hidden">
          <h2 className="m-0 text-[1.2rem] tracking-[-0.02em]">
            {hasSearchTerm ? "No venues match this search" : "No venues saved yet"}
          </h2>
          <p className="mt-3 mb-0 max-w-[55ch] text-[0.9rem] leading-[1.65] text-(--app-muted)">
            {hasSearchTerm
              ? "Try a different venue name or URL."
              : "Research a venue to save its name, source URL, and published answers here."}
          </p>
        </div>
      )}
    </>
  );
}

function LoadMoreButton({
  canLoadMore,
  isLoadingMore,
  onLoadMore,
}: {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (!canLoadMore || isLoadingMore) return null;

  return (
    <button
      type="button"
      onClick={onLoadMore}
      disabled={isLoadingMore}
      className="cursor-pointer border border-(--app-line) px-3 py-2 font-sans text-xs font-semibold text-(--app-ink) underline-offset-4 hover:border-(--app-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) disabled:cursor-wait disabled:opacity-60"
    >
      {isLoadingMore ? "Loading…" : "Load more"}
    </button>
  );
}

export function VenuesPage({
  venues,
  isLoading,
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  searchTerm,
  onSearchTermChange,
}: {
  venues: Venue[];
  isLoading: boolean;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}) {
  const hasVenues = venues.length > 0;
  const isLoadingFirstPage = isLoading && !hasVenues;

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header variant="venues" />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-0 pb-12 sm:px-5">
        <TrailheadSurface />
        <div className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))]">
          <PageHero
            title="Venues"
            description="Venue names, source URLs, and accessibility answers saved for each venue."
            actionsClassName="flex flex-col items-start gap-3 max-[760px]:flex-row max-[760px]:items-center"
            actions={
              <Link
                to="/"
                className="inline-flex h-9 items-center gap-2 border border-(--app-accent) bg-(--app-accent) px-3 text-[0.7rem] font-semibold tracking-wide text-(--app-accent-ink) uppercase transition-[background-color,color] duration-200 hover:bg-(--app-accent-hover) hover:text-(--app-accent-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus) motion-reduce:transition-none"
              >
                <Plus aria-hidden="true" className="size-3.5" />
                Research a venue
              </Link>
            }
          />

          <section
            className="border-b border-(--app-line) px-8 py-5 max-[680px]:px-4"
            aria-labelledby="venue-search-label"
          >
            <SearchField
              id="venue-search"
              label="Search venues"
              placeholder="Search by venue name or URL"
              value={searchTerm}
              onChange={onSearchTermChange}
            />
          </section>

          <div
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 border-b border-(--app-line) bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-bg))] px-8 py-2.5 text-xs max-[680px]:px-4"
            role="status"
          >
            <p className="m-0 text-(--app-muted)" aria-live="polite">
              {isLoadingFirstPage ? "Loading saved venues…" : "Saved venue data"}
            </p>
            <p className="m-0 font-mono text-[0.68rem] text-(--app-muted)">
              Name · URL · answers · status
            </p>
          </div>

          <DesktopVenueList
            venues={venues}
            isLoadingFirstPage={isLoadingFirstPage}
            searchTerm={searchTerm}
          />
          <MobileVenueList
            venues={venues}
            isLoadingFirstPage={isLoadingFirstPage}
            searchTerm={searchTerm}
          />

          <footer className="flex justify-between gap-4 border-t border-(--app-line) px-8 py-4 font-mono text-[0.68rem] leading-normal text-(--app-muted) max-[680px]:flex-col max-[680px]:px-4">
            <span>BeforeDoors · Know before you go</span>
            <div className="flex items-center gap-4">
              <span>
                {isLoadingFirstPage ? "Loading venues…" : `${venues.length} venues loaded`}
              </span>
              <LoadMoreButton
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={onLoadMore}
              />
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
