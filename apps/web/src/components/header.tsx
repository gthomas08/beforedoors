import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[44rem] items-center border-x px-5 sm:px-8">
        <Link
          to="/"
          className="text-sm font-semibold tracking-[-0.015em] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          BeforeDoors
        </Link>
        <span className="ml-3 hidden border-l pl-3 text-xs text-muted-foreground sm:inline">
          Know before you go
        </span>
        <span className="ml-auto mr-3 text-xs font-medium text-muted-foreground">
          System status
        </span>
        <ModeToggle />
      </div>
    </header>
  );
}
