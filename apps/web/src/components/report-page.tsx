import { Link } from "@tanstack/react-router";
import { Dialog } from "@base-ui/react/dialog";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, ArrowUpRight, Heart, MessageCircleQuestion, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { api } from "@beforedoors/backend/convex/_generated/api";
import type { Doc, Id } from "@beforedoors/backend/convex/_generated/dataModel";
import Header from "@/components/header";
import { answerStatusMeta } from "@/components/answer-status";
import { PageHero } from "@/components/page-hero";
import { TrailheadSurface } from "@/components/trailhead-surface";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatUpdatedAt } from "@/lib/format-date";

type VenueAnswer = Pick<
  Doc<"venueAnswers">,
  "answerIndex" | "question" | "answer" | "url" | "status"
>;
type Venue = Pick<Doc<"venues">, "_id" | "name" | "url" | "updatedAt" | "contactEmail"> & {
  answerCount: number;
  answers: VenueAnswer[];
};

function StatusIndicator({ status }: { status: VenueAnswer["status"] }) {
  const statusMeta = answerStatusMeta[status];

  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClassName}`} />
      <span className="text-[0.72rem] leading-[1.35] font-semibold text-(--app-ink)">
        {statusMeta.label}
      </span>
    </span>
  );
}

function SourceUrl({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label} ${url} in a new tab`}
      className="inline-flex max-w-full min-w-0 items-center gap-1.5 overflow-hidden font-mono text-[0.68rem] leading-4 text-(--app-ink) underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
    >
      <span className="min-w-0 truncate">{url}</span>
      <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  );
}

function QuestionRow({
  answer,
  index,
  isHighlighted,
}: {
  answer: VenueAnswer;
  index: number;
  isHighlighted: boolean;
}) {
  return (
    <li
      id={`venue-answer-${index}`}
      className={`border-b border-(--app-line) px-8 py-4 last:border-b-0 max-[680px]:px-4 max-[680px]:py-4 ${
        isHighlighted ? "answer-jump-flash" : ""
      }`}
    >
      <article className="grid grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.5fr)_minmax(13rem,0.8fr)] gap-4 max-[900px]:grid-cols-1 max-[900px]:gap-2">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 font-mono text-[0.72rem] font-bold tracking-[0.12em] text-(--app-accent-hover)"
          >
            Q
          </span>
          <h2
            id={`venue-question-${index}`}
            tabIndex={-1}
            className="m-0 max-w-none text-base leading-[1.15] font-semibold tracking-[-0.03em] focus:outline-none focus-visible:underline focus-visible:decoration-(--app-accent) focus-visible:underline-offset-4 lg:text-xl"
          >
            {answer.question}
          </h2>
        </div>

        <div className="min-w-0">
          <p className="m-0 max-w-[64ch] text-sm leading-normal">{answer.answer}</p>
        </div>

        <div className="flex min-w-0 flex-col items-end gap-2 max-[900px]:mt-0.5 max-[900px]:items-start">
          <StatusIndicator status={answer.status} />
          {answer.status === "published" ? (
            <SourceUrl url={answer.url} label="Open answer source" />
          ) : null}
        </div>
      </article>
    </li>
  );
}

