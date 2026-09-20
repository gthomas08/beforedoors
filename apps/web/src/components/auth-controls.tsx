import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Result } from "better-result";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type AuthMode = "signIn" | "signUp";

const LazyPasswordAuthDialog = lazy(async () => {
  const module = await import("./password-auth-dialog");
  return { default: module.PasswordAuthDialog };
});

function preloadPasswordAuthDialog() {
  void import("./password-auth-dialog");
}

function AuthActionItems({
  isLoading,
  isAuthenticated,
  isSigningOut,
  onSignOut,
  onSetAuthMode,
}: {
  isLoading: boolean;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  onSignOut: () => void;
  onSetAuthMode: (mode: AuthMode) => void;
}) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const showAccountActions = !isLoading && isAuthenticated;
  const showGuestActions = !isLoading && !isAuthenticated;
  const isAccountActive = pathname === "/account";

  return (
    <>
      {isLoading && (
        <span className="text-xs text-(--app-muted)" role="status">
          Checking…
        </span>
      )}

      {showAccountActions && (
        <>
          <Link
            to="/account"
            className={`inline-flex h-full items-center px-1.5 text-xs leading-4 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus) sm:px-2 ${
              isAccountActive
                ? "text-(--app-ink) underline decoration-(--app-accent) decoration-2 underline-offset-4"
                : "text-(--app-muted) hover:text-(--app-ink)"
            }`}
            aria-current={isAccountActive ? "page" : undefined}
          >
            Account
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSigningOut}
            onClick={onSignOut}
            className="h-8 px-1.5 text-[0.68rem] leading-4 sm:px-2 sm:text-xs"
          >
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Button>
        </>
      )}

      {showGuestActions && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onFocus={preloadPasswordAuthDialog}
            onClick={() => onSetAuthMode("signIn")}
            className="h-8 px-1.5 text-[0.68rem] leading-4 sm:px-2 sm:text-xs"
          >
            Sign in
          </Button>
          <Button
            type="button"
            size="sm"
            onFocus={preloadPasswordAuthDialog}
            onClick={() => onSetAuthMode("signUp")}
            className="h-8 px-2 text-[0.68rem] leading-4 sm:px-2.5 sm:text-xs"
          >
            Sign up
          </Button>
        </>
      )}
    </>
  );
}

export function AuthControls() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const result = await Result.tryPromise({
      try: () => signOut(),
      catch: () => "sign-out-failed" as const,
    });

    if (result.isErr()) {
      toast.error("We couldn’t sign you out. Please try again.");
    }

    setIsSigningOut(false);
  }

  return (
    <>
      <nav aria-label="Account" className="flex h-full shrink-0 items-center gap-1 sm:gap-2">
        <AuthActionItems
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          isSigningOut={isSigningOut}
          onSignOut={() => void handleSignOut()}
          onSetAuthMode={setAuthMode}
        />
      </nav>

      {authMode && (
        <Suspense fallback={null}>
          <LazyPasswordAuthDialog
            key={authMode}
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onChangeMode={setAuthMode}
          />
        </Suspense>
      )}
    </>
  );
}
