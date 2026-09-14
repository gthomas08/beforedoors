import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";

import type { Doc } from "@my-better-t-app/backend/convex/_generated/dataModel";
import Header from "@/components/header";
import { ReportContourLines } from "@/components/report-contour-lines";
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
      {venue.publishedCount > 0 && <StatusCount label="Published" count={venue.publishedCount} />}
      {venue.confirmedCount > 0 && <StatusCount label="Confirmed" count={venue.confirmedCount} />}
    </div>
  );
}

function StatusCount({ label, count }: { label: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.76rem] leading-5">
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-(--app-muted)" />
      <span>
        {label} · {count}
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
      className="inline-flex max-w-full items-center gap-2 text-(--app-ink) underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
      aria-label={`Open venue source ${venue.url} in a new tab`}
    >
      <span className="break-all">{venue.url}</span>
      <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  );
}

function VenueRow({ venue }: { venue: Venue }) {
  return (
    <tr className="border-b border-(--app-line) align-top last:border-b-0">
      <th scope="row" className="px-4 py-5 text-left sm:px-6 sm:py-6">
        <Link
          to="/report"
          search={{ url: venue.url }}
          className="inline-flex items-center gap-2 text-[1rem] leading-tight font-semibold tracking-[-0.02em] underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
        >
          {venue.name || "Name not recorded"}
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>
        <span className="mt-2 block max-w-[38ch] font-mono text-[0.67rem] leading-5 text-(--app-muted)">
          <VenueSource venue={venue} />
        </span>
      </th>
      <td className="px-4 py-5 text-[0.82rem] leading-6 sm:px-6 sm:py-6">
        {venue.answerCount} {venue.answerCount === 1 ? "answer" : "answers"}
      </td>
      <td className="px-4 py-5 sm:px-6 sm:py-6">
        <StatusSummary venue={venue} />
      </td>
      <td className="px-4 py-5 text-[0.76rem] leading-5 text-(--app-muted) sm:px-6 sm:py-6">
        {formatUpdatedAt(venue.updatedAt)}
      </td>
    </tr>
  );
}

