import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GraduationCap, KeyRound, Mail, School, ShieldCheck, Target } from "lucide-react";
import { useEffect, useState } from "react";

import { Owl } from "@/components/Owl";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/app-state";
import { api, type AuthUser } from "@/lib/api";
import { getCareer } from "@/data/skills";

export const Route = createFileRoute("/_layout/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Alohomora!" },
      { name: "description", content: "Your account details, university info, academic progress and career destination." },
      { property: "og:title", content: "My Profile — Alohomora!" },
      { property: "og:description", content: "Your account details, university info, academic progress and career destination." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-gold-muted" aria-hidden /> {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

function Profile() {
  const { state, update, cgpaResult } = useApp();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;
    api.auth.getCurrentUser().then((u) => {
      if (active && u) setAuthUser(u);
    });
    return () => {
      active = false;
    };
  }, []);

  const p = state.profile;
  const displayName = p.name || authUser?.name || "Student";
  const displayEmail = authUser?.email || `${(p.studentId || "student").toLowerCase()}@university.edu`;
  const displayId = p.studentId || authUser?.studentId || "2210001";
  const displayUni = p.university || authUser?.university || "IUBAT — International University of Business Agriculture and Technology";
  const career = getCareer(p.targetRole);

  return (
    <div className="space-y-8">
      <PageHeader
        title="My profile"
        subtitle="Your account details, registered university info and academic progress in one place."
        icon={<GraduationCap className="size-6" />}
        actions={
          <Button asChild className="btn-sparkle glow-magic font-semibold">
            <Link to="/map">
              Edit career & skills <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-xs">
          <Owl size={110} className="mx-auto animate-bob" alt="" />
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">{displayName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {p.degree || "B.Sc. in Computer Science and Engineering"}
          </p>
          <p className="text-xs text-gold-muted font-medium mt-0.5">
            {p.academicYear || "3rd year"} · {p.semester || "5th semester"}
          </p>

          <div className="mt-5 rounded-xl border border-border bg-background/60 p-3 text-left space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Academic CGPA</span>
              <span className="font-bold text-foreground">{cgpaResult.cgpa > 0 ? cgpaResult.cgpa.toFixed(2) : "3.66"} / 4.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Completed Credits</span>
              <span className="font-medium text-foreground">{cgpaResult.totalCredits || 15} hrs</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Target Career</span>
              <span className="font-medium text-primary-foreground bg-primary/20 px-1.5 py-0.5 rounded text-[11px]">{career.title}</span>
            </div>
          </div>

          {!state.onboarded && (
            <Button asChild className="mt-4 w-full font-semibold">
              <Link to="/onboarding">Complete Onboarding Tour</Link>
            </Button>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="font-display text-lg font-semibold tracking-wide text-foreground">Academic & Identity Information</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Used across your Marauder Map, Accio Grades, and Potion Lab.</p>
          <div className="mt-3">
            <Row icon={ShieldCheck} label="Full name" value={displayName} />
            <Row icon={Mail} label="University email" value={displayEmail} />
            <Row icon={KeyRound} label="Student ID" value={displayId} />
            <Row icon={School} label="University" value={displayUni} />
            <Row icon={GraduationCap} label="Degree program" value={p.degree || "B.Sc. in CSE"} />
            <Row icon={BookOpen} label="Academic stage" value={`${p.academicYear || "3rd year"} (${p.semester || "5th semester"})`} />
            <Row icon={Target} label="Career destination" value={career.title} />
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
            <div>
              <span className="text-sm font-medium text-foreground">Weekly learning commitment</span>
              <p className="text-xs text-muted-foreground">Powers your personalized Potion Lab schedule</p>
            </div>
            <span className="text-sm font-bold text-foreground bg-gold/15 px-2.5 py-1 rounded-md border border-gold-muted/30">{p.weeklyHours} hours / wk</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="font-medium">
              <Link to="/onboarding">
                Retake setup tour
              </Link>
            </Button>
            <Button asChild size="sm" className="btn-sparkle glow-magic font-medium ml-auto">
              <Link to="/grades">
                Open Accio Grades Calculator
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
