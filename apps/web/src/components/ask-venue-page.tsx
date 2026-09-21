import { api } from "@beforedoors/backend/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Mail, Plus, Send, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";

import Header from "@/components/header";
import { PageHero } from "@/components/page-hero";
import { TrailheadSurface } from "@/components/trailhead-surface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function validateQuestion(value: string) {
  const question = value.trim();

  if (!question) return "Add a question for the venue.";
  if (question.length < 8) return "Give the venue a little more detail.";
  return undefined;
}

function EmailPreview({
  venueName,
  venueEmail,
  questions,
}: {
  venueName: string;
  venueEmail: string | null;
  questions: Array<{ text: string }>;
}) {
  return (
    <article
      aria-labelledby="email-preview-title"
      className="border border-(--app-field-border) bg-(--app-field) text-(--app-field-ink)"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-(--app-line) px-5 py-4 sm:px-6">
        <div>
          <h2 id="email-preview-title" className="m-0 text-lg font-semibold tracking-[-0.025em]">
            Email preview
          </h2>
          <p className="mt-1 mb-0 text-xs leading-5 text-(--app-field-placeholder)">
            Read-only · sent from BeforeDoors
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-(--app-line) px-2 py-1 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-(--app-muted) uppercase">
          <Mail aria-hidden="true" className="size-3" />
          Draft
        </span>
      </header>

      <dl className="m-0 grid gap-3 border-b border-(--app-line) px-5 py-4 text-xs leading-5 sm:px-6">
        <div className="grid gap-1 sm:grid-cols-[4.5rem_1fr] sm:gap-3">
          <dt className="font-mono font-semibold tracking-[0.12em] text-(--app-field-placeholder) uppercase">
            To
          </dt>
          <dd className="m-0 font-medium break-all">
            {venueEmail || "No verified public email found"}
          </dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[4.5rem_1fr] sm:gap-3">
          <dt className="font-mono font-semibold tracking-[0.12em] text-(--app-field-placeholder) uppercase">
            Subject
          </dt>
          <dd className="m-0 font-medium">A question from BeforeDoors · {venueName}</dd>
        </div>
      </dl>

      <div className="px-5 py-5 text-[0.88rem] leading-7 sm:px-6 sm:py-6">
        <p className="m-0">Hello {venueName},</p>
        <p className="mt-4 mb-0">
          I’m checking access information for an upcoming visit and found a few details I could not
          confirm on your website. Could you help me with the questions below?
        </p>
        <ol className="my-4 grid gap-2 border-y border-(--app-line) py-4">
          {questions.map((question, index) => (
            <li key={`${index}-${question.text}`} className="flex gap-3">
              <span className="shrink-0 font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-(--app-accent-hover)">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={question.text.trim() ? "" : "text-(--app-field-placeholder) italic"}>
                {question.text.trim() || "Your question will appear here."}
              </span>
            </li>
          ))}
        </ol>
        <p className="m-0">Thank you for helping people know what to expect before they go.</p>
        <p className="mt-4 mb-0">
          Best,
          <br />
          A BeforeDoors visitor
        </p>
      </div>

      <footer className="border-t border-(--app-line) px-5 py-3.5 font-mono text-[0.65rem] leading-5 text-(--app-field-placeholder) sm:px-6">
        Sent from BeforeDoors · Know before you go
      </footer>
    </article>
  );
}

