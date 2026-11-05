import { createFileRoute } from "@tanstack/react-router";
import { Flame, Rocket, Sparkles, Trophy } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Owl } from "@/components/Owl";
import { useApp } from "@/state/app-state";
import { DEMO_BADGES, DEMO_COMPLETED_QUESTS, DEMO_WEEK_ACTIVITY } from "@/data/academic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/codex")({
  head: () => ({
    meta: [
      { title: "The Comeback Codex — Alohomora!" },
      {
        name: "description",
        content: "Your completed quests, streaks, projects, milestones and earned badges — proof of progress.",
      },
      { property: "og:title", content: "The Comeback Codex — Alohomora!" },
      { property: "og:description", content: "Every quest you've completed, recorded proudly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Codex,
});

function Codex() {
  const { state } = useApp();
  const planTasksDone = Object.values(state.planDone).filter(Boolean).length;
  const movesDone = Object.values(state.movesDone).filter(Boolean).length;
  const weeklyTotal = DEMO_WEEK_ACTIVITY.reduce((s, d) => s + d.hours, 0);
  const streak = weeklyTotal >= 8 ? 5 : weeklyTotal >= 4 ? 3 : 1;

  const stats = [
    { icon: Sparkles, label: "Quests completed", value: DEMO_COMPLETED_QUESTS.length + planTasksDone, hint: "demo quests + your plan checkmarks" },
    { icon: Flame, label: "Current streak", value: `${streak} day${streak === 1 ? "" : "s"}`, hint: "gentle streaks — a missed day never resets your story" },
    { icon: Rocket, label: "Projects shipped", value: 2, hint: "mini-projects from past quests" },
    { icon: Trophy, label: "Badges earned", value: DEMO_BADGES.filter((b) => b.earned).length, hint: `of ${DEMO_BADGES.length} in the codex` },
  ];

  return (
    <div>
      <PageHeader
        title="The Comeback Codex"
        subtitle="A record of every comeback, not just the winning streaks. Progress here is celebrated, never punished."
        icon={<Trophy className="size-7" />}
        actions={<DemoBadge />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-magic rounded-2xl border border-border bg-card p-5">
            <s.icon className="size-6 text-gold-muted" aria-hidden />
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm font-medium text-foreground">{s.label}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold tracking-wide">Completed quests & milestones</h2>
          <ol className="mt-4 space-y-3">
            {DEMO_COMPLETED_QUESTS.map((q) => (
              <li key={q.id} className="flex items-center gap-4 rounded-xl border border-border bg-background p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{q.title}</p>
                  <p className="text-xs text-muted-foreground">{q.kind} · {q.when} · demo record</p>
                </div>
                <span className="rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-muted">
                  Done ✓
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            {planTasksDone > 0
              ? `Plus ${planTasksDone} Potion Lab session${planTasksDone === 1 ? "" : "s"} and ${movesDone} dashboard move${movesDone === 1 ? "" : "s"} you checked off yourself — those count double in spirit.`
              : "Your next entry could come from today's Potion Lab plan — one 20-minute session is enough to begin."}
          </p>
        </section>

        <div className="space-y-4">
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold tracking-wide">This week's effort</h2>
            <div className="mt-4 flex h-28 items-end gap-2" role="img" aria-label={`Hours studied per day, ${weeklyTotal} total`}>
              {DEMO_WEEK_ACTIVITY.map((d, i) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="progress-magic w-full rounded-t-md" style={{ height: `${Math.max(6, (d.hours / 3.5) * 88)}px`, animationDelay: `${i * 0.15}s` }} title={`${d.day}: ${d.hours}h`} />
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {weeklyTotal >= state.profile.weeklyHours
                ? "You beat your weekly goal — take the win, the owl insists."
                : `${weeklyTotal}h of your ${state.profile.weeklyHours}h goal so far. Every hour logged is evidence, whatever the total.`}
            </p>
          </section>

          <section className="flex flex-wrap items-center gap-4 rounded-3xl border border-gold-muted/40 bg-gold/10 p-5">
            <Owl size={64} alt="" />
            <p className="min-w-48 flex-1 text-sm leading-relaxed text-foreground">
              Missed a week? The Codex doesn't erase you. Come back, check one box, and the story
              continues exactly where you left it.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold tracking-wide">Badge collection</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {DEMO_BADGES.map((b) => (
            <li key={b.id} className={cn("rounded-2xl border p-4 text-center", b.earned ? "border-gold-muted/50 bg-gold/10" : "border-dashed border-border bg-muted/40")}>
              <span className={cn("mx-auto flex size-10 items-center justify-center rounded-full", b.earned ? "bg-gold/30 text-gold-muted" : "bg-muted text-muted-foreground")} aria-hidden>
                <Sparkles className="size-5" />
              </span>
              <p className={cn("mt-2 font-display text-sm font-semibold", b.earned ? "text-foreground" : "text-muted-foreground")}>{b.name}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{b.desc}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
