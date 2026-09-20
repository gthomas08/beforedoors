import type { AriaAttributes, AriaRole, ReactNode } from "react";

import { ReportContourLines } from "@/components/report-contour-lines";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  element?: "header" | "section";
  role?: AriaRole;
  ariaLive?: AriaAttributes["aria-live"];
  titleId?: string;
  titleAttribute?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
  className?: string;
};

/** Shared title block for app pages with an optional action or metadata slot. */
export function PageHero({
  title,
  description,
  actions,
  element = "header",
  role,
  ariaLive,
  titleId,
  titleAttribute,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  className,
}: PageHeroProps) {
  const Element = element;

  return (
    <Element
      role={role}
      aria-live={ariaLive}
      className={cn(
        "relative isolate flex h-48 items-end justify-between gap-6 overflow-hidden border-b border-(--app-line) px-8 py-8 max-[760px]:h-auto max-[760px]:flex-col max-[760px]:items-start max-[680px]:px-4 max-[680px]:py-7",
        className,
      )}
    >
      <div className="relative z-10 min-w-0">
        <h1
          id={titleId}
          title={titleAttribute}
          className={cn(
            "m-0 max-w-none pb-[0.04em] text-[clamp(2.5rem,6vw,4rem)] leading-[1.08] font-semibold tracking-[-0.04em]",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-3 mb-0 max-w-[58ch] text-sm leading-6 text-(--app-muted) sm:text-base",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className={cn("relative z-10 shrink-0", actionsClassName)}>{actions}</div>
      ) : null}

      <div className="pointer-events-none absolute inset-y-0 right-0 z-[-1] w-[52%] max-[680px]:inset-0 max-[680px]:w-full max-[680px]:opacity-55">
        <ReportContourLines />
      </div>
    </Element>
  );
}