export function AskVenuePage({
  venueName,
  venueUrl,
  venueEmail,
  isVenueLoading = false,
}: {
  venueName: string;
  venueUrl: string;
  venueEmail: string | null;
  isVenueLoading?: boolean;
}) {
  const hasVerifiedVenueEmail = Boolean(
    venueEmail && !venueEmail.toLowerCase().endsWith(".invalid"),
  );
  const destinationEmail = isVenueLoading
    ? "Looking up the venue email…"
    : hasVerifiedVenueEmail
      ? venueEmail
      : null;
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const sendVenueQuestions = useMutation(api.venueQuestions.sendVenueQuestions);
  const latestVenueQuestion = useQuery(
    api.venueQuestions.getLatestVenueQuestion,
    isAuthenticated ? { venueUrl } : "skip",
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());

  const form = useForm({
    defaultValues: {
      questions: [{ text: "" }],
    },
    onSubmit: async ({ value }) => {
      setSubmitError(undefined);

      if (!isAuthenticated) {
        setSubmitError("Sign in above before sending a question to the venue.");
        return;
      }

      if (!hasVerifiedVenueEmail) {
        setSubmitError("This venue does not have a verified public contact email yet.");
        return;
      }

      try {
        await sendVenueQuestions({
          requestKey,
          venueName,
          venueUrl,
          questions: value.questions.map(({ text }) => text),
        });
        setIsSubmitted(true);
        setRequestKey(crypto.randomUUID());
      } catch {
        setSubmitError("We couldn’t send your questions. Please try again.");
      }
    },
  });

  const latestRequest = latestVenueQuestion?.request;
  const deliveryStatus = latestRequest?.delivery?.status;

  return (
    <div className="min-h-svh bg-(--app-bg) text-(--app-ink)">
      <Header linkToVenues />

      <main className="relative min-h-[calc(100svh-3.5rem)] overflow-x-hidden bg-(--app-bg) px-0 pb-12 sm:px-5">
        <TrailheadSurface />
        <div className="relative z-1 mx-auto w-full max-w-352 border-x border-(--app-line) bg-[color-mix(in_oklch,var(--app-bg)_96%,var(--app-field))]">
          <PageHero
            title={`Ask ${venueName}`}
            description="Couldn’t find what you need in the brief? Write the venue a short, specific note. You’ll see exactly what is prepared before it is sent."
            descriptionClassName="max-w-[55ch]"
          />

          <nav
            aria-label="Venue navigation"
            className="border-b border-(--app-line) px-8 py-3.5 max-[680px]:px-4"
          >
            <Link
              to="/report"
              search={{ url: venueUrl }}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-(--app-muted) uppercase underline-offset-4 hover:text-(--app-ink) hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Back to venue page
            </Link>
          </nav>

          <div className="border-b border-(--app-line) bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-bg))] px-8 py-3.5 text-xs max-[680px]:px-4">
            <p className="m-0 leading-5 text-(--app-muted)">
              BeforeDoors helps you ask only what the available evidence could not answer. Keep
              questions focused on access details for this visit.
            </p>
          </div>

          <form
            className="px-8 py-8 max-[680px]:px-4 max-[680px]:py-7"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsSubmitted(false);
              form.handleSubmit();
            }}
            noValidate
          >
            <section aria-labelledby="questions-title">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--app-line) pb-4">
                <div>
                  <h2 id="questions-title" className="m-0 text-xl font-semibold tracking-[-0.03em]">
                    Your questions
                  </h2>
                  <p className="mt-1.5 mb-0 text-sm leading-6 text-(--app-muted)">
                    Add one question per line so the venue can reply clearly.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-(--app-muted) uppercase">
                  <span className="text-(--app-accent-hover)">To</span>
                  {destinationEmail || "No verified public email found"}
                </span>
              </div>

              <form.Field name="questions" mode="array">
                {(field) => (
                  <div className="mt-5 grid gap-3">
                    {field.state.value.map((_, index) => (
                      <form.Field
                        key={index}
                        name={`questions[${index}].text`}
                        validators={{
                          onBlur: ({ value }) => validateQuestion(value),
                          onSubmit: ({ value }) => validateQuestion(value),
                        }}
                      >
                        {(questionField) => {
                          const error = questionField.state.meta.isTouched
                            ? questionField.state.meta.errors[0]
                            : undefined;

                          return (
                            <div className="border border-(--app-field-border) bg-(--app-field)">
                              <div className="flex items-center justify-between gap-4 border-b border-(--app-line) px-4 py-2.5">
                                <label
                                  htmlFor={questionField.name}
                                  className="font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-(--app-field-placeholder) uppercase"
                                >
                                  Question {String(index + 1).padStart(2, "0")}
                                </label>
                                {field.state.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Remove question ${index + 1}`}
                                    onClick={() => field.removeValue(index)}
                                    className="text-(--app-field-placeholder) hover:text-(--app-field-ink)"
                                  >
                                    <X aria-hidden="true" />
                                  </Button>
                                )}
                              </div>
                              <Textarea
                                id={questionField.name}
                                name={questionField.name}
                                value={questionField.state.value}
                                onBlur={questionField.handleBlur}
                                onChange={(event) => {
                                  questionField.handleChange(event.target.value);
                                  setIsSubmitted(false);
                                }}
                                placeholder="e.g. Is there a step-free entrance from street level?"
                                maxLength={300}
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? `${questionField.name}-error` : undefined}
                                className="min-h-28 border-0 bg-transparent px-4 py-3 text-[0.95rem] leading-6 text-(--app-field-ink) caret-(--app-accent) shadow-none placeholder:text-(--app-field-placeholder) focus-visible:ring-0"
                              />
                              <div className="flex min-h-8 items-center justify-between gap-4 border-t border-(--app-line) px-4 py-2 text-[0.68rem] text-(--app-field-placeholder)">
                                {error ? (
                                  <p
                                    id={`${questionField.name}-error`}
                                    className="m-0 text-destructive"
                                    role="alert"
                                  >
                                    {String(error)}
                                  </p>
                                ) : (
                                  <span>Specific questions are easier for venues to answer.</span>
                                )}
                                <span className="shrink-0 font-mono">
                                  {questionField.state.value.length}/300
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      </form.Field>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        field.pushValue({ text: "" });
                        setIsSubmitted(false);
                      }}
                      className="mt-1 h-10 w-fit border-(--app-line) px-3 text-xs font-semibold tracking-[0.08em] text-(--app-ink) uppercase hover:border-(--app-accent) hover:bg-[color-mix(in_oklch,var(--app-accent)_8%,var(--app-field))]"
                    >
                      <Plus aria-hidden="true" />
                      Add another question
                    </Button>
                  </div>
                )}
              </form.Field>
            </section>

            <section
              aria-labelledby="preview-section-title"
              className="mt-10 border-t border-(--app-line) pt-8"
            >
              <div className="mb-4">
                <h2
                  id="preview-section-title"
                  className="m-0 text-xl font-semibold tracking-[-0.03em]"
                >
                  Before it leaves
                </h2>
                <p className="mt-1.5 mb-0 text-sm leading-6 text-(--app-muted)">
                  This is the note the venue will receive. It cannot be edited here; change the
                  questions above instead.
                </p>
              </div>

              <form.Subscribe selector={(state) => state.values.questions}>
                {(questions) => (
                  <EmailPreview
                    venueName={venueName}
                    venueEmail={destinationEmail}
                    questions={questions}
                  />
                )}
              </form.Subscribe>
            </section>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-(--app-line) pt-6">
              <div className="min-h-10 max-w-[52ch] text-sm leading-5" aria-live="polite">
                {submitError && (
                  <p className="m-0 text-destructive" role="alert">
                    {submitError}
                  </p>
                )}
                {!isAuthLoading && !isAuthenticated && (
                  <p className="m-0 text-(--app-muted)" role="status">
                    Sign in above to send questions to the venue.
                  </p>
                )}
                {isSubmitted && isAuthenticated && (
                  <p
                    className="m-0 inline-flex items-center gap-2 text-(--app-muted)"
                    role="status"
                  >
                    <Check aria-hidden="true" className="size-4 text-(--app-accent-hover)" />
                    Your questions are queued through BeforeDoors. We’ll show the venue’s reply
                    here.
                  </p>
                )}
                {!submitError &&
                  !isSubmitted &&
                  isAuthenticated &&
                  !isVenueLoading &&
                  !hasVerifiedVenueEmail && (
                    <p className="m-0 text-(--app-muted)">
                      We couldn’t find a verified public email for this venue yet.
                    </p>
                  )}
                {!submitError &&
                  !isSubmitted &&
                  isAuthenticated &&
                  (isVenueLoading || hasVerifiedVenueEmail) && (
                    <p className="m-0 text-(--app-muted)">
                      You stay in control: review the note, then choose to send it.
                    </p>
                  )}
              </div>

              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isAuthLoading ||
                      !isAuthenticated ||
                      !hasVerifiedVenueEmail ||
                      isVenueLoading
                    }
                    className="h-11 gap-2 border border-(--app-accent) bg-(--app-accent) px-4 text-xs font-semibold tracking-[0.08em] text-(--app-accent-ink) uppercase hover:bg-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
                  >
                    <Send aria-hidden="true" className="size-4" />
                    {isAuthLoading
                      ? "Checking access…"
                      : isVenueLoading
                        ? "Looking up email…"
                        : isSubmitting
                          ? "Sending…"
                          : !isAuthenticated
                            ? "Sign in to send"
                            : !hasVerifiedVenueEmail
                              ? "Email unavailable"
                              : isSubmitted
                                ? "Send another"
                                : "Send to venue"}
                  </Button>
                )}
              </form.Subscribe>
            </div>

            {latestRequest && (
              <section
                aria-labelledby="venue-reply-title"
                className="mt-8 border-t border-(--app-line) pt-8"
              >
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--app-line) pb-4">
                  <div>
                    <h2
                      id="venue-reply-title"
                      className="m-0 text-xl font-semibold tracking-[-0.03em]"
                    >
                      Venue response
                    </h2>
                    <p className="mt-1.5 mb-0 text-sm leading-6 text-(--app-muted)">
                      Replies to your latest question request will appear here.
                    </p>
                  </div>
                  <span className="font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-(--app-muted) uppercase">
                    {deliveryStatus === "failed" || deliveryStatus === "bounced"
                      ? "Delivery needs attention"
                      : deliveryStatus === "delivered"
                        ? "Delivered"
                        : latestRequest.replies.length > 0
                          ? "Reply received"
                          : "Waiting for venue"}
                  </span>
                </div>

                {latestRequest.delivery?.errorMessage && (
                  <p className="mt-4 mb-0 text-sm leading-6 text-destructive" role="alert">
                    {latestRequest.delivery.errorMessage}
                  </p>
                )}

                {latestRequest.replies.length === 0 && !latestRequest.delivery?.errorMessage && (
                  <p className="mt-5 mb-0 border border-(--app-line) bg-(--app-field) px-4 py-4 text-sm leading-6 text-(--app-muted)">
                    The venue hasn’t replied yet. Keep this page open or return later to check the
                    thread.
                  </p>
                )}

                {latestRequest.replies.length > 0 && (
                  <div className="mt-5 grid gap-3">
                    {latestRequest.replies.map((reply) => (
                      <article
                        key={reply.messageId}
                        className="border border-(--app-field-border) bg-(--app-field) px-4 py-4"
                      >
                        <div className="flex flex-wrap justify-between gap-2 border-b border-(--app-line) pb-3 text-xs">
                          <span className="font-semibold text-(--app-field-ink)">{reply.from}</span>
                          <time
                            dateTime={new Date(reply.timestamp).toISOString()}
                            className="text-(--app-field-placeholder)"
                          >
                            {new Date(reply.timestamp).toLocaleString()}
                          </time>
                        </div>
                        <p className="mt-3 mb-0 text-sm leading-7 whitespace-pre-wrap text-(--app-field-ink)">
                          {reply.text || "The venue sent a reply without readable text."}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </form>

          <footer className="flex justify-between gap-4 border-t border-(--app-line) px-8 py-3.5 font-mono text-[0.68rem] leading-normal text-(--app-muted) max-[680px]:flex-col max-[680px]:px-4">
            <span>BeforeDoors · Know before you go</span>
            <span>Venue questions stay specific</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
