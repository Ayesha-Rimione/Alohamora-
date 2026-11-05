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
      { property: "og:description", content: "Your next chapter starts here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

/** Deterministic UTC day count — safe for SSR hydration. */
function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86_400_000);
}

function CoverageRing({ percent, size = 120 }: { percent: number; size?: number }) {
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
      <text x="55" y="53" textAnchor="middle" className="fill-foreground font-display" fontSize="22" fontWeight="700">
        {percent}%
      </text>
      <text x="55" y="70" textAnchor="middle" fontSize="9" fill="oklch(0.45 0.05 300)">
        coverage
      </text>
    </svg>
  );
}

const MOVES = [
  {
    id: "move-1",
    title: "Complete a Python assessment",
    desc: "Prove your strongest skill with a timed practice set in the Restricted Section.",
    to: "/restricted-section",
  },
  {
    id: "move-2",
    title: "Follow a curated API tutorial",
    desc: "APIs & deployment is your biggest missing skill — 20 focused minutes today.",
    to: "/restricted-section",
  },
  {
    id: "move-3",
    title: "Build and document a small portfolio project",
    desc: "Ship something tiny end-to-end. Documented proof beats perfect plans.",
    to: "/map",
  },
];

function Dashboard() {
  const { state, toggle, cgpaResult } = useApp();
  const role = getCareer(state.profile.targetRole) ?? getCareer("aiml")!;
  const coverage = useMemo(() => computeCoverage(state.profile.targetRole, state.skills), [state.profile.targetRole, state.skills]);
  const plan = useMemo(
    () => generatePlan(state.profile.targetRole, state.skills, state.profile.weeklyHours),
    [state.profile.targetRole, state.skills, state.profile.weeklyHours],
  );
  const nextTask = nextPlanTask(plan, state.planDone);
  const planProgress = useMemo(() => {
    const all = plan.flatMap((w) => w.tasks);
    if (!all.length) return 0;
    return Math.round((all.filter((t) => state.planDone[t.id]).length / all.length) * 100);
  }, [plan, state.planDone]);

  const weeklyTotal = DEMO_WEEK_ACTIVITY.reduce((s, d) => s + d.hours, 0);
  const upcoming = [...DEMO_DEADLINES].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);

  const bestOpp = useMemo(() => {
    const have = new Set(
      coverage.areas.filter((a) => a.status !== "missing").map((a) => a.skill.id),
    );
    return [...OPPORTUNITIES].sort(
      (a, b) => b.skills.filter((s) => have.has(s)).length - a.skills.filter((s) => have.has(s)).length,
    )[0] ?? OPPORTUNITIES[0]!;
  }, [coverage]);

  const latestBadge = DEMO_BADGES.find((b) => b.earned)!;
  const movesDoneCount = MOVES.filter((m) => state.movesDone[m.id]).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="plum-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-8 right-8 opacity-15" aria-hidden>
          <Owl size={220} animate={false} alt="" />
        </div>
        <div className="relative flex flex-wrap items-center gap-5">
          <Owl size={92} className="animate-bob" alt="" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Welcome back, {state.profile.name || "student"}</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-wide text-cream sm:text-3xl">
              Your next chapter starts here.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/80">
              {coverage.percent < 40
                ? "Your map is still mostly unexplored — and that's exciting. Small quests, done daily, unlock doors faster than you'd think."
                : coverage.percent < 75
                  ? "You're well on your way. A few demonstrated skills stand between you and a full map — keep brewing."
                  : "Your map is glowing. Time to turn skill coverage into shipped projects and confident interviews."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button asChild className="btn-sparkle glow-magic font-semibold">
                <Link to="/map">
                  <MapIcon className="size-4" /> Explore your Marauder Map
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-gold/40 bg-transparent font-semibold text-gold hover:bg-gold/15 hover:text-gold">
                <Link to="/potion-lab">
                  <FlaskConical className="size-4" /> Continue your next quest
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section aria-label="Your progress overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-magic rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Target className="size-3.5 text-gold-muted" /> Career destination
          </p>
          <p className="mt-2 font-display text-xl font-bold text-foreground">{role.title}</p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{role.blurb}</p>
          <Button asChild variant="link" className="mt-2 h-auto p-0 text-gold-muted">
            <Link to="/map">View map <ArrowRight className="size-3.5" /></Link>
          </Button>
        </div>

        <div className="card-magic flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <CoverageRing percent={coverage.percent} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skill coverage</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-success" aria-hidden /> {coverage.demonstrated} demonstrated</li>
              <li className="flex items-center gap-2"><Circle className="size-3.5 text-gold-muted" aria-hidden /> {coverage.developing} developing</li>
              <li className="flex items-center gap-2"><CircleHelpLess /> {coverage.missing} need evidence</li>
            </ul>
            <Button asChild variant="link" className="h-auto p-0 text-xs text-gold-muted">
              <Link to="/map">How is this calculated?</Link>
            </Button>
          </div>
        </div>

        <div className="card-magic rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FlaskConical className="size-3.5 text-gold-muted" /> Next recommended task
          </p>
          {nextTask ? (
            <>
              <p className="mt-2 text-sm font-semibold text-foreground">{nextTask.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextTask.day} · ~{nextTask.minutes} min · {nextTask.kind}
              </p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-gold-muted">
                <Link to="/potion-lab">Open Potion Lab <ArrowRight className="size-3.5" /></Link>
              </Button>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Week complete — regenerate your plan for a fresh batch of quests.
            </p>
          )}
        </div>

        <div className="card-magic rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5"><GraduationCap className="size-3.5 text-gold-muted" /> Academic Standing</span>
            <DemoBadge label="Deterministic" />
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            {cgpaResult.totalCredits > 0 ? cgpaResult.cgpa.toFixed(2) : "3.66"}
            <span className="text-sm font-normal text-muted-foreground"> / 4.00 CGPA</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {cgpaResult.totalCredits || 15} completed credits across {state.courses.length} courses
          </p>
          <Button asChild variant="link" className="mt-2 h-auto p-0 text-gold-muted">
            <Link to="/grades">Summon GPA Goal <ArrowRight className="size-3.5" /></Link>
          </Button>
        </div>

        <div className="card-magic rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Weekly learning progress</span>
            <DemoBadge label="Demo" />
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{weeklyTotal}h <span className="text-sm font-normal text-muted-foreground">this week · goal {state.profile.weeklyHours}h</span></p>
          <div className="mt-3 flex h-20 items-end gap-1.5" role="img" aria-label={`Hours learned per day this week, ${weeklyTotal} total`}>
            {DEMO_WEEK_ACTIVITY.map((d, i) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="progress-magic w-full rounded-t-md"
                  style={{ height: `${Math.max(6, (d.hours / 3.5) * 64)}px`, animationDelay: `${i * 0.2}s` }}
                  title={`${d.day}: ${d.hours}h`}
                />
                <span className="text-[9px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-magic rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="size-3.5 text-gold-muted" /> Upcoming deadlines
          </p>
          <ul className="mt-2.5 space-y-2.5">
            {upcoming.map((d) => {
              const days = daysUntil(d.due);
              return (
                <li key={d.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.course} · {d.weight}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", days <= 7 ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground")}>
                    {days < 0 ? "past" : days === 0 ? "today" : `${days}d`}
                  </span>
                </li>
              );
            })}
          </ul>
          <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs text-gold-muted">
            <Link to="/marauder-mode">Open Marauder Mode <ArrowRight className="size-3" /></Link>
          </Button>
        </div>

        <div className="card-magic rounded-2xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Briefcase className="size-3.5 text-gold-muted" /> Recommended opportunity
          </p>
          <p className="mt-2 font-display text-lg font-bold text-foreground">{bestOpp.role}</p>
          <p className="text-xs text-muted-foreground">{bestOpp.company} · {bestOpp.location}</p>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">{bestOpp.why}</p>
          <div className="mt-2 flex items-center gap-2">
            <Button asChild variant="link" className="h-auto p-0 text-xs text-gold-muted">
              <Link to="/opportunities">See all matches <ArrowRight className="size-3" /></Link>
            </Button>
            <DemoBadge label="Demo listing" />
          </div>
        </div>
      </section>

      {/* Next three moves */}
      <section className="parchment rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-foreground">Your next three moves</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {movesDoneCount === MOVES.length
                ? "All three moves done — the owl is doing a proud little dance. New moves appear as your map evolves."
                : `Small, concrete steps beat grand plans. You've completed ${movesDoneCount} of ${MOVES.length} — every one you skip today waits for you tomorrow. No shame, just magic.`}
            </p>
          </div>
          <Button asChild variant="outline" className="gold-frame bg-card font-semibold">
            <Link to="/potion-lab">
              <BookMarked className="size-4" /> Open Potion Lab
            </Link>
          </Button>
        </div>
        <ul className="mt-5 grid gap-3 lg:grid-cols-3">
          {MOVES.map((m) => {
            const done = Boolean(state.movesDone[m.id]);
            return (
              <li key={m.id}>
                <div className={cn("flex h-full flex-col rounded-2xl border p-4 transition-colors", done ? "border-success/40 bg-success/5" : "border-border bg-card")}>
                  <button
                    className="flex items-start gap-2.5 text-left"
                    onClick={() => {
                      toggle("movesDone", m.id);
                    }}
                    aria-pressed={done}
                  >
                    {done ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                    ) : (
                      <Circle className="mt-0.5 size-5 shrink-0 text-gold-muted" aria-hidden />
                    )}
                    <span>
                      <span className={cn("block text-sm font-semibold text-foreground", done && "line-through opacity-70")}>{m.title}</span>
                      <span className="mt-1 block text-xs leading-snug text-muted-foreground">{m.desc}</span>
                    </span>
                  </button>
                  <Link to={m.to} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-muted hover:underline">
                    Go there <ArrowRight className="size-3" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Achievement */}
      <section className="card-magic flex flex-wrap items-center gap-4 rounded-2xl border border-gold-muted/40 bg-gold/10 p-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-gold/30 text-gold-muted">
          <Award className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-muted">Latest Comeback Codex achievement</p>
          <p className="mt-0.5 font-display text-lg font-bold text-foreground">{latestBadge.name}</p>
          <p className="text-sm text-muted-foreground">{latestBadge.desc}</p>
        </div>
        <Button asChild variant="outline" className="gold-frame bg-card font-semibold">
          <Link to="/codex">Open the Codex</Link>
        </Button>
      </section>
    </div>
  );
}

function CircleHelpLess() {
  return <Circle className="size-3.5 text-muted-foreground" aria-hidden />;
}
