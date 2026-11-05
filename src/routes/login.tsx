import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { LogoLockup } from "@/components/Brand";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError, USE_MOCK_API, MOCK_DEMO_EMAIL, MOCK_DEMO_PASSWORD } from "@/lib/api";
import { safeRedirect } from "@/lib/safe-redirect";
import { useApp } from "@/state/app-state";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: async () => {
    const user = await api.auth.getCurrentUser();
    if (user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Log in — Alohomora!" },
      { name: "description", content: "Sign in to Alohomora! with your university email or student ID." },
      { property: "og:title", content: "Log in — Alohomora!" },
      { property: "og:description", content: "Sign in and keep building your proof." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useRouter().navigate;
  const { state, setProfile } = useApp();
  const { redirect } = Route.useSearch();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password) {
      setError("Enter your university email or student ID and your password.");
      return;
    }
    setBusy(true);
    try {
      const user = await api.auth.login(identifier, password);
      // Prefill the app profile with the signed-in user's real name once.
      if (!state.profile.name) setProfile({ name: user.name });
      toast.success(`Welcome back, ${user.name}! The door is open. ✦`);
      navigate({ href: safeRedirect(redirect) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
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
          <div className="mb-5 flex items-center gap-3">
            <Owl size={56} className="animate-bob" alt="" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide">Welcome back</h1>
              <p className="text-sm text-muted-foreground">The Keykeeper kept your map safe.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="login-id">University email or student ID</Label>
              <Input
                id="login-id"
                name="identifier"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@iubat.edu or 2210001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium text-gold-muted hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="btn-sparkle glow-magic w-full font-semibold">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              Log in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            New to Alohomora?{" "}
            <Link to="/register" className="font-semibold text-gold-muted hover:underline">
              Create your account
            </Link>
          </p>

          {USE_MOCK_API && (
            <div className="mt-4 rounded-xl border border-lavender/50 bg-lavender/15 px-3 py-2 text-xs text-plum">
              Demo mode — try <strong>{MOCK_DEMO_EMAIL}</strong> / <strong>{MOCK_DEMO_PASSWORD}</strong> or register a
              new account. Sessions live in memory only: refreshing signs you out.
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" target="_blank" rel="noopener" className="underline hover:text-foreground">Terms</Link> and{" "}
          <Link to="/privacy" target="_blank" rel="noopener" className="underline hover:text-foreground">Privacy Notice</Link>.
        </p>
      </main>
    </div>
  );
}
