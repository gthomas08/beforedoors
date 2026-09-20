import { Dialog } from "@base-ui/react/dialog";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import {
  useSignInWithPassword,
  useSignUpWithPassword,
} from "@convex-dev/auth/providers/password/react";
import { X } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "signIn" | "signUp";

type AuthDialogCopy = {
  title: string;
  description: string;
  closeLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
  passwordHint?: string;
  pendingLabel: string;
  submitLabel: string;
  switchPrompt: string;
  switchLabel: string;
  nextMode: AuthMode;
};

const AUTH_DIALOG_COPY: Record<AuthMode, AuthDialogCopy> = {
  signIn: {
    title: "Welcome back",
    description: "Sign in with your username and password.",
    closeLabel: "Close sign-in dialog",
    passwordAutoComplete: "current-password",
    pendingLabel: "Signing in…",
    submitLabel: "Sign in",
    switchPrompt: "New to BeforeDoors?",
    switchLabel: "Create an account",
    nextMode: "signUp",
  },
  signUp: {
    title: "Create your account",
    description: "Choose a username and password.",
    closeLabel: "Close sign-up dialog",
    passwordAutoComplete: "new-password",
    passwordHint: "Use 10–100 characters and avoid common passwords.",
    pendingLabel: "Creating account…",
    submitLabel: "Create account",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    nextMode: "signIn",
  },
};

export function PasswordAuthDialog({
  mode,
  onClose,
  onChangeMode,
}: {
  mode: AuthMode;
  onClose: () => void;
  onChangeMode: (mode: AuthMode) => void;
}) {
  const { signIn, pending: isSigningIn } = useSignInWithPassword(api.auth.signInWithPassword);
  const { signUp, pending: isSigningUp } = useSignUpWithPassword(api.auth.signUpWithPassword);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const errorId = useId();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const isSignUp = mode === "signUp";
  const copy = AUTH_DIALOG_COPY[mode];
  const isPending = isSignUp ? isSigningUp : isSigningIn;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const result = isSignUp
      ? await signUp({ username, password })
      : await signIn({ username, password });

    if (!result.success) {
      setError(authErrorMessage(result.userError));
      return;
    }

    onClose();
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-60 bg-[color-mix(in_oklch,var(--app-ink)_38%,transparent)]" />
        <Dialog.Viewport className="fixed inset-0 z-60 grid place-items-center overflow-y-auto px-4 py-6">
          <Dialog.Popup
            initialFocus={usernameInputRef}
            className="w-full max-w-md border border-(--app-line) bg-(--app-bg) text-(--app-ink) shadow-overlay-large outline-none"
          >
            <div className="flex items-start justify-between border-b border-(--app-line) px-5 py-4 sm:px-6">
              <div>
                <Dialog.Title className="text-xl font-semibold tracking-tight">
                  {copy.title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-5 text-(--app-muted)">
                  {copy.description}
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label={copy.closeLabel}
                className="flex size-8 shrink-0 items-center justify-center border border-transparent text-(--app-muted) hover:border-(--app-line) hover:text-(--app-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
              >
                <X aria-hidden="true" className="size-4" />
              </Dialog.Close>
            </div>

            <form className="space-y-5 px-5 py-5 sm:px-6" onSubmit={handleSubmit}>
              <PasswordAuthFormControls
                copy={copy}
                error={error}
                errorId={errorId}
                isPending={isPending}
                onChangeMode={onChangeMode}
                onPasswordChange={(value) => {
                  setPassword(value);
                  setError(undefined);
                }}
                onUsernameChange={(value) => {
                  setUsername(value);
                  setError(undefined);
                }}
                password={password}
                username={username}
                usernameInputRef={usernameInputRef}
              />
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PasswordAuthFormControls({
  copy,
  error,
  errorId,
  isPending,
  onChangeMode,
  onPasswordChange,
  onUsernameChange,
  password,
  username,
  usernameInputRef,
}: {
  copy: AuthDialogCopy;
  error?: string;
  errorId: string;
  isPending: boolean;
  onChangeMode: (mode: AuthMode) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  password: string;
  username: string;
  usernameInputRef: RefObject<HTMLInputElement | null>;
}) {
  let passwordDescriptionId: string | undefined;
  if (error) passwordDescriptionId = errorId;
  else if (copy.passwordHint) passwordDescriptionId = "auth-password-hint";

  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="auth-username"
          className="text-[0.7rem] font-semibold tracking-[0.12em] text-(--app-ink) uppercase"
        >
          Username
        </Label>
        <Input
          ref={usernameInputRef}
          id="auth-username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-11 bg-(--app-field) px-3 text-sm text-(--app-field-ink)"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="auth-password"
          className="text-[0.7rem] font-semibold tracking-[0.12em] text-(--app-ink) uppercase"
        >
          Password
        </Label>
        <Input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={copy.passwordAutoComplete}
          required
          minLength={10}
          maxLength={100}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={passwordDescriptionId}
          className="h-11 bg-(--app-field) px-3 text-sm text-(--app-field-ink)"
        />
        {copy.passwordHint && (
          <p id="auth-password-hint" className="text-xs leading-5 text-(--app-muted)">
            {copy.passwordHint}
          </p>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm leading-5 text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="h-10 w-full text-xs">
        {isPending ? copy.pendingLabel : copy.submitLabel}
      </Button>

      <p className="border-t border-(--app-line) pt-4 text-center text-sm text-(--app-muted)">
        {copy.switchPrompt}{" "}
        <button
          type="button"
          onClick={() => onChangeMode(copy.nextMode)}
          className="cursor-pointer font-semibold text-(--app-ink) underline underline-offset-4 hover:text-(--app-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--app-focus)"
        >
          {copy.switchLabel}
        </button>
      </p>
    </>
  );
}

function authErrorMessage(error: {
  error: string;
  minimumLength?: number;
  maximumLength?: number;
  retryAfterMs?: number;
}) {
  switch (error.error) {
    case "USERNAME_TOO_SHORT":
      return `Use at least ${error.minimumLength ?? 1} character for your username.`;
    case "USERNAME_HAS_SURROUNDING_WHITESPACE":
      return "Remove spaces from the beginning or end of your username.";
    case "USERNAME_HAS_INVALID_CHARACTERS":
      return "That username contains characters we can’t use. Choose another.";
    case "USERNAME_TAKEN":
      return "That username is already taken. Try another.";
    case "USER_NOT_FOUND":
    case "INVALID_CREDENTIALS":
      return "That username and password didn’t match. Check them and try again.";
    case "PASSWORD_TOO_SHORT":
      return `Use at least ${error.minimumLength ?? 10} characters for your password.`;
    case "PASSWORD_TOO_LONG":
      return `Use no more than ${error.maximumLength ?? 100} characters for your password.`;
    case "PASSWORD_HAS_SURROUNDING_WHITESPACE":
      return "Remove spaces from the beginning or end of your password.";
    case "PASSWORD_TOO_COMMON":
      return "Choose a less common password.";
    case "RATE_LIMITED":
      return `Too many attempts. Try again in ${Math.max(1, Math.ceil((error.retryAfterMs ?? 1000) / 1000))} seconds.`;
    default:
      return "We couldn’t complete that request. Please try again.";
  }
}