function MobileVenueRow({ venue }: { venue: Venue }) {
  return (
    <li className="border-b border-(--app-line) px-4 py-5 last:border-b-0">
      <div className="min-w-0">
        <h2 className="m-0 text-[1rem] leading-tight font-semibold tracking-[-0.02em]">
          <Link
            to="/report"
            search={{ url: venue.url }}
            className="inline-flex items-center gap-2 underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
          >
            {venue.name || "Name not recorded"}
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </h2>
        <div className="mt-2 font-mono text-[0.65rem] leading-5 text-(--app-muted)">
          <VenueSource venue={venue} />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-(--app-line) pt-4">
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-wide text-(--app-muted) uppercase">
            Answers
          </dt>
          <dd className="mt-1.5 mb-0 text-[0.78rem] leading-5">
            {venue.answerCount} {venue.answerCount === 1 ? "answer" : "answers"}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] font-semibold tracking-wide text-(--app-muted) uppercase">
            Last updated
          </dt>
          <dd className="mt-1.5 mb-0 text-[0.72rem] leading-5 text-(--app-muted)">
            {formatUpdatedAt(venue.updatedAt)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="font-mono text-[0.62rem] font-semibold tracking-wide text-(--app-muted) uppercase">
            Answer status
          </dt>
          <dd className="mt-1.5 mb-0">
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
}: {
  venues: Venue[];
  isLoadingFirstPage: boolean;
}) {
  const hasVenues = venues.length > 0;

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
          <col className="w-[39%]" />
          <col className="w-[15%]" />
          <col className="w-[28%]" />
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
                    <h2 className="m-0 text-[1.2rem] tracking-[-0.02em]">No venues saved yet</h2>
                    <p className="mt-3 mb-0 max-w-[55ch] text-[0.9rem] leading-[1.65] text-(--app-muted)">
                      Research a venue to save its name, source URL, and answers here.
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
}: {
  venues: Venue[];
  isLoadingFirstPage: boolean;
}) {
  const hasVenues = venues.length > 0;

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
          <h2 className="m-0 text-[1.2rem] tracking-[-0.02em]">No venues saved yet</h2>
          <p className="mt-3 mb-0 max-w-[55ch] text-[0.9rem] leading-[1.65] text-(--app-muted)">
            Research a venue to save its name, source URL, and published answers here.
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
  if (!canLoadMore && !isLoadingMore) return null;

  return (
    <button
      type="button"
      onClick={onLoadMore}
      disabled={isLoadingMore}
      className="border border-(--app-line) px-3 py-2 font-sans text-xs font-semibold text-(--app-ink) underline-offset-4 hover:border-(--app-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) disabled:cursor-wait disabled:opacity-60"
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
}: {
  venues: Venue[];
  isLoading: boolean;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  const hasVenues = venues.length > 0;
  const isLoadingFirstPage = isLoading && !hasVenues;
  const latestUpdatedAt = venues.reduce((latest, venue) => Math.max(latest, venue.updatedAt), 0);
  let latestUpdateLabel = "Not recorded";
  if (hasVenues) latestUpdateLabel = formatUpdatedAt(latestUpdatedAt);

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header alignment="report" variant="venues" />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-5 pb-12 max-[680px]:px-0">
        <TrailheadSurface />
        <div className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))] max-[680px]:border-x-0">
          <header className="relative isolate flex min-h-64 items-end justify-between gap-8 border-b border-(--app-line) px-8 pt-12 pb-10 max-[760px]:flex-col max-[760px]:items-start max-[680px]:min-h-68 max-[680px]:px-4 max-[680px]:pt-10 max-[680px]:pb-8">
            <div className="relative z-10 min-w-0">
              <h1 className="m-0 max-w-none text-[clamp(3rem,7vw,5.6rem)] leading-[0.88] font-semibold tracking-[-0.04em]">
                Venues
              </h1>
              <p className="mt-5 mb-0 max-w-[58ch] text-[0.95rem] leading-7 text-(--app-muted) sm:text-base">
                Venue names, source URLs, and accessibility answers saved for each venue.
              </p>
            </div>

            <div className="relative z-10 flex shrink-0 flex-col items-start gap-3 max-[760px]:flex-row max-[760px]:items-center">
              <p className="m-0 max-w-60 font-mono text-[0.7rem] leading-5 text-(--app-muted)">
                Latest update shown
                <br />
                <span className="text-(--app-accent-hover)">{latestUpdateLabel}</span>
              </p>
              <Link
                to="/"
                className="inline-flex h-9 items-center gap-2 border border-(--app-accent) bg-transparent px-3 text-[0.7rem] font-semibold tracking-wide text-(--app-accent-hover) uppercase transition-[background-color,color] duration-200 hover:bg-(--app-accent) hover:text-(--app-accent-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus) motion-reduce:transition-none"
              >
                <Plus aria-hidden="true" className="size-3.5" />
                Research a venue
              </Link>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 z-[-1] w-[52%] max-[680px]:inset-0 max-[680px]:w-full max-[680px]:opacity-55">
              <ReportContourLines />
            </div>
          </header>

          <div
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 border-b border-(--app-line) bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-bg))] px-8 py-2.5 text-xs max-[680px]:px-4"
            role="status"
          >
            <p className="m-0 text-(--app-muted)" aria-live="polite">
              {isLoadingFirstPage ? "Loading saved venues…" : "Saved venue data · live updates"}
            </p>
            <p className="m-0 font-mono text-[0.68rem] text-(--app-muted)">
              Name · URL · answers · status
            </p>
          </div>

          <DesktopVenueList venues={venues} isLoadingFirstPage={isLoadingFirstPage} />
          <MobileVenueList venues={venues} isLoadingFirstPage={isLoadingFirstPage} />

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
