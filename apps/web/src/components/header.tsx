import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

interface HeaderProps {
  landing?: boolean;
  linkToStatus?: boolean;
  wide?: boolean;
}

export default function Header({
  landing = false,
  linkToStatus = false,
  wide = false,
}: HeaderProps) {
  return (
    <header className={landing ? "landing-header border-b" : "border-b bg-background"}>
      <div
        className={`mx-auto flex h-14 w-full items-center border-x px-5 sm:px-8 ${wide ? "max-w-5xl" : "max-w-[44rem]"}`}
      >
        <Link
          to="/"
          className="text-sm font-semibold tracking-[-0.015em] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          BeforeDoors
        </Link>
        <span className="ml-3 hidden border-l pl-3 text-xs text-muted-foreground sm:inline">
          Know before you go
        </span>
        {linkToStatus ? (
          <Link
            to="/status"
            className="ml-auto mr-3 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            System status
          </Link>
        ) : (
          <span className="ml-auto mr-3 text-xs font-medium text-muted-foreground">
            System status
          </span>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}
