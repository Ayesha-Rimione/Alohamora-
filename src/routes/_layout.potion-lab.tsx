import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock, ExternalLink, FlaskConical, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useApp } from "@/state/app-state";
import { generatePlan, type PlanTask } from "@/data/plan";
import { getSkill } from "@/data/skills";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/potion-lab")({
  head: () => ({
    meta: [
      { title: "Potion Lab — Alohomora!" },
      {
        name: "description",
        content: "A personalized, hands-on weekly learning plan brewed around your schedule and skill gaps.",
      },
      { property: "og:title", content: "Potion Lab — Alohomora!" },
      { property: "og:description", content: "Your weekly learning plan, brewed around real life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PotionLab,
});

const KIND_COLOR: Record<PlanTask["kind"], string> = {
  Learn: "bg-lavender/25 text-plum border-lavender/50",
  Practice: "bg-gold/20 text-gold-muted border-gold-muted/40",
  Build: "bg-success/15 text-success border-success/40",
  Share: "bg-purple-rich/15 text-purple-rich border-purple-rich/40",
};

function PotionLab() {
  const { state, setProfile, toggle } = useApp();
  const [variant, setVariant] = useState(0);

  const plan = useMemo(
    () => generatePlan(state.profile.targetRole, state.skills, state.profile.weeklyHours, variant),
    [state.profile.targetRole, state.skills, state.profile.weeklyHours, variant],
  );

  const allTasks = plan.flatMap((w) => w.tasks);
  const doneCount = allTasks.filter((t) => state.planDone[t.id]).length;
  const percent = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;

  function regenerate() {
    setVariant((v) => v + 1);
    toast.success("Re-brewed! A fresh plan, prioritizing your weakest skill areas.");
  }

  return (
    <div>
      <PageHeader
        title="Potion Lab"
        subtitle="A practical weekly plan brewed from your career goal, schedule and current ability. Hands-on practice first — endless videos are for the faint of heart."
        icon={<FlaskConical className="size-7" />}
        actions={
          <Button onClick={regenerate} variant="outline" className="gold-frame bg-card font-semibold">
            <RotateCcw className="size-4" /> Re-brew my plan
          </Button>
        }
      />

      {/* Controls */}
      <div className="card-magic mb-6 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="min-w-56 flex-1">
          <Label htmlFor="pl-hours" className="text-sm">
            Hours available per week: <span className="font-display font-bold text-gold-muted">{state.profile.weeklyHours}h</span>
          </Label>
          <Slider
            id="pl-hours"
            className="mt-2.5"
            value={[state.profile.weeklyHours]}
            onValueChange={(v) => setProfile({ weeklyHours: v[0] ?? state.profile.weeklyHours })}
            min={2}
            max={30}
            step={1}
            aria-label="Weekly hours available for learning"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            The plan reshapes instantly: more hours means longer practice and weekend build sessions.
          </p>
        </div>
        <div className="min-w-40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan progress</p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-magic h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{doneCount} of {allTasks.length} tasks · {percent}%</p>
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-6">
        {plan.map((week, wi) => {
          const skill = getSkill(week.focusSkill);
          const done = week.tasks.filter((t) => state.planDone[t.id]).length;
          const weekPct = Math.round((done / week.tasks.length) * 100);
          const complete = done === week.tasks.length;
          return (
            <section
              key={week.id}
              className={cn(
                "rounded-3xl border p-5 sm:p-6",
                complete ? "border-success/40 bg-success/5" : "border-border bg-card",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold tracking-wide text-foreground">{week.goal}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Focus: <span className="font-medium text-foreground">{skill?.name}</span> · {week.tasks.length} sessions · ~
                    {Math.round(week.tasks.reduce((s, t) => s + t.minutes, 0) / 60)}h total
                  </p>
                </div>
                {complete && (
                  <p className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                    <Sparkles className="size-3.5" /> Week complete — the owl hoots proudly!
                  </p>
                )}
              </div>

              <ul className="mt-4 grid gap-2.5 lg:grid-cols-2">
                {week.tasks.map((task) => {
                  const isDone = Boolean(state.planDone[task.id]);
                  return (
                    <li
                      key={task.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                        isDone ? "border-success/40 bg-success/5" : "border-border bg-background",
                      )}
                    >
                      <Checkbox
                        id={`chk-${task.id}`}
                        checked={isDone}
                        onCheckedChange={() => {
                          toggle("planDone", task.id);
                          if (!isDone && done + 1 === week.tasks.length) {
                            toast.success("Week complete! The Keykeeper adds a badge to your Codex. 🏅");
                          } else if (!isDone) {
                            toast("Progress saved — every checkmark is real evidence.");
                          }
                        }}
                        className="mt-0.5"
                        aria-label={`Mark task done: ${task.title}`}
                      />
                      <div className="min-w-0 flex-1">
                        <label htmlFor={`chk-${task.id}`} className={cn("block cursor-pointer text-sm font-medium leading-snug text-foreground", isDone && "line-through opacity-70")}>
                          {task.title}
                        </label>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", KIND_COLOR[task.kind])}>
                            {task.kind}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="size-3" aria-hidden /> {task.day} · {task.minutes} min
                          </span>
                          {task.url && (
                            <a
                              href={task.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-muted hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open resource <ExternalLink className="size-3" aria-hidden />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={weekPct} aria-valuemin={0} aria-valuemax={100} aria-label={`Week ${wi + 1} progress`}>
                <div className="progress-magic h-full rounded-full transition-all duration-500" style={{ width: `${weekPct}%` }} />
              </div>
            </section>
          );
        })}
      </div>

      {/* Encouragement */}
      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-gold-muted/40 bg-gold/10 p-5">
        <Owl size={64} alt="" />
        <p className="min-w-52 flex-1 text-sm leading-relaxed text-foreground">
          {percent === 0
            ? "The cauldron is full and waiting. One 20-minute session is all it takes to start — no heroic all-nighters required."
            : percent < 100
              ? `You've completed ${percent}% of this plan. Falling behind is normal — unfinished tasks simply roll forward. No guilt in this lab, only progress.`
              : "Full plan complete! Re-brew for a fresh batch and let the owl record your streak in the Codex."}
        </p>
        <DemoBadge label="Mock planner" />
      </div>
    </div>
  );
}
