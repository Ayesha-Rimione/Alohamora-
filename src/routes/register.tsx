import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { LogoLockup } from "@/components/Brand";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError, passwordStrength, validatePassword, validateStudentId, validateUniversityEmail } from "@/lib/api";
import { UNIVERSITIES } from "@/config/universities";
import { useApp } from "@/state/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  beforeLoad: async () => {
    const user = await api.auth.getCurrentUser();
    if (user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Create your account — Alohomora!" },
      { name: "description", content: "Register with your university email to unlock your Marauder Map." },
      { property: "og:title", content: "Create your account — Alohomora!" },
      { property: "og:description", content: "Register with your university email to unlock your Marauder Map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Register,
});

interface FieldErrors {
  fullName?: string;
  university?: string;
  email?: string;
  studentId?: string;
  password?: string;
  confirm?: string;
  agree?: string;
}

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState(UNIVERSITIES[0]?.name ?? "");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const strength = useMemo(() => passwordStrength(password), [password]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = "Enter your full name.";
    if (!university) next.university = "Select your university.";
    const emailError = validateUniversityEmail(email, university);
    if (emailError) next.email = emailError;
    const idError = validateStudentId(studentId);
    if (idError) next.studentId = idError;
    const pwError = validatePassword(password);
    if (pwError) next.password = pwError;
    if (confirm !== password) next.confirm = "Passwords don't match.";
    if (!agree) next.agree = "Please accept the Terms and Privacy Notice to continue.";
    return next;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next = validate();
    console.log("[Register UI] Validation errors:", JSON.stringify(next));
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      await api.auth.register({ fullName, university, email, studentId, password });
      toast.success("Account created! Check your university email for the 6-digit code. ✦");
      navigate({ to: "/verify-email", search: { email: email.trim().toLowerCase() } });
    } catch (err) {
      console.error("[Register UI Error]:", err);
      if (err instanceof ApiError && err.code === "email_taken") {
        setErrors({ email: err.message });
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  }

  const strengthColor = ["bg-muted", "bg-destructive", "bg-gold-muted", "bg-gold", "bg-success"][strength.score];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <main className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="Alohomora! home">
            <LogoLockup size={44} />
          </Link>
        </div>
        <div className="rounded-3xl border border-gold/20 bg-card p-6 text-foreground shadow-magic sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Owl size={56} className="animate-bob" alt="" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide">Create your account</h1>
              <p className="text-sm text-muted-foreground">Only university students can register — it keeps the map honest.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Full name</Label>
              <Input
                id="reg-name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Hermione Granger"
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && <FieldError message={errors.fullName} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-university">University</Label>
              <Select value={university} onValueChange={setUniversity}>
                <SelectTrigger id="reg-university" aria-invalid={Boolean(errors.university)}>
                  <SelectValue placeholder="Select your university" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {UNIVERSITIES.map((u) => (
                    <SelectItem key={u.name} value={u.name}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.university && <FieldError message={errors.university} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email">University email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`you@${UNIVERSITIES[0]?.emailDomains[0] ?? "university.edu"}`}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <FieldError message={errors.email} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-student-id">Student ID</Label>
              <Input
                id="reg-student-id"
                inputMode="numeric"
                autoComplete="off"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="6–12 digits, e.g. 2210001"
                aria-invalid={Boolean(errors.studentId)}
              />
              {errors.studentId && <FieldError message={errors.studentId} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pr-10"
                  aria-invalid={Boolean(errors.password)}
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
              {password && (
                <div className="flex items-center gap-2" aria-live="polite">
                  <div className="flex h-1.5 flex-1 gap-1" aria-hidden>
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className={cn("h-full flex-1 rounded-full", i <= strength.score ? strengthColor : "bg-muted")} />
                    ))}
                  </div>
                  <span className="w-14 text-right text-[11px] font-medium text-muted-foreground">{strength.label}</span>
                </div>
              )}
              {errors.password && <FieldError message={errors.password} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type the same password again"
                aria-invalid={Boolean(errors.confirm)}
              />
              {errors.confirm && <FieldError message={errors.confirm} />}
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-agree" className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox
                  id="reg-agree"
                  checked={agree}
                  onCheckedChange={(v) => setAgree(v === true)}
                  className="mt-0.5"
                  aria-invalid={Boolean(errors.agree)}
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" rel="noopener" className="font-medium text-gold-muted underline">Terms</Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" rel="noopener" className="font-medium text-gold-muted underline">Privacy Notice</Link>.
                </span>
              </label>
              {errors.agree && <FieldError message={errors.agree} />}
            </div>

            {formError && (
              <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}

            <Button type="submit" disabled={busy} className="btn-sparkle glow-magic w-full font-semibold">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-gold-muted hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
