import { api } from "@beforedoors/backend/convex/_generated/api";
import Header from "@/components/header";
import { DoorApproachMark } from "@/components/door-approach-mark";
import { TrailheadSurface } from "@/components/trailhead-surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSiteMeta } from "@/lib/site-meta";
import { rememberReport } from "@/lib/report-task-store";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Result } from "better-result";
import { useMutation } from "convex/react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  head: () => ({
    meta: createSiteMeta({
      title: "BeforeDoors — Know before you go",
      description: "Turn a venue link into a clear, evidence-based accessibility brief.",
    }),
  }),
});

function validateVenueUrl(value: string) {
  const candidate = value.trim();

  if (!candidate) {
    return "Paste the venue page you want to check.";
  }

  const urlResult = Result.try({
    try: () => new URL(candidate),
    catch: () => "Enter a complete web address, such as https://www.thesphere.com/." as const,
  });

  if (urlResult.isErr()) {
    return urlResult.error;
  }

  if (urlResult.value.protocol !== "http:" && urlResult.value.protocol !== "https:") {
    return "Use a web address that starts with http:// or https://.";
  }

  return undefined;
}

function HomeComponent() {
  const navigate = useNavigate();
  const startReport = useMutation(api.reports.startReport);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const form = useForm({
    defaultValues: {
      venueUrl: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(undefined);

      const result = await Result.tryPromise({
        try: async () => {
          const url = value.venueUrl.trim();
          const { reportId } = await startReport({ url });
          rememberReport({ reportId, url });

          return navigate({
            to: "/report",
            search: { url, reportId },
          });
        },
        catch: () => "We couldn’t start research for that link. Please try again." as const,
      });

      if (result.isErr()) {
        setSubmitError(result.error);
      }
    },
  });

  return (
    <div className="grid h-svh grid-rows-[auto_1fr] overflow-hidden bg-(--app-bg) text-(--app-ink)">
      <Header linkToVenues />

      <main className="relative min-h-0 overflow-hidden bg-(--app-bg) px-0 sm:px-5">
        <TrailheadSurface />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-352 items-center justify-center border-x border-(--app-line) px-5 sm:px-10 lg:px-16">
          <section
            aria-labelledby="landing-title"
            className="flex w-full max-w-3xl -translate-y-[clamp(1.5rem,7vh,3.25rem)] flex-col items-center py-8 text-center sm:py-10"
          >
            <DoorApproachMark />

            <h1
              id="landing-title"
              className="max-w-none text-[clamp(2rem,7vw,5rem)] leading-[0.9] font-semibold tracking-[-0.04em] text-balance whitespace-nowrap text-(--app-ink)"
            >
              Know before you go.
            </h1>

            <p className="mt-4 text-xs font-semibold tracking-[0.22em] text-(--app-muted) uppercase sm:text-sm">
              Know access · go with confidence
            </p>

            <p className="mt-5 max-w-[46ch] text-base leading-7 text-(--app-muted) sm:text-lg sm:leading-8">
              Enter a venue link to see what its published access information can tell you before
              you go.
            </p>

            <form
              className="mt-8 w-full max-w-3xl sm:mt-10"
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
                  const validationError = field.state.meta.isTouched
                    ? field.state.meta.errors[0]
                    : undefined;
                  const error = validationError ?? submitError;

                  return (
                    <div>
                      <label
                        htmlFor={field.name}
                        className="mb-2 block text-left text-xs font-semibold tracking-[0.14em] text-(--app-ink) uppercase"
                      >
                        Venue URL
                      </label>

                      <div className="grid border border-(--app-field-border) bg-(--app-field) transition-[border-color,box-shadow] duration-300 focus-within:border-(--app-focus) focus-within:ring-2 focus-within:ring-(--app-focus)/30 motion-reduce:transition-none sm:grid-cols-[1fr_auto]">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="url"
                          inputMode="url"
                          autoComplete="url"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder="https://www.thesphere.com/"
                          aria-invalid={Boolean(error)}
                          aria-describedby={`${field.name}-${error ? "error" : "hint"}`}
                          className="h-14 border-0 bg-transparent px-4 text-lg text-(--app-field-ink) caret-(--app-accent) shadow-none placeholder:text-(--app-field-placeholder) focus-visible:ring-0 sm:h-16 sm:px-5 sm:text-lg"
                        />

                        <form.Subscribe selector={(state) => state.isSubmitting}>
                          {(isSubmitting) => (
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="group h-14 justify-between border-t border-(--app-field-border) bg-(--app-accent) px-4 text-sm text-(--app-accent-ink) hover:bg-(--app-accent-hover) sm:h-16 sm:min-w-44 sm:border-t-0 sm:border-l sm:px-5"
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
                          <p id={`${field.name}-hint`} className="text-(--app-muted)">
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
