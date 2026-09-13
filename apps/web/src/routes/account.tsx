import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import Header from "@/components/header";
import { TrailheadSurface } from "@/components/trailhead-surface";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "BeforeDoors · Account" },
      {
        name: "description",
        content: "View your BeforeDoors account details.",
      },
    ],
  }),
});

type CurrentUser = FunctionReturnType<typeof api.users.getCurrentUser>;

function AccountDetails({
  isAuthLoading,
  isAuthenticated,
  user,
}: {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  user: CurrentUser | undefined;
}) {
  return (
    <>
      {isAuthLoading && (
        <p className="px-5 py-6 text-sm text-(--app-muted) sm:px-8" role="status">
          Checking your sign-in…
        </p>
      )}

      {!isAuthLoading && !isAuthenticated && (
        <p className="px-5 py-6 text-sm leading-6 text-(--app-muted) sm:px-8">
          Sign in from the header to view your account details.
        </p>
      )}

      {!isAuthLoading && isAuthenticated && user === undefined && (
        <p className="px-5 py-6 text-sm text-(--app-muted) sm:px-8" role="status">
          Loading account details…
        </p>
      )}

      {!isAuthLoading && isAuthenticated && user !== undefined && (
        <dl className="text-sm">
          <div className="grid grid-cols-[minmax(7rem,0.7fr)_minmax(0,1.3fr)] border-b border-(--app-line) last:border-b-0">
            <dt className="px-5 py-4 font-medium text-(--app-muted) sm:px-8">Username</dt>
            <dd className="border-l border-(--app-line) px-5 py-4 font-medium wrap-break-word sm:px-8">
              {user.username}
            </dd>
          </div>
          <div className="grid grid-cols-[minmax(7rem,0.7fr)_minmax(0,1.3fr)]">
            <dt className="px-5 py-4 font-medium text-(--app-muted) sm:px-8">User ID</dt>
            <dd className="border-l border-(--app-line) px-5 py-4 font-mono text-xs break-all sm:px-8">
              {user.id}
            </dd>
          </div>
        </dl>
      )}
    </>
  );
}

function AccountPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");

  return (
    <div className="grid h-svh grid-rows-[auto_1fr] overflow-hidden bg-(--app-bg) text-(--app-ink)">
      <Header alignment="status" linkToStatus />
      <main className="relative min-h-0 overflow-y-auto bg-(--app-bg) px-5 sm:px-8">
        <TrailheadSurface />
        <article className="relative z-10 mx-auto flex min-h-full w-full max-w-176 flex-col border-x border-(--app-line) bg-(--app-bg)">
          <header className="px-5 py-8 sm:px-8 sm:py-10">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your account</h1>
            <p className="mt-3 max-w-[58ch] text-sm leading-6 text-(--app-muted) sm:text-base">
              The account details associated with your sign-in.
            </p>
          </header>

          <section aria-label="Account details" className="border-y border-(--app-line)">
            <AccountDetails
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              user={user}
            />
          </section>

          <footer className="mt-auto border-t border-(--app-line) px-5 py-4 text-xs text-(--app-muted) sm:px-8">
            BeforeDoors · Know before you go
          </footer>
        </article>
      </main>
    </div>
  );
}
