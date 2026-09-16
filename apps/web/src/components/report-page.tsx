import { Link } from "@tanstack/react-router";
import { Result } from "better-result";
import { Dialog } from "@base-ui/react/dialog";
import { useQuery } from "convex/react";
import { ArrowRight, ArrowUpRight, MessageCircleQuestion, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Doc } from "@my-better-t-app/backend/convex/_generated/dataModel";
import Header from "@/components/header";
import { ReportContourLines } from "@/components/report-contour-lines";
import { TrailheadSurface } from "@/components/trailhead-surface";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { formatUpdatedAt } from "@/lib/format-date";

type VenueAnswer = Pick<
  Doc<"venueAnswers">,
  "answerIndex" | "question" | "answer" | "url" | "status"
>;
type Venue = Pick<Doc<"venues">, "_id" | "name" | "url" | "updatedAt"> & {
  answerCount: number;
  answers: VenueAnswer[];
};

function StatusLabel({ status }: { status: VenueAnswer["status"] }) {
  const label = status === "published" ? "Published by venue" : "Confirmed by venue";

  return (
    <span className="text-[0.72rem] leading-[1.35] font-semibold text-(--app-ink)">{label}</span>
  );
}

function StatusIndicator({ status }: { status: VenueAnswer["status"] }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-(--app-accent)" />
      <StatusLabel status={status} />
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
      className="inline-flex max-w-full min-w-0 items-center gap-1.5 text-(--app-ink) underline decoration-(--app-accent) decoration-1 underline-offset-4 hover:text-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
    >
      <span className="wrap-break-word">{url}</span>
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
            className="m-0 max-w-none text-[clamp(0.95rem,1.8vw,1.25rem)] leading-[1.15] font-semibold tracking-[-0.03em] focus:outline-none focus-visible:underline focus-visible:decoration-(--app-accent) focus-visible:underline-offset-4 max-[900px]:text-[0.95rem]"
          >
            {answer.question}
          </h2>
        </div>

        <div className="min-w-0">
          <p className="m-0 max-w-[64ch] text-[0.92rem] leading-normal">{answer.answer}</p>
        </div>

        <div className="flex min-w-0 flex-col items-end gap-2 max-[900px]:mt-0.5 max-[900px]:items-start">
          <StatusIndicator status={answer.status} />
          <SourceUrl url={answer.url} label="Open answer source" />
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
        <Dialog.Viewport className="fixed inset-0 z-60 grid place-items-center overflow-y-auto px-4 py-6">
          <Dialog.Popup
            id="venue-answer-search-panel"
            initialFocus={inputRef}
            className="max-h-[calc(100svh-3rem)] w-full max-w-2xl overflow-y-auto border border-(--app-field-border) bg-(--app-bg) text-(--app-ink) shadow-overlay-large outline-none"
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
                className="h-14 border-0 bg-transparent px-0 text-base text-(--app-field-ink) caret-(--app-accent) shadow-none placeholder:text-(--app-field-placeholder) focus-visible:ring-0 dark:bg-transparent"
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
                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-(--app-line) px-5 py-2.5 font-mono text-[0.65rem] text-(--app-muted)">
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

export function VenueInfoPage({ venue }: { venue: Venue }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedAnswerIndex, setHighlightedAnswerIndex] = useState<number | null>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

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

  const handleShare = async () => {
    const shareData = {
      title: `${venue.name} · BeforeDoors`,
      text: "Accessibility answers from BeforeDoors",
      url: window.location.href,
    };

    if (navigator.share) {
      const shareResult = await Result.tryPromise({
        try: () => navigator.share!(shareData),
        catch: (error: unknown) => error,
      });

      if (shareResult.isOk()) {
        return;
      }

      if (shareResult.error instanceof DOMException && shareResult.error.name === "AbortError") {
        return;
      }
    }

    const copyResult = await Result.tryPromise({
      try: () => navigator.clipboard.writeText(window.location.href),
      catch: () => "clipboard-write-failed" as const,
    });

    if (copyResult.isOk()) {
      toast.success("Brief link copied");
    } else {
      toast.error("Copy this page’s URL to share the brief");
    }
  };

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header alignment="report" variant="report" onShare={() => void handleShare()} />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-5 pb-12 max-[680px]:px-0">
        <TrailheadSurface />
        <div className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))] max-[680px]:border-x-0">
          <header className="relative isolate flex min-h-44 items-end justify-between gap-5 border-b border-(--app-line) px-8 pt-10 pb-8 max-[760px]:flex-col max-[760px]:items-start max-[680px]:min-h-52 max-[680px]:px-4 max-[680px]:py-8">
            <div className="relative z-10 min-w-0">
              <h1 className="m-0 max-w-none text-[clamp(2.75rem,6vw,5rem)] leading-[0.92] font-semibold tracking-tighter max-[680px]:text-[clamp(2.4rem,13vw,4rem)] min-[1280px]:whitespace-nowrap">
                {venue.name || "Venue name not recorded"}
              </h1>
              <p className="mt-4 mb-0 font-mono text-[clamp(0.8rem,1.3vw,1rem)] leading-6">
                <SourceUrl url={venue.url} label="Open venue URL" />
              </p>
            </div>
            <p className="z-10 m-0 max-w-60 shrink-0 font-mono text-[0.72rem] leading-normal text-(--app-muted) max-[760px]:mt-4">
              Last updated
              <br />
              <strong className="font-semibold text-(--app-accent-hover)">
                {formatUpdatedAt(venue.updatedAt)}
              </strong>
            </p>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[-1] w-[48%] max-[680px]:inset-0 max-[680px]:w-full max-[680px]:opacity-60">
              <ReportContourLines />
            </div>
          </header>

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
                className="inline-flex h-10 shrink-0 items-center gap-2 border border-(--app-field-border) bg-(--app-field) px-4 text-xs font-semibold tracking-[0.08em] text-(--app-ink) uppercase transition-colors duration-200 hover:bg-[color-mix(in_oklch,var(--app-accent)_12%,var(--app-field))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) motion-reduce:transition-none"
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
            <p className="m-0 font-mono text-[0.68rem] leading-[1.4] text-(--app-muted)">
              {venue.answerCount} {venue.answerCount === 1 ? "answer" : "answers"} · from venue
              information
            </p>
          </aside>

          <section
            aria-labelledby="ask-venue-title"
            className="flex flex-wrap items-center justify-between gap-5 border-t border-(--app-line) px-8 py-7 max-[680px]:items-start max-[680px]:px-4"
          >
            <div className="max-w-[56ch]">
              <h2
                id="ask-venue-title"
                className="m-0 text-[1.2rem] leading-tight font-semibold tracking-[-0.025em]"
              >
                Still have a question?
              </h2>
              <p className="mt-2 mb-0 text-[0.86rem] leading-6 text-(--app-muted)">
                Ask the venue directly. Add only what the published information could not answer,
                then review the note before it leaves BeforeDoors.
              </p>
            </div>
            <Link
              to="/ask-venue"
              search={{ venueName: venue.name || "the venue", venueUrl: venue.url }}
              className="group inline-flex h-10 shrink-0 items-center gap-2 border border-(--app-accent) bg-(--app-accent) px-4 text-xs font-semibold tracking-[0.08em] text-(--app-accent-ink) uppercase transition-[background-color,border-color] duration-200 hover:border-(--app-accent-hover) hover:bg-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) motion-reduce:transition-none"
            >
              <MessageCircleQuestion aria-hidden="true" className="size-4" />
              Ask the venue
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          </section>

          <footer className="flex justify-between gap-4 border-t border-(--app-line) px-8 py-3.5 font-mono text-[0.68rem] leading-normal text-(--app-muted) max-[680px]:flex-col max-[680px]:px-4">
            <span>BeforeDoors · Know before you go</span>
            <span>Answers carry their source</span>
          </footer>
        </div>
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
      <Header alignment="report" linkToVenues />
      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-5 pb-12 max-[680px]:px-0">
        <TrailheadSurface />
        <section
          className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))] px-8 py-16 max-[680px]:border-x-0 max-[680px]:px-4"
          role={isLoading ? "status" : undefined}
          aria-live={isLoading ? "polite" : undefined}
        >
          <h1 className="m-0 text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
            {title}
          </h1>
          <p className="mt-5 mb-0 max-w-[55ch] text-[0.95rem] leading-7 text-(--app-muted)">
            {message}
          </p>
          {!isLoading && (
            <Link
              to="/venues"
              className="mt-7 inline-flex border border-(--app-accent) px-3 py-2 text-xs font-semibold tracking-[0.08em] text-(--app-accent-hover) uppercase underline-offset-4 hover:bg-(--app-accent) hover:text-(--app-accent-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
            >
              View all venues
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}
