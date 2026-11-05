import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Clock, ExternalLink, FlaskConical, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [showRestOfWeek, setShowRestOfWeek] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

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

  const currentWeek = plan[0];
  const laterWeeks = plan.slice(1);
  const currentWeekSkill = currentWeek ? getSkill(currentWeek.focusSkill) : undefined;

  // Split current week tasks into "Do this next" (top 3) and "Rest of this week"
  const currentWeekTasks = currentWeek?.tasks ?? [];
  const nextTasks = currentWeekTasks.slice(0, 3);
  const restOfWeekTasks = currentWeekTasks.slice(3);

  const toggleWeekExpanded = (weekId: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekId]: !prev[weekId],
    }));
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Potion Lab"
        subtitle="Your weekly learning plan."
        icon={<FlaskConical className="size-8" />}
        actions={
          <Button onClick={regenerate} variant="outline" className="gold-frame bg-card font-semibold min-h-[48px] text-base px-5">
            <RotateCcw className="size-5 mr-2" /> Re-brew my plan
          </Button>
        }
      />

      {/* Row of 3 large cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Card 1: Hours per week */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-base font-medium">Hours per week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-4xl font-bold text-gold-muted">
                {state.profile.weeklyHours}h
              </span>
              <span className="text-sm text-muted-foreground">Adjust pace</span>
            </div>
            <Slider
              id="pl-hours"
              className="py-2"
              value={[state.profile.weeklyHours]}
              onValueChange={(v) => setProfile({ weeklyHours: v[0] ?? state.profile.weeklyHours })}
              min={2}
              max={30}
              step={1}
              aria-label="Weekly hours available for learning"
            />
          </CardContent>
        </Card>

        {/* Card 2: Progress ring / overview */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-base font-medium">Plan Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-4xl font-bold text-foreground">
                {doneCount} of {allTasks.length}
              </span>
              <span className="text-sm font-semibold text-gold-muted">{percent}% done</span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-magic h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: This week's focus */}
        <Card className="flex flex-col justify-between md:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-base font-medium">This Week's Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-display text-2xl sm:text-3xl font-bold text-foreground truncate">
              {currentWeekSkill?.name ?? "Skill Focus"}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentWeekTasks.length} sessions scheduled · ~
              {Math.round(currentWeekTasks.reduce((s, t) => s + t.minutes, 0) / 60)}h total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Do this next section */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Do this next
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Top priorities to keep your momentum going this week.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {nextTasks.map((task) => {
            const isDone = Boolean(state.planDone[task.id]);
            return (
              <Card
                key={task.id}
                className={cn(
                  "flex flex-col justify-between transition-colors",
                  isDone ? "border-success/40 bg-success/5" : "border-border bg-card",
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "rounded-full border px-3.5 py-1 text-sm font-bold uppercase tracking-wider",
                        KIND_COLOR[task.kind],
                      )}
                    >
                      {task.kind}
                    </span>
                    <Checkbox
                      id={`chk-${task.id}`}
                      checked={isDone}
                      onCheckedChange={() => {
                        toggle("planDone", task.id);
                        if (!isDone) {
                          toast("Progress saved — task completed!");
                        }
                      }}
                      className="size-6"
                      aria-label={`Mark task done: ${task.title}`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`chk-${task.id}`}
                      className={cn(
                        "block cursor-pointer font-sans text-lg font-semibold leading-snug text-foreground",
                        isDone && "line-through opacity-70",
                      )}
                    >
                      {task.title}
                    </label>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-4" aria-hidden /> {task.day} · {task.minutes} min
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 mt-4">
                  {task.url ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full min-h-[44px] text-sm font-medium"
                    >
                      <a href={task.url} target="_blank" rel="noopener noreferrer">
                        Open resource <ExternalLink className="size-4 ml-1.5" aria-hidden />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full min-h-[44px] text-sm font-medium"
                      onClick={() => toggle("planDone", task.id)}
                    >
                      {isDone ? "Mark incomplete" : "Mark as done"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Rest of this week (collapsible) */}
        {restOfWeekTasks.length > 0 && (
          <div className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowRestOfWeek((prev) => !prev)}
              className="text-base font-semibold text-gold-muted hover:text-foreground"
            >
              {showRestOfWeek ? (
                <>
                  <ChevronUp className="size-5 mr-2" /> Hide remaining tasks
                </>
              ) : (
                <>
                  <ChevronDown className="size-5 mr-2" /> Show {restOfWeekTasks.length} more tasks for this week
                </>
              )}
            </Button>

            {showRestOfWeek && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-4">
                {restOfWeekTasks.map((task) => {
                  const isDone = Boolean(state.planDone[task.id]);
                  return (
                    <Card
                      key={task.id}
                      className={cn(
                        "flex flex-col justify-between transition-colors",
                        isDone ? "border-success/40 bg-success/5" : "border-border bg-card",
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={cn(
                              "rounded-full border px-3.5 py-1 text-sm font-bold uppercase tracking-wider",
                              KIND_COLOR[task.kind],
                            )}
                          >
                            {task.kind}
                          </span>
                          <Checkbox
                            id={`chk-${task.id}`}
                            checked={isDone}
                            onCheckedChange={() => {
                              toggle("planDone", task.id);
                              if (!isDone) {
                                toast("Progress saved — task completed!");
                              }
                            }}
                            className="size-6"
                            aria-label={`Mark task done: ${task.title}`}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`chk-${task.id}`}
                            className={cn(
                              "block cursor-pointer font-sans text-lg font-semibold leading-snug text-foreground",
                              isDone && "line-through opacity-70",
                            )}
                          >
                            {task.title}
                          </label>
                          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="size-4" aria-hidden /> {task.day} · {task.minutes} min
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/40 mt-4">
                        {task.url ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full min-h-[44px] text-sm font-medium"
                          >
                            <a href={task.url} target="_blank" rel="noopener noreferrer">
                              Open resource <ExternalLink className="size-4 ml-1.5" aria-hidden />
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full min-h-[44px] text-sm font-medium"
                            onClick={() => toggle("planDone", task.id)}
                          >
                            {isDone ? "Mark incomplete" : "Mark as done"}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Later weeks section */}
      {laterWeeks.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Upcoming Weeks
          </h2>

          <div className="space-y-3">
            {laterWeeks.map((week, idx) => {
              const weekNumber = idx + 2;
              const skill = getSkill(week.focusSkill);
              const done = week.tasks.filter((t) => state.planDone[t.id]).length;
              const isExpanded = Boolean(expandedWeeks[week.id]);

              return (
                <div
                  key={week.id}
                  className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleWeekExpanded(week.id)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <span className="font-display text-lg font-bold text-foreground">
                        Week {weekNumber} · {skill?.name ?? "Skill"}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {done}/{week.tasks.length} done
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-border/40">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-3">
                        {week.tasks.map((task) => {
                          const isDone = Boolean(state.planDone[task.id]);
                          return (
                            <div
                              key={task.id}
                              className={cn(
                                "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                                isDone ? "border-success/40 bg-success/5" : "border-border bg-background",
                              )}
                            >
                              <Checkbox
                                id={`chk-${task.id}`}
                                checked={isDone}
                                onCheckedChange={() => toggle("planDone", task.id)}
                                className="size-5 mt-0.5"
                                aria-label={`Mark task done: ${task.title}`}
                              />
                              <div className="min-w-0 flex-1">
                                <label
                                  htmlFor={`chk-${task.id}`}
                                  className={cn(
                                    "block cursor-pointer text-base font-medium leading-snug text-foreground",
                                    isDone && "line-through opacity-70",
                                  )}
                                >
                                  {task.title}
                                </label>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{task.day}</span>
                                  <span>·</span>
                                  <span>{task.minutes} min</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Encouragement */}
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-gold-muted/40 bg-gold/10 p-6 sm:p-8">
        <Owl size={64} alt="" />
        <p className="min-w-52 flex-1 text-base leading-relaxed text-foreground">
          {percent === 0
            ? "Your learning schedule is set. Start with one session today — consistent small steps build demonstrable proof."
            : percent < 100
              ? `You've completed ${percent}% of your active plan. Unfinished tasks carry over automatically with zero stress.`
              : "Full plan complete! Re-brew for a fresh batch whenever you're ready for the next milestone."}
        </p>
        <DemoBadge label="Mock planner" />
      </div>
    </div>
  );
}
