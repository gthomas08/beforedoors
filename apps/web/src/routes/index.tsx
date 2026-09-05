import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  head: () => ({
    meta: [
      {
        title: "BeforeDoors",
      },
      {
        name: "description",
        content: "Turn a venue or event link into a clear, evidence-based accessibility brief.",
      },
    ],
  }),
});

function validateVenueUrl(value: string) {
  const candidate = value.trim();

  if (!candidate) {
    return "Paste the venue or event page you want to check.";
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Use a web address that starts with http:// or https://.";
    }
  } catch {
    return "Enter a complete web address, such as https://venue.com.";
  }

  return undefined;
}

function TrailheadMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      fill="none"
      viewBox="0 0 96 88"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25 74V14h46v60"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="m25 14 16 10v50"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path d="M41 24h30" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <circle cx="57" cy="51" r="4.5" stroke="currentColor" strokeWidth="3.5" />
      <path
        d="M57 57v9m0-5 8 3m-8 2-6 8m6-8 8 8m-13-8h-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <path d="M20 74h56" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

function HomeComponent() {
  const form = useForm({
    defaultValues: {
      venueUrl: "",
    },
    onSubmit: ({ value }) => {
      window.alert(`Thanks — we'll check ${value.venueUrl.trim()}.`);
    },
  });

  return (
    <div className="landing-shell grid h-svh grid-rows-[auto_1fr] overflow-hidden">
      <Header landing linkToStatus wide />

      <main className="landing-stage trailhead-surface relative min-h-0 overflow-hidden px-5 sm:px-8">
        <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl items-center justify-center border-x border-[var(--landing-line)] px-5 sm:px-10 lg:px-16">
          <section
            aria-labelledby="landing-title"
            className="landing-hero flex w-full max-w-3xl flex-col items-center py-8 text-center sm:py-10"
          >
            <div className="landing-mark mb-5 flex size-16 items-center justify-center text-[var(--landing-ink)] sm:mb-6 sm:size-[4.5rem]">
              <TrailheadMark />
            </div>

            <h1
              id="landing-title"
              className="max-w-none whitespace-nowrap text-balance text-[clamp(2rem,7vw,5rem)] leading-[0.9] font-semibold tracking-[-0.04em] text-[var(--landing-ink)]"
            >
              Know before you go.
            </h1>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--landing-muted)] sm:text-sm">
              Know access · go with confidence
            </p>

            <p className="mt-5 max-w-[46ch] text-base leading-7 text-[var(--landing-muted)] sm:text-lg sm:leading-8">
              Enter a venue or event link to see what its published access information can tell you
              before you go.
            </p>

            <form
              className="landing-url-form mt-8 w-full max-w-3xl sm:mt-10"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
              noValidate
            >
              <form.Field
                name="venueUrl"
                validators={{
                  onBlur: ({ value }) => validateVenueUrl(value),
                  onSubmit: ({ value }) => validateVenueUrl(value),
                }}
              >
                {(field) => {
                  const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined;

                  return (
                    <div>
                      <label
                        htmlFor={field.name}
                        className="mb-2 block text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--landing-ink)]"
                      >
                        Venue or event URL
                      </label>

                      <div className="grid border border-[var(--landing-field-border)] bg-[var(--landing-field)] transition-[border-color,box-shadow] duration-300 focus-within:border-[var(--landing-focus)] focus-within:ring-2 focus-within:ring-[var(--landing-focus)]/30 sm:grid-cols-[1fr_auto]">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="url"
                          inputMode="url"
                          autoComplete="url"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder="https://venue.com/event"
                          aria-invalid={Boolean(error)}
                          aria-describedby={`${field.name}-${error ? "error" : "hint"}`}
                          className="h-14 border-0 bg-transparent px-4 text-lg text-[var(--landing-field-ink)] shadow-none caret-[var(--landing-accent)] placeholder:text-[var(--landing-field-placeholder)] focus-visible:ring-0 sm:h-16 sm:px-5 sm:text-lg dark:bg-transparent"
                        />

                        <form.Subscribe selector={(state) => state.isSubmitting}>
                          {(isSubmitting) => (
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="group h-14 justify-between border-t border-[var(--landing-field-border)] bg-[var(--landing-accent)] px-4 text-sm text-[var(--landing-accent-ink)] hover:bg-[var(--landing-accent-hover)] sm:h-16 sm:min-w-44 sm:border-t-0 sm:border-l sm:px-5"
                            >
                              {isSubmitting ? "Checking…" : "See what’s ahead"}
                              <ArrowRight
                                aria-hidden="true"
                                className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
                              />
                            </Button>
                          )}
                        </form.Subscribe>
                      </div>

                      <div className="mt-3 min-h-5 text-xs leading-5">
                        {error ? (
                          <p id={`${field.name}-error`} className="text-destructive" role="alert">
                            {String(error)}
                          </p>
                        ) : (
                          <p id={`${field.name}-hint`} className="text-[var(--landing-muted)]">
                            We’ll begin with the venue’s own published information.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }}
              </form.Field>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