function AnswerSearchPanel({
  venueId,
  inputRef,
  onClose,
  onSelectAnswer,
}: {
  venueId: Venue["_id"];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSelectAnswer: (answerIndex: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputId = useId();
  const listboxId = useId();
  const optionIdPrefix = useId();
  const searchResult = useQuery(
    api.venues.searchVenueAnswers,
    query.trim() ? { venueId, searchTerm: query.trim() } : "skip",
  );
  const matches = searchResult?.results ?? [];
  const activeMatch = matches[activeIndex];
  const isSearching = query.trim().length > 0 && searchResult === undefined;

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (matches.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + matches.length) % matches.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(matches.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSelectAnswer((activeMatch ?? matches[0]).answerIndex);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-60 bg-[oklch(0.14_0.11_255_/_82%)]" />
        <Dialog.Viewport className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto px-4 pt-18 pb-6 sm:pt-20">
          <Dialog.Popup
            id="venue-answer-search-panel"
            initialFocus={inputRef}
            className="max-h-[calc(100svh-3rem)] w-full max-w-2xl overflow-y-auto border border-(--app-field-border) bg-(--app-filter) text-(--app-ink) shadow-overlay-large outline-none"
          >
            <div className="flex items-start justify-between gap-5 border-b border-(--app-line) px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <Dialog.Title className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                  Find an answer
                </Dialog.Title>
                <Dialog.Description className="mt-1 max-w-[52ch] text-sm leading-5 text-(--app-muted)">
                  Search a venue question or answer, then choose a result to jump to it.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close answer search"
                className="flex size-9 shrink-0 items-center justify-center border border-transparent text-(--app-muted) hover:border-(--app-line) hover:text-(--app-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
              >
                <X aria-hidden="true" className="size-4" />
              </Dialog.Close>
            </div>

            <div className="flex items-center gap-3 border-b border-(--app-line) px-5 sm:px-7">
              <Search aria-hidden="true" className="size-4 shrink-0 text-(--app-muted)" />
              <label htmlFor={inputId} className="sr-only">
                Search questions and answers
              </label>
              <Input
                ref={inputRef}
                id={inputId}
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={matches.length > 0}
                aria-controls={matches.length > 0 ? listboxId : undefined}
                aria-activedescendant={activeMatch ? `${optionIdPrefix}-${activeIndex}` : undefined}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search questions and answers"
                autoComplete="off"
                maxLength={200}
                className="h-14 border-0 bg-transparent px-0 text-base text-(--app-field-ink) caret-(--app-accent) shadow-none placeholder:text-(--app-field-placeholder) focus-visible:ring-0"
              />
            </div>

            {!query.trim() && (
              <p className="m-0 px-5 py-5 text-sm leading-6 text-(--app-muted)">
                Type a topic or phrase to find its question and sourced answer.
              </p>
            )}

            {isSearching && (
              <p className="m-0 px-5 py-5 text-sm leading-6 text-(--app-muted)" role="status">
                Searching venue answers…
              </p>
            )}

            {!isSearching && query.trim() && matches.length === 0 && (
              <p className="m-0 px-5 py-5 text-sm leading-6 text-(--app-muted)" role="status">
                No answers match “{query.trim()}”. Try another word or phrase.
              </p>
            )}

            {matches.length > 0 && (
              <>
                <p className="sr-only" role="status" aria-live="polite">
                  {matches.length} matching {matches.length === 1 ? "answer" : "answers"}. Use the
                  arrow keys to choose one.
                </p>
                <ul
                  id={listboxId}
                  role="listbox"
                  aria-label="Matching venue questions and answers"
                  className="m-0 max-h-[min(22rem,45svh)] list-none overflow-y-auto p-0"
                >
                  {matches.map(({ answer, answerIndex, question }, index) => (
                    <li
                      id={`${optionIdPrefix}-${index}`}
                      key={`${answerIndex}-${question}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseDown={(event) => event.preventDefault()}
                      onPointerMove={() => setActiveIndex(index)}
                      onClick={() => onSelectAnswer(answerIndex)}
                      className={`cursor-pointer border-b border-(--app-line) px-5 py-3.5 last:border-b-0 focus:outline-none ${
                        activeIndex === index
                          ? "bg-[color-mix(in_oklch,var(--app-accent)_12%,var(--app-field))]"
                          : "hover:bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-field))]"
                      }`}
                    >
                      <span className="block text-sm leading-5 font-semibold text-(--app-ink)">
                        {question}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[0.78rem] leading-5 text-(--app-muted)">
                        {answer}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-(--app-line) px-5 py-2.5 font-mono text-xs text-(--app-muted)">
                  <span>
                    {matches.length} {matches.length === 1 ? "match" : "matches"} · showing up to 5
                  </span>
                  <span className="flex items-center gap-3">
                    <span>
                      <kbd className="border border-(--app-line) px-1">↑</kbd>{" "}
                      <kbd className="border border-(--app-line) px-1">↓</kbd> to move
                    </span>
                    <span>
                      <kbd className="border border-(--app-line) px-1">Enter</kbd> to jump
                    </span>
                  </span>
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VenueFavoriteButton({ venueId, venueName }: { venueId: Venue["_id"]; venueName: string }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const favorite = useQuery(api.favorites.getVenueFavorite, isAuthenticated ? { venueId } : "skip");
  const setVenueFavorite = useMutation(api.favorites.setVenueFavorite);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFavorite = async () => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      toast.error("Sign in to favorite venues.");
      return;
    }

    if (favorite === undefined || isUpdating) return;

    setIsUpdating(true);
    try {
      const result = await setVenueFavorite({
        venueId,
        isFavorite: !favorite.isFavorite,
      });
      toast.success(
        result.isFavorite ? "Venue added to favorites." : "Venue removed from favorites.",
      );
    } catch {
      toast.error("We couldn’t update this favorite. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isFavorite = favorite?.isFavorite ?? false;
  const isChecking = isAuthLoading || (isAuthenticated && favorite === undefined);

  return (
    <button
      type="button"
      aria-label={`${isFavorite ? "Remove favorite" : "Favorite"} ${venueName || "this venue"}`}
      aria-pressed={isFavorite}
      disabled={isChecking || isUpdating}
      onClick={() => void handleFavorite()}
      className={`inline-flex h-10 w-44 shrink-0 cursor-pointer items-center justify-center gap-2 border px-4 text-xs font-semibold tracking-[0.08em] uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${
        isFavorite
          ? "border-(--app-accent) bg-(--app-accent) text-(--app-accent-ink) hover:bg-(--app-accent-hover)"
          : "border-(--app-field-border) bg-(--app-field) text-(--app-ink) hover:bg-[color-mix(in_oklch,var(--app-accent)_12%,var(--app-field))]"
      }`}
    >
      <Heart aria-hidden="true" className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
      {isChecking ? "Checking…" : isFavorite ? "Favorited" : "Favorite venue"}
    </button>
  );
}

export function VenueInfoPage({ venue }: { venue: Venue }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedAnswerIndex, setHighlightedAnswerIndex] = useState<number | null>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const hasVerifiedContactEmail = Boolean(
    venue.contactEmail?.trim() && !venue.contactEmail.toLowerCase().endsWith(".invalid"),
  );

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current !== null) window.clearTimeout(highlightTimeoutRef.current);
    },
    [],
  );

  const openSearch = () => setIsSearchOpen(true);

  const closeSearch = () => setIsSearchOpen(false);

  const handleSelectAnswer = (answerIndex: number) => {
    setIsSearchOpen(false);
    setHighlightedAnswerIndex(null);

    if (highlightTimeoutRef.current !== null) window.clearTimeout(highlightTimeoutRef.current);

    window.requestAnimationFrame(() => {
      const answerRow = document.getElementById(`venue-answer-${answerIndex}`);
      const questionHeading = document.getElementById(`venue-question-${answerIndex}`);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      setHighlightedAnswerIndex(answerIndex);
      answerRow?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
      questionHeading?.focus({ preventScroll: true });
      highlightTimeoutRef.current = window.setTimeout(
        () => setHighlightedAnswerIndex(null),
        prefersReducedMotion ? 1800 : 2400,
      );
    });
  };

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header variant="report" />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-0 pb-12 sm:px-5">
        <TrailheadSurface />
        <div className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))]">
          <PageHero
            title={venue.name || "Venue name not recorded"}
            titleAttribute={venue.name || "Venue name not recorded"}
            titleClassName="truncate"
            descriptionClassName="max-w-full min-w-0 overflow-hidden"
            description={
              venue.answerCount > 0 ? (
                <SourceUrl url={venue.url} label="Open venue URL" />
              ) : undefined
            }
            actionsClassName="flex items-end gap-5 max-[760px]:mt-4 max-[760px]:items-start"
            actions={
              <p className="m-0 max-w-60 font-mono text-[0.72rem] leading-normal text-(--app-muted)">
                Last updated
                <br />
                <strong className="font-semibold text-(--app-accent-hover)">
                  {formatUpdatedAt(venue.updatedAt)}
                </strong>
              </p>
            }
            className="gap-5"
          />

          <section
            aria-labelledby="ask-venue-title"
            className="flex flex-wrap items-center justify-between gap-4 border-b border-(--app-line) bg-[color-mix(in_oklch,var(--app-field)_70%,var(--app-accent)_4%)] px-8 py-5 max-[680px]:items-start max-[680px]:px-4"
          >
            <div className="max-w-[60ch]">
              <h2
                id="ask-venue-title"
                className="m-0 text-base leading-tight font-semibold tracking-[-0.02em]"
              >
                Still have a question?
              </h2>
              <p className="mt-1.5 mb-0 text-xs leading-5 text-(--app-muted) sm:text-sm">
                Ask the venue only what its published information could not answer, then review the
                note before it is sent.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <VenueFavoriteButton venueId={venue._id} venueName={venue.name} />
              {hasVerifiedContactEmail ? (
                <Link
                  to="/ask-venue"
                  search={{ venueName: venue.name || "the venue", venueUrl: venue.url }}
                  className="group inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 border border-(--app-accent) bg-(--app-accent) px-3 text-xs font-semibold tracking-[0.08em] text-(--app-accent-ink) uppercase transition-[background-color,border-color] duration-200 hover:border-(--app-accent-hover) hover:bg-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) motion-reduce:transition-none"
                >
                  <MessageCircleQuestion aria-hidden="true" className="size-3.5" />
                  Ask the venue
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      tabIndex={0}
                      render={
                        <span
                          className="inline-flex cursor-help"
                          aria-label="Ask the venue unavailable: no verified public email was found"
                        />
                      }
                    >
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="pointer-events-none inline-flex h-10 shrink-0 cursor-not-allowed items-center gap-2 border border-(--app-line) bg-(--app-field) px-3 text-xs font-semibold tracking-[0.08em] text-(--app-muted) uppercase opacity-70"
                      >
                        <MessageCircleQuestion aria-hidden="true" className="size-3.5" />
                        Ask the venue
                        <ArrowRight aria-hidden="true" className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      No verified public email was found for this venue.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </section>

          <div className="relative z-20 flex flex-col gap-3 border-b border-(--app-line) bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-bg))] px-8 py-3.5 max-[680px]:px-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 text-xs">
              <p className="m-0 text-(--app-muted)">
                Answers include their source page and publication or confirmation status.
              </p>
            </div>
            {venue.answerCount > 0 && (
              <button
                ref={searchTriggerRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isSearchOpen}
                aria-controls={isSearchOpen ? "venue-answer-search-panel" : undefined}
                onClick={openSearch}
                className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 border border-(--app-field-border) bg-(--app-filter) px-4 text-xs font-semibold tracking-[0.08em] text-(--app-ink) uppercase transition-colors duration-200 hover:bg-[color-mix(in_oklch,var(--app-accent)_12%,var(--app-filter))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) motion-reduce:transition-none"
              >
                <Search aria-hidden="true" className="size-4" />
                Search answers
              </button>
            )}

            {isSearchOpen && (
              <AnswerSearchPanel
                venueId={venue._id}
                inputRef={searchInputRef}
                onClose={closeSearch}
                onSelectAnswer={handleSelectAnswer}
              />
            )}
          </div>

          {venue.answers.length > 0 && (
            <ol className="m-0 list-none p-0" aria-label="Venue answers">
              {venue.answers.map((answer) => (
                <QuestionRow
                  key={answer.answerIndex}
                  answer={answer}
                  index={answer.answerIndex}
                  isHighlighted={highlightedAnswerIndex === answer.answerIndex}
                />
              ))}
            </ol>
          )}

          {venue.answerCount === 0 && (
            <Empty className="min-h-48 gap-3 border-0 px-8 py-12 max-[680px]:px-4">
              <EmptyHeader>
                <EmptyTitle role="heading" aria-level={2}>
                  No venue answers yet
                </EmptyTitle>
                <EmptyDescription>
                  We’ll show a question here when the venue provides a sourced answer.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          <aside className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-t border-(--app-line) bg-[color-mix(in_oklch,var(--app-field)_70%,var(--app-accent)_4%)] px-8 py-3.5 max-[680px]:px-4">
            <p className="m-0 text-[0.78rem] leading-[1.45] text-(--app-muted)">
              Only sourced answers are shown. Missing information is not a no.
            </p>
            <p className="m-0 font-mono text-xs leading-[1.4] text-(--app-muted)">
              {venue.answerCount} {venue.answerCount === 1 ? "answer" : "answers"} · from venue
              information
            </p>
          </aside>

          <footer className="flex justify-between gap-4 border-t border-(--app-line) px-8 py-3.5 font-mono text-xs leading-normal text-(--app-muted) max-[680px]:flex-col max-[680px]:px-4">
            <span>BeforeDoors · Know before you go</span>
            <span>Answers carry their source</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export function VenueSelectionPage({
  reportId,
  seedUrl,
  candidates,
}: {
  reportId: Id<"reports">;
  seedUrl: string;
  candidates: Array<{ name: string; url: string }>;
}) {
  const selectReportVenue = useMutation(api.reports.selectReportVenue);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const handleSelect = async (url: string) => {
    if (selectedUrl !== null) return;
    setSelectedUrl(url);
    try {
      await selectReportVenue({ reportId, venueUrl: url });
    } catch {
      setSelectedUrl(null);
      toast.error("We couldn’t start research for that venue. Please try again.");
    }
  };

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header linkToVenues />
      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-0 pb-12 sm:px-5">
        <TrailheadSurface />
        <section className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))]">
          <PageHero
            title="Which venue should we research?"
            titleClassName="max-w-[18ch] leading-[0.94] tracking-[-0.045em]"
            description="This link includes more than one venue. Choose the specific venue you want to use so the research stays focused."
            descriptionClassName="mt-4 max-w-[58ch]"
            className="py-10 max-[680px]:py-8"
          />

          <div className="border-b border-(--app-line) bg-[color-mix(in_oklch,var(--app-field)_70%,var(--app-accent)_4%)] px-8 py-4 max-[680px]:px-4">
            <p className="m-0 font-mono text-[0.68rem] leading-5 text-(--app-muted)">
              Submitted URL
            </p>
            <p className="mt-1 mb-0 font-mono text-xs leading-5 break-all text-(--app-ink)">
              {seedUrl}
            </p>
          </div>

          <ol className="m-0 list-none p-0" aria-label="Venues found on the submitted page">
            {candidates.map((candidate) => {
              const isSelected = selectedUrl === candidate.url;
              return (
                <li
                  key={candidate.url}
                  className="flex items-center justify-between gap-6 border-b border-(--app-line) px-8 py-5 last:border-b-0 max-[680px]:items-start max-[680px]:gap-4 max-[680px]:px-4 max-[680px]:py-4"
                >
                  <div className="min-w-0">
                    <h2 className="m-0 text-base leading-tight font-semibold tracking-[-0.02em]">
                      {candidate.name}
                    </h2>
                    <p className="mt-2 mb-0 max-w-full min-w-0 overflow-hidden">
                      <SourceUrl url={candidate.url} label="Open venue page" />
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={selectedUrl !== null}
                    onClick={() => void handleSelect(candidate.url)}
                    className="inline-flex h-10 shrink-0 cursor-pointer items-center border border-(--app-accent) bg-(--app-accent) px-4 text-xs font-semibold tracking-[0.08em] text-(--app-accent-ink) uppercase transition-colors hover:border-(--app-accent-hover) hover:bg-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none max-[680px]:px-3"
                  >
                    {isSelected ? "Starting…" : "Research this venue"}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </div>
  );
}

export function VenueInfoMessage({
  title,
  message,
  isLoading = false,
}: {
  title: string;
  message: string;
  isLoading?: boolean;
}) {
  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header linkToVenues />
      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-0 pb-12 sm:px-5">
        <TrailheadSurface />
        <PageHero
          element="section"
          role={isLoading ? "status" : undefined}
          ariaLive={isLoading ? "polite" : undefined}
          title={title}
          titleClassName="leading-[0.95] tracking-[-0.045em]"
          description={message}
          descriptionClassName="mt-5 max-w-[55ch] text-base leading-7"
          actionsClassName="mt-7 max-[760px]:mt-0"
          actions={
            !isLoading ? (
              <Link
                to="/venues"
                className="inline-flex h-10 items-center border border-(--app-accent) px-3 text-xs font-semibold tracking-[0.08em] text-(--app-accent-hover) uppercase underline-offset-4 hover:bg-(--app-accent) hover:text-(--app-accent-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
              >
                View all venues
              </Link>
            ) : undefined
          }
          className="relative z-1 mx-auto w-full max-w-352 py-16 max-[680px]:py-12"
        />
      </main>
    </div>
  );
}
