import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

interface HeaderProps {
  alignment?: "landing" | "report" | "status";
  linkToStatus?: boolean;
  linkToReports?: boolean;
  wide?: boolean;
  variant?: "default" | "report" | "reports";
  onShare?: () => void;
}

export default function Header({
  alignment = "landing",
  linkToStatus = false,
  linkToReports = false,
  wide = false,
  variant = "default",
  onShare,
}: HeaderProps) {
  const maxWidthClass =
    alignment === "report"
      ? "max-w-[88rem]"
      : alignment === "status"
        ? "max-w-[44rem]"
        : wide
          ? "max-w-5xl"
          : "max-w-[44rem]";
  const gutterClass =
    alignment === "report"
      ? "w-[calc(100%-2.5rem)] sm:w-[calc(100%-2.5rem)]"
      : "w-[calc(100%-2.5rem)] sm:w-[calc(100%-4rem)]";

  return (
    <header className="border-b border-b-[color-mix(in_oklch,var(--app-line)_70%,transparent)] bg-[var(--app-bg)] text-[var(--app-ink)]">
      <div
        className={`mx-auto flex h-14 ${gutterClass} items-center border-x border-[color-mix(in_oklch,var(--app-line)_70%,transparent)] px-5 sm:px-8 ${maxWidthClass} ${alignment === "report" ? "max-[680px]:w-full max-[680px]:px-4" : ""}`}
      >
        <Link
          to="/"
          className="text-sm font-semibold tracking-[-0.015em] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--app-focus)]"
        >
          BeforeDoors
        </Link>
        <span className="ml-3 hidden border-l border-[color-mix(in_oklch,var(--app-line)_70%,transparent)] pl-3 text-xs text-[var(--app-muted)] sm:inline">
          Know before you go
        </span>
        {variant === "report" ? (
          <nav
            className="ml-auto flex items-center gap-6 max-[680px]:gap-3"
            aria-label="Report actions"
          >
            <Link
              to="/reports"
              className="text-xs font-medium text-[var(--app-muted)] underline-offset-4 hover:text-[var(--app-ink)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4"
            >
              All reports
            </Link>
            <button
              type="button"
              className="border border-[var(--app-accent)] bg-[var(--app-accent)] px-2.5 py-1.5 text-xs font-semibold tracking-[0.08em] text-[var(--app-accent-ink)] uppercase transition-[background-color,border-color] duration-200 hover:border-[var(--app-accent-hover)] hover:bg-[var(--app-accent-hover)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4 max-[680px]:px-2 max-[680px]:py-1 max-[680px]:text-[0.65rem] motion-reduce:transition-none"
              onClick={onShare}
            >
              Share this brief
            </button>
          </nav>
        ) : variant === "reports" ? (
          <nav className="ml-auto flex items-center gap-4" aria-label="Reports navigation">
            <span className="font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--app-accent-hover)] uppercase">
              Reports
            </span>
            <ModeToggle />
          </nav>
        ) : (
          <>
            {linkToReports ? (
              <Link
                to="/reports"
                className="ml-auto mr-3 text-xs font-medium text-[var(--app-muted)] underline-offset-4 hover:text-[var(--app-ink)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4"
              >
                Reports
              </Link>
            ) : null}
            {linkToStatus ? (
              <Link
                to="/status"
                className={`${linkToReports ? "" : "ml-auto "}mr-3 text-xs font-medium text-[var(--app-muted)] underline-offset-4 hover:text-[var(--app-ink)] focus-visible:outline-2 focus-visible:outline-[var(--app-focus)] focus-visible:outline-offset-4`}
              >
                System status
              </Link>
            ) : (
              <span
                className={`${linkToReports ? "" : "ml-auto "}mr-3 text-xs font-medium text-[var(--app-muted)]`}
              >
                System status
              </span>
            )}
            <ModeToggle />
          </>
        )}
      </div>
    </header>
  );
}
