import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon } from "lucide-react";

import { AuthControls } from "./auth-controls";
import { ModeToggle } from "./mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type CompactNavLink = {
  label: string;
  to: "/" | "/venues" | "/status";
};

interface HeaderProps {
  alignment?: "landing" | "report" | "status" | "account";
  linkToStatus?: boolean;
  linkToVenues?: boolean;
  wide?: boolean;
  variant?: "default" | "report" | "venues";
  onShare?: () => void;
}

export default function Header({
  alignment = "landing",
  linkToStatus = false,
  linkToVenues = false,
  wide = false,
  variant = "default",
  onShare,
}: HeaderProps) {
  const isReportAligned = alignment === "report";
  const maxWidthClass =
    alignment === "landing" && wide
      ? "max-w-5xl"
      : {
          landing: "max-w-176",
          report: "max-w-352",
          status: "max-w-176",
          account: "max-w-224",
        }[alignment];
  const gutterClass = isReportAligned
    ? "w-[calc(100%-2.5rem)] sm:w-[calc(100%-2.5rem)]"
    : "w-[calc(100%-2.5rem)] sm:w-[calc(100%-4rem)]";
  const reportAlignmentClass = isReportAligned ? "max-[680px]:w-full max-[680px]:px-4" : "";

  return (
    <header className="border-b border-b-[color-mix(in_oklch,var(--app-line)_70%,transparent)] bg-(--app-bg) text-(--app-ink)">
      <div
        className={`mx-auto flex h-14 ${gutterClass} items-center border-x border-[color-mix(in_oklch,var(--app-line)_70%,transparent)] px-5 sm:px-8 ${maxWidthClass} ${reportAlignmentClass}`}
      >
        <Link
          to="/"
          className="text-sm font-semibold tracking-[-0.015em] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus)"
        >
          BeforeDoors
        </Link>
        <span className="ml-3 hidden border-l border-[color-mix(in_oklch,var(--app-line)_70%,transparent)] pl-3 text-xs text-(--app-muted) sm:inline">
          Know before you go
        </span>
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <HeaderActions
            variant={variant}
            linkToStatus={linkToStatus}
            linkToVenues={linkToVenues}
            onShare={onShare}
          />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}

function HeaderActions({
  variant,
  linkToStatus,
  linkToVenues,
  onShare,
}: Pick<HeaderProps, "variant" | "linkToStatus" | "linkToVenues" | "onShare">) {
  if (variant === "report") return <ReportHeaderActions onShare={onShare} />;
  if (variant === "venues") return <VenuesHeaderActions />;
  return <DefaultHeaderActions linkToStatus={linkToStatus} linkToVenues={linkToVenues} />;
}

function ReportHeaderActions({ onShare }: { onShare?: () => void }) {
  return (
    <>
      <nav className="flex items-center gap-3 max-[680px]:gap-1.5" aria-label="Report actions">
        <Link
          to="/venues"
          className="text-xs font-medium text-(--app-muted) underline-offset-4 hover:text-(--app-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus) max-[680px]:hidden"
        >
          All venues
        </Link>
        <button
          type="button"
          className="border border-(--app-accent) bg-(--app-accent) px-2.5 py-1.5 text-xs font-semibold tracking-[0.08em] text-(--app-accent-ink) uppercase transition-[background-color,border-color] duration-200 hover:border-(--app-accent-hover) hover:bg-(--app-accent-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus) motion-reduce:transition-none max-[680px]:px-2 max-[680px]:py-1"
          onClick={onShare}
        >
          Share this brief
        </button>
      </nav>
      <CompactNavigationMenu
        links={[
          { to: "/venues", label: "All venues" },
          { to: "/", label: "Home" },
          { to: "/status", label: "System status" },
        ]}
      />
    </>
  );
}

function VenuesHeaderActions() {
  return (
    <>
      <nav className="flex items-center gap-3" aria-label="Venues navigation">
        <span className="font-mono text-xs font-semibold tracking-[0.12em] text-(--app-accent-hover) uppercase max-[680px]:hidden">
          Venues
        </span>
        <ModeToggle />
      </nav>
      <CompactNavigationMenu
        links={[
          { to: "/", label: "Home" },
          { to: "/status", label: "System status" },
        ]}
      />
    </>
  );
}

function DefaultHeaderActions({
  linkToStatus,
  linkToVenues,
}: Pick<HeaderProps, "linkToStatus" | "linkToVenues">) {
  return (
    <>
      <nav className="flex items-center gap-3 max-[680px]:gap-1.5" aria-label="Main navigation">
        {linkToVenues && (
          <Link
            to="/venues"
            className="text-xs font-medium text-(--app-muted) underline-offset-4 hover:text-(--app-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus) max-[680px]:hidden"
          >
            Venues
          </Link>
        )}
        {linkToStatus ? (
          <Link
            to="/status"
            className="text-xs font-medium text-(--app-muted) underline-offset-4 hover:text-(--app-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--app-focus) max-[680px]:hidden"
          >
            System status
          </Link>
        ) : (
          <span className="text-xs font-medium text-(--app-muted) max-[680px]:hidden">
            System status
          </span>
        )}
        <ModeToggle />
      </nav>
      <CompactNavigationMenu
        links={[
          { to: "/", label: "Home" },
          { to: "/venues", label: "Venues" },
          { to: "/status", label: "System status" },
        ]}
      />
    </>
  );
}

function CompactNavigationMenu({ links }: { links: CompactNavLink[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="More navigation"
        className="inline-flex size-8 items-center justify-center border border-transparent text-(--app-ink) hover:border-(--app-line) hover:bg-(--app-field) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) min-[681px]:hidden"
      >
        <MenuIcon aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {links.map(({ label, to }) => (
          <DropdownMenuItem key={to} render={<Link to={to} />}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
