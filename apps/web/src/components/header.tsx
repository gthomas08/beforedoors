import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon } from "lucide-react";

import { AuthControls } from "./auth-controls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type CompactNavLink = {
  label: string;
  to: "/" | "/venues";
};

const headerNavLinkClass =
  "inline-flex h-full items-center text-xs leading-4 font-medium text-(--app-muted) transition-colors hover:text-(--app-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)";
const activeHeaderNavLinkClass =
  "inline-flex h-full items-center text-xs leading-4 font-medium text-(--app-ink) underline decoration-(--app-accent) decoration-2 underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)";

interface HeaderProps {
  linkToVenues?: boolean;
  variant?: "default" | "report" | "venues";
}

export default function Header({ linkToVenues = false, variant = "default" }: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-b-[color-mix(in_oklch,var(--app-line)_70%,transparent)] bg-(--app-bg) text-(--app-ink)">
      <div className="mx-auto flex h-14 w-full max-w-352 items-center border-x border-[color-mix(in_oklch,var(--app-line)_70%,transparent)] px-5 sm:w-[calc(100%-2.5rem)] sm:px-8">
        <Link
          to="/"
          className="inline-flex h-full items-center text-sm font-semibold tracking-[-0.015em] transition-colors hover:text-(--app-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
          activeOptions={{ exact: true }}
          activeProps={{
            className:
              "inline-flex h-full items-center text-sm font-semibold tracking-[-0.015em] text-(--app-ink) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)",
            "aria-current": "page",
          }}
        >
          BeforeDoors
        </Link>
        <span className="ml-3 hidden border-l border-[color-mix(in_oklch,var(--app-line)_70%,transparent)] pl-3 text-xs text-(--app-muted) sm:inline">
          Know before you go
        </span>
        <div className="ml-auto flex h-full min-w-0 items-center gap-2 sm:gap-3">
          <HeaderActions variant={variant} linkToVenues={linkToVenues} />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}

function HeaderActions({ variant, linkToVenues }: Pick<HeaderProps, "variant" | "linkToVenues">) {
  if (variant === "report") return <ReportHeaderActions />;
  if (variant === "venues") return <VenuesHeaderActions />;
  return <DefaultHeaderActions linkToVenues={linkToVenues} />;
}

function ReportHeaderActions() {
  return (
    <>
      <nav
        className="flex h-full items-center gap-3 max-[680px]:gap-1.5"
        aria-label="Report actions"
      >
        <Link
          to="/venues"
          className={`${headerNavLinkClass} max-[680px]:hidden`}
          activeProps={{
            className: `${activeHeaderNavLinkClass} max-[680px]:hidden`,
            "aria-current": "page",
          }}
        >
          Venues
        </Link>
      </nav>
      <CompactNavigationMenu
        links={[
          { to: "/venues", label: "Venues" },
          { to: "/", label: "Home" },
        ]}
      />
    </>
  );
}

function VenuesHeaderActions() {
  return (
    <>
      <nav className="flex h-full items-center gap-3" aria-label="Venues navigation">
        <span className={`${activeHeaderNavLinkClass} max-[680px]:hidden`} aria-current="page">
          Venues
        </span>
      </nav>
      <CompactNavigationMenu links={[{ to: "/", label: "Home" }]} />
    </>
  );
}

function DefaultHeaderActions({ linkToVenues }: Pick<HeaderProps, "linkToVenues">) {
  return (
    <>
      <nav
        className="flex h-full items-center gap-3 max-[680px]:gap-1.5"
        aria-label="Main navigation"
      >
        {linkToVenues && (
          <Link
            to="/venues"
            className={`${headerNavLinkClass} max-[680px]:hidden`}
            activeProps={{
              className: `${activeHeaderNavLinkClass} max-[680px]:hidden`,
              "aria-current": "page",
            }}
          >
            Venues
          </Link>
        )}
      </nav>
      <CompactNavigationMenu
        links={[
          { to: "/", label: "Home" },
          { to: "/venues", label: "Venues" },
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
        className="inline-flex size-8 cursor-pointer items-center justify-center border border-transparent text-(--app-ink) hover:border-(--app-line) hover:bg-(--app-field) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) min-[681px]:hidden"
      >
        <MenuIcon aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {links.map(({ label, to }) => (
          <DropdownMenuItem
            key={to}
            render={
              <Link
                to={to}
                activeOptions={{ exact: true }}
                activeProps={{
                  className:
                    "underline decoration-(--app-accent) decoration-2 underline-offset-4 text-(--app-ink)",
                  "aria-current": "page",
                }}
              />
            }
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
