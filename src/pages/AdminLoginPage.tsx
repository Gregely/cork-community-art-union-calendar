import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import { getCurrentUser, isCurrentUserAdmin, signInAdmin, signOut } from "../lib/auth";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedInNonAdmin, setIsSignedInNonAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function checkSession() {
      try {
        const user = await getCurrentUser();

        if (!isCurrent) return;

        if (!user) {
          setIsCheckingSession(false);
          return;
        }

        const admin = await isCurrentUserAdmin();

        if (!isCurrent) return;

        if (admin) {
          navigate("/admin", { replace: true });
          return;
        }

        setIsSignedInNonAdmin(true);
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(error instanceof Error ? error.message : "Could not check your login session.");
        }
      } finally {
        if (isCurrent) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      isCurrent = false;
    };
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSignedInNonAdmin(false);

    try {
      setIsSubmitting(true);
      const result = await signInAdmin(email.trim(), password);

      if (result.isAdmin) {
        navigate("/admin", { replace: true });
        return;
      }

      setIsSignedInNonAdmin(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not log in with those details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setErrorMessage("");

    try {
      await signOut();
      setIsSignedInNonAdmin(false);
      setPassword("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Moderator login"
      intro="Log in with a Supabase Auth account that has been added to the admin list."
    >
      <form onSubmit={handleSubmit} className="max-w-md rounded-2xl border-2 border-ink bg-white p-4 shadow-poster sm:p-6">
        {isCheckingSession ? <LoadingState message="Checking admin session..." /> : null}
        {!isCheckingSession && isSignedInNonAdmin ? (
          <div className="mb-5 rounded-2xl border-2 border-ink bg-posterYellow p-4">
            <h2 className="font-display text-2xl font-black">Access denied</h2>
            <p className="mt-2 text-sm font-bold">
              You are signed in, but this account is not an admin.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 min-h-11 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-posterYellow"
            >
              Sign out
            </button>
          </div>
        ) : null}
        {errorMessage ? <div className="mb-5"><ErrorState message={errorMessage} /></div> : null}
        <label className="space-y-2 text-sm font-black">
          Email
          <input
            required
            className="form-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="moderator@example.com"
            disabled={isSubmitting || isCheckingSession}
          />
        </label>
        <label className="mt-4 block space-y-2 text-sm font-black">
          Password
          <input
            required
            className="form-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            disabled={isSubmitting || isCheckingSession}
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting || isCheckingSession}
          className="button-primary mt-6 w-full bg-ink text-paper disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </PageShell>
  );
}
