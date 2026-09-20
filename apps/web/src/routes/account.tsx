import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Heart,
  Inbox,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { toast } from "sonner";

import Header from "@/components/header";
import { PageHero } from "@/components/page-hero";
import { SearchField } from "@/components/search-field";
import { TrailheadSurface } from "@/components/trailhead-surface";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUpdatedAt } from "@/lib/format-date";
import { createSiteMeta } from "@/lib/site-meta";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: createSiteMeta({
      title: "BeforeDoors · Account",
      description: "Review your BeforeDoors email activity and favorite venues.",
    }),
  }),
});

type AccountMessage = {
  id: string;
  direction: "sent" | "received";
  from: string | null;
  to: string[];
  subject: string | null;
  text: string;
  timestamp: number;
  status:
    | "pending"
    | "sent"
    | "failed"
    | "delivered"
    | "bounced"
    | "complained"
    | "rejected"
    | null;
};

type AccountThread = {
  id: string;
  threadId: string | null;
  venueName: string;
  venueUrl: string;
  subject: string;
  timestamp: number;
  status: NonNullable<AccountMessage["status"]>;
  replyCount: number;
  errorMessage: string | null;
  messages: AccountMessage[];
};

type FavoriteVenue = {
  _id: string;
  venueId: Id<"venues">;
  name: string;
  url: string;
  updatedAt: number;
  answerCount: number;
  publishedCount: number;
  confirmedCount: number;
};

type ActivityFilter = "all" | "waiting" | "replied";
type AccountSection = "favorites" | "activity";

const ACCOUNT_PAGE_SIZE = 5;

const activityDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

function formatActivityTimestamp(timestamp: number) {
  return activityDateFormatter.format(timestamp);
}

function isDeliveryIssue(thread: AccountThread) {
  return (
    thread.status === "failed" ||
    thread.status === "bounced" ||
    thread.status === "complained" ||
    thread.status === "rejected"
  );
}

function getThreadState(thread: AccountThread) {
  if (thread.replyCount > 0) {
    return {
      label: "Reply received",
      icon: Check,
      className: "text-(--status-verified)",
    };
  }

  if (isDeliveryIssue(thread)) {
    return {
      label: "Delivery issue",
      icon: CircleAlert,
      className: "text-(--status-signal)",
    };
  }

  if (thread.status === "delivered") {
    return {
      label: "Delivered",
      icon: Check,
      className: "text-(--status-verified)",
    };
  }

  return {
    label: "Awaiting reply",
    icon: Clock3,
    className: "text-(--status-pending)",
  };
}

