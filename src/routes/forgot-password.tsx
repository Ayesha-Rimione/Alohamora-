import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, MailQuestion } from "lucide-react";

import { LogoLockup } from "@/components/Brand";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: async () => {
    const user = await api.auth.getCurrentUser();
    if (user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Forgot password — Alohomora!" },
      { name: "description", content: "Request a password reset link for your university email." },
      { property: "og:title", content: "Forgot password — Alohomora!" },
      { property: "og:description", content: "Request a password reset link for your university email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      // Always reported as success — the backend decides whether the address
      // exists, so this screen never reveals whether an account is registered.
      await api.auth.requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <main className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="Alohomora! home">
            <LogoLockup size={44} />
          </Link>
        </div>
        <div className="rounded-3xl border border-gold/20 bg-card p-6 text-foreground shadow-magic sm:p-8">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                <MailQuestion className="size-7" aria-hidden />
              </span>
              <h1 className="mt-4 font-display text-xl font-bold tracking-wide">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If that address is registered, a reset link has been sent.
              </p>
              <Button asChild variant="outline" className="mt-6 w-full font-semibold">
                <Link to="/login">Back to log in</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-3">
                <Owl size={56} className="animate-bob" alt="" />
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-wide">Forgot your password?</h1>
                  <p className="text-sm text-muted-foreground">Happens to the best of us. The owl will help.</p>
                </div>
              </div>
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="fp-email">University email</Label>
                  <Input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@iubat.edu"
                  />
                </div>
                {error && (
                  <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={busy} className="btn-sparkle glow-magic w-full font-semibold">
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                Remembered it after all?{" "}
                <Link to="/login" className="font-semibold text-gold-muted hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
