import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, MailCheck, RotateCw } from "lucide-react";
import { toast } from "sonner";

import { LogoLockup } from "@/components/Brand";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { api, ApiError, USE_MOCK_API } from "@/lib/api";
import { peekMockCode } from "@/lib/api/mock";
import { useApp } from "@/state/app-state";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  beforeLoad: async () => {
    const user = await api.auth.getCurrentUser();
    if (user) throw redirect({ to: "/onboarding" });
  },
  head: () => ({
    meta: [
      { title: "Verify your email — Alohomora!" },
      { name: "description", content: "Enter the 6-digit code we sent to your university email." },
      { property: "og:title", content: "Verify your email — Alohomora!" },
      { property: "og:description", content: "Enter the 6-digit code we sent to your university email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyEmail,
});

const RESEND_COOLDOWN_SECONDS = 30;

function VerifyEmail() {
  const { setProfile } = useApp();
  const { email } = Route.useSearch();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [demoCode, setDemoCode] = useState<string | null>(
    USE_MOCK_API && email ? peekMockCode(email) : null,
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("No email to verify — start again from registration.");
      return;
    }
    if (code.length !== 6) {
      setError("Enter all six digits of the code.");
      return;
    }
    setBusy(true);
    try {
      const user = await api.auth.verifyEmail(email, code);
      if (!useAppProfileName()) setProfile({ name: user.name });
      toast.success("Email verified! Welcome to Alohomora! ✦");
      // Defer one tick so the session is settled before the guard reads it.
      setTimeout(() => window.location.assign("/onboarding"), 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  function useAppProfileName() {
    return false;
  }

  async function resend() {
    if (!email || cooldown > 0) return;
    setError("");
    try {
      await api.auth.resendCode(email);
      setResent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      if (USE_MOCK_API) setDemoCode(peekMockCode(email));
      toast.success("A new code is on its way to your inbox.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (!email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <main className="w-full max-w-md text-center">
          <div className="rounded-3xl border border-gold/20 bg-card p-8 text-foreground shadow-magic">
            <Owl size={64} className="mx-auto" alt="" />
            <h1 className="mt-4 font-display text-xl font-bold">Nothing to verify yet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an account first and we'll send you a 6-digit code.
            </p>
            <Button asChild className="mt-5 font-semibold">
              <Link to="/register">Create your account</Link>
            </Button>
          </div>
        </main>
      </div>
    );
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
          <div className="mb-5 flex items-center gap-3">
            <Owl size={56} className="animate-bob" alt="" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
              </p>
            </div>
          </div>

          {USE_MOCK_API && demoCode && (
            <p className="mb-4 rounded-xl border border-lavender/50 bg-lavender/15 px-3 py-2 text-xs text-plum">
              Demo mode — your code is <strong className="tracking-widest">{demoCode}</strong>.
            </p>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode} aria-label="6-digit verification code">
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="h-11 w-10 bg-card text-base font-semibold text-foreground" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="btn-sparkle glow-magic w-full font-semibold">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <MailCheck className="size-4" />}
              Verify email
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {resent && <p className="mb-2 text-xs text-success">New code sent.</p>}
            <button
              onClick={resend}
              disabled={cooldown > 0}
              className="inline-flex items-center gap-1.5 font-medium text-gold-muted hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:no-underline"
            >
              <RotateCw className="size-3.5" aria-hidden />
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Wrong address?{" "}
            <Link to="/register" className="font-medium text-gold-muted hover:underline">
              Register again
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
