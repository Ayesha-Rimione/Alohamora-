import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookMarked,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Circle,
  FlaskConical,
  GraduationCap,
  Map as MapIcon,
  Target,
} from "lucide-react";
import { useMemo } from "react";

import { Owl } from "@/components/Owl";
import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/state/app-state";
import { computeCoverage, getCareer } from "@/data/skills";
import { generatePlan, nextPlanTask } from "@/data/plan";
import { DEMO_BADGES, DEMO_DEADLINES, DEMO_WEEK_ACTIVITY } from "@/data/academic";
import { OPPORTUNITIES } from "@/data/opportunities";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/dashboard")({
  head: () => ({
    meta: [
      { title: "The Great Hall — Alohomora!" },
      {
        name: "description",
        content: "Your career-readiness dashboard: skill coverage, next quests, deadlines and matched opportunities.",
      },
      { property: "og:title", content: "The Great Hall — Alohomora!" },
      { property: "og:description", content: "Your career and skills overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function CoverageRing({ percent, size = 110 }: { percent: number; size?: number }) {
  const r = 45;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" role="img" aria-label={`Skill coverage ${percent} percent`}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="oklch(0.925 0.024 83)" strokeWidth="10" />
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke="oklch(0.679 0.106 81.4)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * c} ${c}`}
        transform="rotate(-90 55 55)"
      />
      <text x="55" y="54" textAnchor="middle" className="fill-foreground font-display" fontSize="22" fontWeight="700">
        {percent}%
      </text>
      <text x="55" y="70" textAnchor="middle" fontSize="10" fill="oklch(0.45 0.05 300)">
        coverage
      </text>
    </svg>
  );
}

const MOVES = [
  {
    id: "move-1",
    title: "Complete Python assessment",
    desc: "Demonstrate your strongest core skill with a practical assessment.",
    to: "/restricted-section",
  },
  {
    id: "move-2",
    title: "Follow API tutorial",
    desc: "Build your first endpoint to close your primary requirement gap.",
    to: "/restricted-section",
  },
  {
    id: "move-3",
    title: "Build portfolio project",
    desc: "Ship a small end-to-end application and attach your evidence link.",
    to: "/map",
  },
];

function Dashboard() {
  const { state, toggle } = useApp();
  const role = getCareer(state.profile.targetRole) ?? getCareer("aiml")!;
  const coverage = useMemo(() => computeCoverage(state.profile.targetRole, state.skills), [state.profile.targetRole, state.skills]);
  const plan = useMemo(
    () => generatePlan(state.profile.targetRole, state.skills, state.profile.weeklyHours),
    [state.profile.targetRole, state.skills, state.profile.weeklyHours],
  );
  const nextTask = nextPlanTask(plan, state.planDone);

  return (
    <div className="space-y-12">
      {/* Welcome Card with ONE button */}
      <section className="plum-panel relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="relative flex flex-wrap items-center gap-6">
          <Owl size={96} animate={false} alt="" />
          <div className="min-w-0 flex-1 space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-cream">
              Welcome back, {state.profile.name || "Student"}.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-cream/90">
              Your map tracks verifiable proof, not empty course certificates.
            </p>
            <div className="pt-2">
              <Button asChild className="btn-sparkle glow-magic font-semibold min-h-[48px] text-base px-6">
                <Link to="/map">
                  <MapIcon className="size-5 mr-2" /> Explore your Marauder Map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Three large summary cards: career goal, skill coverage, next task */}
      <section aria-label="Progress summary" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Career Goal */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-base font-medium flex items-center gap-2">
              <Target className="size-5 text-gold-muted" /> Target Career Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {role.title}
            </div>
            <p className="text-base text-muted-foreground line-clamp-2">{role.blurb}</p>
          </CardContent>
          <div className="p-6 pt-0 border-t border-border/40 mt-4">
            <Button asChild variant="outline" size="sm" className="w-full min-h-[44px] text-base font-semibold">
              <Link to="/map">
                View required skills <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Skill Coverage */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-base font-medium">Skill Coverage</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <CoverageRing percent={coverage.percent} />
            <div className="space-y-1.5 text-base">
              <p className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="size-4 text-success" aria-hidden /> {coverage.demonstrated} demonstrated
              </p>
              <p className="flex items-center gap-2 text-foreground font-medium">
                <Circle className="size-4 text-gold-muted" aria-hidden /> {coverage.developing} developing
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Circle className="size-4 text-muted-foreground" aria-hidden /> {coverage.missing} need evidence
              </p>
            </div>
          </CardContent>
          <div className="p-6 pt-0 border-t border-border/40 mt-4">
            <Button asChild variant="outline" size="sm" className="w-full min-h-[44px] text-base font-semibold">
              <Link to="/map">
                Inspect skill breakdown <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Next Task */}
        <Card className="flex flex-col justify-between md:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-base font-medium flex items-center gap-2">
              <FlaskConical className="size-5 text-gold-muted" /> Next Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextTask ? (
              <>
                <div className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  {nextTask.title}
                </div>
                <p className="text-base text-muted-foreground">
                  {nextTask.day} · ~{nextTask.minutes} min · {nextTask.kind}
                </p>
              </>
            ) : (
              <p className="text-base text-muted-foreground">
                All scheduled tasks completed for this batch. Re-brew in the lab.
              </p>
            )}
          </CardContent>
          <div className="p-6 pt-0 border-t border-border/40 mt-4">
            <Button asChild variant="outline" size="sm" className="w-full min-h-[44px] text-base font-semibold">
              <Link to="/potion-lab">
                Open Potion Lab <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* "Your next three moves" as 3 big cards */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Your next three moves
          </h2>
          <p className="text-base text-muted-foreground mt-1">
            Recommended actions to build proof and expand your map.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {MOVES.map((m) => {
            const done = Boolean(state.movesDone[m.id]);
            return (
              <Card
                key={m.id}
                className={cn(
                  "flex flex-col justify-between transition-colors",
                  done ? "border-success/40 bg-success/5" : "border-border bg-card",
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-sans text-xl font-bold text-foreground leading-snug">
                      {m.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle("movesDone", m.id)}
                      className="p-1 rounded-full text-gold-muted hover:bg-gold/15"
                      aria-label={done ? "Mark move incomplete" : "Mark move complete"}
                    >
                      {done ? (
                        <CheckCircle2 className="size-6 text-success" />
                      ) : (
                        <Circle className="size-6 text-gold-muted" />
                      )}
                    </button>
                  </div>
                  <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 mt-4">
                  <Button asChild variant="outline" size="sm" className="w-full min-h-[44px] text-base font-semibold">
                    <Link to={m.to}>
                      Start move <ArrowRight className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