function AccountSectionTabs({
  activeSection,
  onSectionChange,
}: {
  activeSection: AccountSection;
  onSectionChange: (section: AccountSection) => void;
}) {
  return (
    <nav aria-label="Account sections" className="border-b border-(--app-line) px-5 sm:px-8">
      <div className="flex min-h-12 items-center gap-5" role="tablist">
        {(
          [
            ["favorites", "Favorite venues", "account-favorites-panel"],
            ["activity", "Email activity", "account-activity-panel"],
          ] as const
        ).map(([section, label, panelId]) => {
          const isActive = activeSection === section;

          return (
            <button
              key={section}
              id={`${panelId}-tab`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => onSectionChange(section)}
              className={`inline-flex h-8 cursor-pointer items-center text-xs font-semibold tracking-[0.08em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) ${
                isActive
                  ? "text-(--app-ink) underline decoration-(--app-accent) decoration-2 underline-offset-4"
                  : "text-(--app-muted) hover:text-(--app-ink)"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SignedOutState() {
  return (
    <section className="border-b border-(--app-line)">
      <Empty className="min-h-72 px-5 py-12 sm:px-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldCheck aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Sign in to open your record</EmptyTitle>
          <EmptyDescription>
            Your venue questions and replies are kept here once you sign in from the header.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            to="/"
            className="inline-flex h-9 items-center gap-2 border border-(--app-accent) bg-(--app-accent) px-3 text-xs font-semibold tracking-[0.08em] text-(--app-accent-ink) uppercase transition-colors hover:bg-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
          >
            Return home
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </EmptyContent>
      </Empty>
    </section>
  );
}

function ActivityMessage({ message }: { message: AccountMessage }) {
  const isSent = message.direction === "sent";
  const counterpart = isSent ? message.to.join(", ") : message.from;
  const Icon = isSent ? Send : MessageCircle;

  return (
    <li className="grid gap-3 border-b border-(--app-line) px-5 py-5 last:border-b-0 sm:px-8 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-semibold tracking-[0.1em] text-(--app-muted) uppercase">
        <span className="inline-flex items-center gap-2">
          <Icon aria-hidden="true" className="size-3.5 text-(--app-accent-hover)" />
          {isSent ? "Sent from BeforeDoors" : "Reply received"}
        </span>
        <time
          dateTime={new Date(message.timestamp).toISOString()}
          className="font-mono font-normal tracking-normal normal-case"
        >
          {formatActivityTimestamp(message.timestamp)}
        </time>
      </div>

      <dl className="grid gap-1 text-xs leading-5 text-(--app-muted) sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:gap-x-3">
        <dt className="font-mono text-xs font-semibold tracking-[0.1em] uppercase">
          {isSent ? "To" : "From"}
        </dt>
        <dd className="m-0 break-all text-(--app-ink)">{counterpart || "Address not recorded"}</dd>
        {message.subject && (
          <>
            <dt className="font-mono text-xs font-semibold tracking-[0.1em] uppercase">Subject</dt>
            <dd className="m-0 text-(--app-ink)">{message.subject}</dd>
          </>
        )}
      </dl>

      <p className="m-0 max-w-[75ch] text-sm leading-7 whitespace-pre-wrap text-(--app-ink)">
        {message.text || "No message text was recorded for this email."}
      </p>
    </li>
  );
}

function ActivityThread({ thread }: { thread: AccountThread }) {
  const state = getThreadState(thread);
  const StateIcon = state.icon;
  const sentCount = thread.messages.filter((message) => message.direction === "sent").length;

  return (
    <details className="group border-b border-(--app-line) last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-5 transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--app-accent)_5%,transparent)] focus-visible:bg-[color-mix(in_oklch,var(--app-accent)_8%,transparent)] focus-visible:ring-2 focus-visible:ring-(--app-focus) focus-visible:ring-inset sm:px-8 sm:py-6 [&::-webkit-details-marker]:hidden">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center border border-(--app-line) bg-(--app-field) text-(--app-accent-hover)">
          <Mail aria-hidden="true" className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="truncate text-[0.98rem] font-semibold tracking-[-0.015em]">
              {thread.venueName}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase ${state.className}`}
            >
              <StateIcon aria-hidden="true" className="size-3.5" />
              {state.label}
            </span>
          </span>
          <span className="mt-1.5 block truncate text-sm text-(--app-muted)">{thread.subject}</span>
          <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs leading-5 text-(--app-muted)">
            <span>{sentCount} sent</span>
            <span aria-hidden="true">·</span>
            <span>
              {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
            </span>
            <span aria-hidden="true">·</span>
            <span>{thread.threadId ? "Thread linked" : "Thread forming"}</span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-3 pt-1 text-right">
          <time
            dateTime={new Date(thread.timestamp).toISOString()}
            className="hidden font-mono text-xs leading-5 text-(--app-muted) sm:block"
          >
            {formatUpdatedAt(thread.timestamp)}
          </time>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-(--app-muted) transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </span>
      </summary>

      <div className="border-t border-(--app-line) bg-[color-mix(in_oklch,var(--app-field)_42%,transparent)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--app-line) px-5 py-3.5 text-xs sm:px-8">
          <a
            href={thread.venueUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-2 break-all text-(--app-ink) underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
          >
            {thread.venueUrl}
            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
          </a>
          {thread.errorMessage && (
            <span className="inline-flex items-center gap-1.5 text-destructive" role="alert">
              <CircleAlert aria-hidden="true" className="size-3.5" />
              {thread.errorMessage}
            </span>
          )}
        </div>

        <ol
          aria-label={`Messages in thread about ${thread.venueName}`}
          className="m-0 list-none p-0"
        >
          {thread.messages.map((message) => (
            <ActivityMessage key={message.id} message={message} />
          ))}
        </ol>
      </div>
    </details>
  );
}

function ActivityFilters({
  filter,
  onFilterChange,
  threads,
}: {
  filter: ActivityFilter;
  onFilterChange: (filter: ActivityFilter) => void;
  threads: AccountThread[];
}) {
  const counts = {
    all: threads.length,
    replied: threads.filter((thread) => thread.replyCount > 0).length,
    waiting: threads.filter((thread) => thread.replyCount === 0 && !isDeliveryIssue(thread)).length,
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-(--app-line) px-5 py-3 sm:px-8"
      role="group"
      aria-label="Filter email activity"
    >
      {(
        [
          ["all", "All threads"],
          ["waiting", "Awaiting reply"],
          ["replied", "With replies"],
        ] as const
      ).map(([value, label]) => (
        <Button
          key={value}
          type="button"
          variant={filter === value ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={filter === value}
          onClick={() => onFilterChange(value)}
          className="h-8 gap-2 px-2.5 text-xs font-semibold tracking-[0.06em] uppercase"
        >
          {label}
          <span className="font-mono text-xs font-normal">{counts[value]}</span>
        </Button>
      ))}
    </div>
  );
}

function FavoriteVenueRow({ venue }: { venue: FavoriteVenue }) {
  const setVenueFavorite = useMutation(api.favorites.setVenueFavorite);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await setVenueFavorite({ venueId: venue.venueId, isFavorite: false });
      toast.success("Venue removed from favorites.");
    } catch {
      toast.error("We couldn’t update this favorite. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <li className="border-b border-(--app-line) px-5 py-5 last:border-b-0 sm:px-8 sm:py-6">
      <div className="flex items-start gap-4">
        <button
          type="button"
          aria-label={`Remove ${venue.name || "venue"} from favorites`}
          aria-pressed={true}
          disabled={isRemoving}
          onClick={() => void handleRemove()}
          title="Remove from favorites"
          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center border border-(--app-accent) bg-[color-mix(in_oklch,var(--app-accent)_12%,var(--app-field))] text-(--app-accent-hover) transition-colors hover:bg-(--app-accent) hover:text-(--app-accent-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
        >
          <Heart aria-hidden="true" className="size-4 fill-current" />
        </button>

        <div className="min-w-0 flex-1">
          <Link
            to="/report"
            search={{ url: venue.url }}
            className="inline-flex max-w-full items-center gap-2 text-base leading-tight font-semibold tracking-[-0.015em] underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
          >
            <span className="truncate">{venue.name || "Name not recorded"}</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
          </Link>
          <a
            href={venue.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${venue.name || "venue"} source ${venue.url} in a new tab`}
            className="mt-2 flex max-w-full items-center gap-1.5 font-mono text-xs leading-5 text-(--app-muted) underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
          >
            <span className="truncate">{venue.url}</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
          </a>
        </div>

        <p className="m-0 shrink-0 text-right font-mono text-xs leading-5 text-(--app-muted)">
          {venue.answerCount} {venue.answerCount === 1 ? "answer" : "answers"}
          <br />
          {formatUpdatedAt(venue.updatedAt)}
        </p>
      </div>
    </li>
  );
}

function FavoriteVenues({
  venues,
  isLoading,
  canLoadMore,
  isLoadingMore,
  onLoadMore,
}: {
  venues: FavoriteVenue[];
  isLoading: boolean;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredVenues = normalizedSearchTerm
    ? venues.filter((venue) => venue.name.toLowerCase().includes(normalizedSearchTerm))
    : venues;
  const hasSearchTerm = normalizedSearchTerm.length > 0;
  const isLoadingFirstPage = isLoading && venues.length === 0;

  return (
    <section
      id="account-favorites-panel"
      role="tabpanel"
      aria-labelledby="account-favorites-panel-tab"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--app-line) px-5 py-7 sm:px-8 sm:py-8">
        <div>
          <div className="flex items-center gap-3">
            <Heart aria-hidden="true" className="size-5 text-(--app-accent-hover)" />
            <h2
              id="favorite-venues-title"
              className="m-0 text-2xl font-semibold tracking-[-0.03em]"
            >
              Favorite venues
            </h2>
          </div>
          <p className="mt-2 mb-0 max-w-[62ch] text-sm leading-6 text-(--app-muted)">
            Venues you’ve saved for a closer look, ready to open with their latest answers.
          </p>
        </div>
        <p className="m-0 inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] text-(--app-muted) uppercase">
          <span aria-hidden="true" className="size-2 rounded-full bg-(--status-verified)" />
          Favorite record
        </p>
      </div>

      <div className="border-b border-(--app-line) px-5 py-4 sm:px-8">
        <SearchField
          id="favorite-venue-search"
          label="Filter favorite venues"
          placeholder="Filter by venue name"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {isLoadingFirstPage ? (
        <div className="grid" role="status" aria-label="Loading favorite venues">
          {["one", "two"].map((key) => (
            <div
              key={key}
              className="flex items-start gap-4 border-b border-(--app-line) px-5 py-5 last:border-b-0 sm:px-8 sm:py-6"
            >
              <Skeleton className="size-9 shrink-0" />
              <div className="grid min-w-0 flex-1 gap-3">
                <Skeleton className="h-4 w-52 max-w-[70%]" />
                <Skeleton className="h-3 w-80 max-w-[90%]" />
              </div>
              <Skeleton className="hidden h-3 w-24 sm:block" />
            </div>
          ))}
        </div>
      ) : filteredVenues.length > 0 ? (
        <ul aria-label="Favorite venues" className="m-0 list-none p-0">
          {filteredVenues.map((venue) => (
            <FavoriteVenueRow key={venue._id} venue={venue} />
          ))}
        </ul>
      ) : venues.length > 0 ? (
        <div className="flex min-h-48 flex-col items-start justify-center gap-3 border-b border-(--app-line) px-5 py-10 sm:px-8">
          <p className="m-0 text-sm font-semibold">No favorite venues match this search</p>
          <p className="m-0 text-sm leading-6 text-(--app-muted)">
            Try a different venue name or load more saved venues.
          </p>
        </div>
      ) : (
        <Empty className="min-h-64 border-b border-(--app-line) px-5 py-12 sm:px-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No favorite venues yet</EmptyTitle>
            <EmptyDescription>
              Save a venue from its answers page to keep it close at hand here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              to="/venues"
              className="inline-flex h-9 items-center gap-2 border border-(--app-accent) bg-transparent px-3 text-xs font-semibold tracking-[0.08em] text-(--app-accent-hover) uppercase transition-colors hover:bg-(--app-accent) hover:text-(--app-accent-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
            >
              Browse venues
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </EmptyContent>
        </Empty>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--app-line) px-5 py-4 sm:px-8">
        <p className="m-0 font-mono text-xs leading-5 text-(--app-muted)" aria-live="polite">
          {isLoadingFirstPage
            ? "Checking your favorite venues…"
            : hasSearchTerm
              ? `${filteredVenues.length} matching venue${filteredVenues.length === 1 ? "" : "s"}`
              : `${venues.length} venue${venues.length === 1 ? "" : "s"} loaded`}
        </p>
        {canLoadMore && !isLoadingMore ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="border-(--app-line) text-xs font-semibold tracking-[0.08em] uppercase"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function AccountActivity({
  threads,
  isLoading,
  canLoadMore,
  isLoadingMore,
  onLoadMore,
}: {
  threads: AccountThread[];
  isLoading: boolean;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibleThreads = threads.filter((thread) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "replied" && thread.replyCount > 0) ||
      (filter === "waiting" && thread.replyCount === 0 && !isDeliveryIssue(thread));
    if (!matchesFilter) return false;

    return (
      normalizedSearchTerm.length === 0 ||
      thread.venueName.toLowerCase().includes(normalizedSearchTerm)
    );
  });
  const hasSearchTerm = normalizedSearchTerm.length > 0;
  const isLoadingFirstPage = isLoading && threads.length === 0;

  return (
    <section
      id="account-activity-panel"
      role="tabpanel"
      aria-labelledby="account-activity-panel-tab"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--app-line) px-5 py-7 sm:px-8 sm:py-8">
        <div>
          <div className="flex items-center gap-3">
            <Inbox aria-hidden="true" className="size-5 text-(--app-accent-hover)" />
            <h2 id="activity-title" className="m-0 text-2xl font-semibold tracking-[-0.03em]">
              Email activity
            </h2>
          </div>
          <p className="mt-2 mb-0 max-w-[62ch] text-sm leading-6 text-(--app-muted)">
            Questions you sent to venues and the replies that came back, kept together by thread.
          </p>
        </div>
        <p className="m-0 inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] text-(--app-muted) uppercase">
          <span aria-hidden="true" className="size-2 rounded-full bg-(--status-verified)" />
          Email record
        </p>
      </div>

      <div className="border-b border-(--app-line) px-5 py-4 sm:px-8">
        <SearchField
          id="activity-venue-search"
          label="Filter email activity"
          placeholder="Filter by venue name"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <ActivityFilters filter={filter} onFilterChange={setFilter} threads={threads} />

      {isLoadingFirstPage ? (
        <div className="grid" role="status" aria-label="Loading email activity">
          {["one", "two", "three"].map((key) => (
            <div
              key={key}
              className="flex items-start gap-4 border-b border-(--app-line) px-5 py-5 last:border-b-0 sm:px-8 sm:py-6"
            >
              <Skeleton className="size-9 shrink-0" />
              <div className="grid min-w-0 flex-1 gap-3">
                <Skeleton className="h-4 w-48 max-w-[70%]" />
                <Skeleton className="h-3 w-72 max-w-[90%]" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="hidden h-3 w-20 sm:block" />
            </div>
          ))}
        </div>
      ) : visibleThreads.length > 0 ? (
        <div>
          {visibleThreads.map((thread) => (
            <ActivityThread key={thread.id} thread={thread} />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <Empty className="min-h-80 border-b border-(--app-line) px-5 py-12 sm:px-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No email threads yet</EmptyTitle>
            <EmptyDescription>
              When you ask a venue a question, the outgoing note and any reply will appear here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-2 border border-(--app-accent) bg-transparent px-3 text-xs font-semibold tracking-[0.08em] text-(--app-accent-hover) uppercase transition-colors hover:bg-(--app-accent) hover:text-(--app-accent-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
            >
              Research a venue
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex min-h-48 flex-col items-start justify-center gap-3 border-b border-(--app-line) px-5 py-10 sm:px-8">
          <p className="m-0 text-sm font-semibold">
            {hasSearchTerm ? "No email threads match this search" : "No threads match this view"}
          </p>
          <p className="m-0 text-sm leading-6 text-(--app-muted)">
            {hasSearchTerm
              ? "Try a different venue name or load more email activity."
              : "Try the full activity list to see every thread in your record."}
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => {
              setFilter("all");
              setSearchTerm("");
            }}
            className="h-auto px-0 text-xs font-semibold tracking-[0.08em] uppercase"
          >
            Clear filters
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--app-line) px-5 py-4 sm:px-8">
        <p className="m-0 font-mono text-xs leading-5 text-(--app-muted)" aria-live="polite">
          {isLoadingFirstPage
            ? "Checking your email activity…"
            : filter !== "all" || hasSearchTerm
              ? `${visibleThreads.length} matching thread${visibleThreads.length === 1 ? "" : "s"}`
              : `${threads.length} thread${threads.length === 1 ? "" : "s"} loaded`}
        </p>
        {canLoadMore && !isLoadingMore ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="border-(--app-line) text-xs font-semibold tracking-[0.08em] uppercase"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function AccountPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [activeSection, setActiveSection] = useState<AccountSection>("favorites");
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const favoriteVenues = usePaginatedQuery(
    api.favorites.listMyFavoriteVenues,
    isAuthenticated ? {} : "skip",
    { initialNumItems: ACCOUNT_PAGE_SIZE },
  );
  const activity = usePaginatedQuery(
    api.venueQuestions.listMyEmailThreads,
    isAuthenticated ? {} : "skip",
    { initialNumItems: ACCOUNT_PAGE_SIZE },
  );
  const isAccountHeadingReady = !isAuthLoading && (!isAuthenticated || user !== undefined);

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header linkToVenues />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-0 pb-12 sm:px-5">
        <TrailheadSurface />
        <div className="relative z-10 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))]">
          <PageHero
            title={
              isAuthenticated ? (
                <>
                  <span>Hello, </span>
                  <span className="wrap-break-word text-(--app-accent-hover)">
                    {user?.username}
                  </span>
                </>
              ) : (
                "Your BeforeDoors"
              )
            }
            titleClassName={`text-balance${isAccountHeadingReady ? "" : " invisible"}`}
            description="A BeforeDoors record of the questions you’ve sent, the responses you’ve received, and the venues you’ve saved."
            descriptionClassName="max-w-[60ch]"
            actionsClassName="flex items-end gap-6 max-[760px]:mt-4 max-[760px]:items-start"
            actions={
              <p className="m-0 max-w-52 font-mono text-xs leading-5 text-(--app-muted)">
                Personal record
                <br />
                <span className="text-(--app-accent-hover)">Activity</span>
              </p>
            }
            className="px-5 py-7 sm:px-8 sm:py-8"
          />

          {isAuthLoading || isAuthenticated ? (
            <>
              <AccountSectionTabs
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
              {activeSection === "favorites" ? (
                <FavoriteVenues
                  venues={favoriteVenues.results as FavoriteVenue[]}
                  isLoading={favoriteVenues.status === "LoadingFirstPage"}
                  canLoadMore={favoriteVenues.status === "CanLoadMore"}
                  isLoadingMore={favoriteVenues.status === "LoadingMore"}
                  onLoadMore={() => favoriteVenues.loadMore(ACCOUNT_PAGE_SIZE)}
                />
              ) : (
                <AccountActivity
                  threads={activity.results as AccountThread[]}
                  isLoading={activity.status === "LoadingFirstPage"}
                  canLoadMore={activity.status === "CanLoadMore"}
                  isLoadingMore={activity.status === "LoadingMore"}
                  onLoadMore={() => activity.loadMore(ACCOUNT_PAGE_SIZE)}
                />
              )}
            </>
          ) : (
            <SignedOutState />
          )}

          <footer className="flex flex-wrap justify-between gap-4 px-5 py-4 font-mono text-xs leading-5 text-(--app-muted) sm:px-8">
            <span>BeforeDoors · Know before you go</span>
            <span>Personal record · Activity + saved venues</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
