import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, Flame, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/state/app-state";
import { DEMO_COURSES, DEMO_DEADLINES, type DemoDeadline } from "@/data/academic";
import { generatePlan } from "@/data/plan";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/marauder-mode")({
  head: () => ({
    meta: [
      { title: "Marauder Mode — Alohomora!" },
      {
        name: "description",
        content: "Your semester dashboard: courses, deadlines, exams and career-learning tasks in one timeline.",
      },
      { property: "og:title", content: "Marauder Mode — Alohomora!" },
      { property: "og:description", content: "Semester deadlines and career quests on one map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarauderMode,
});

function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86_400_000);
}

const KIND_ICON: Record<DemoDeadline["kind"], string> = {
  assignment: "📘",
  exam: "📝",
  quiz: "⚡",
  lab: "🧪",
};

function MarauderMode() {
  const { state } = useApp();
  const [extra, setExtra] = useState<DemoDeadline[]>([]);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(DEMO_COURSES[0]!.code);
  const [due, setDue] = useState("");

  const plan = useMemo(
    () => generatePlan(state.profile.targetRole, state.skills, state.profile.weeklyHours),
    [state.profile.targetRole, state.skills, state.profile.weeklyHours],
  );
  const careerTasks = plan.flatMap((w) => w.tasks).filter((t) => !state.planDone[t.id]).slice(0, 3);

  const deadlines = [...DEMO_DEADLINES, ...extra].sort((a, b) => a.due.localeCompare(b.due));
  const priorities = deadlines.filter((d) => daysUntil(d.due) >= 0).slice(0, 3);

  function addDeadline() {
    if (!title.trim()) {
      toast.error("Give the deadline a name first.");
      return;
    }
    if (!due) {
      toast.error("Pick a due date.");
      return;
    }
    setExtra((e) => [...e, { id: `custom-${e.length}`, course, title: title.trim(), kind: "assignment", due, weight: "—" }]);
    toast.success("Deadline pinned to the map.");
    setTitle("");
    setDue("");
  }

  return (
    <div>
      <PageHeader
        title="Marauder Mode"
        subtitle="Your semester on one map — university deadlines and career-learning quests side by side, so neither ambushes the other."
        icon={<CalendarDays className="size-7" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* Courses */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold tracking-wide">Courses this semester</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {DEMO_COURSES.map((c) => (
                <li key={c.code} className="card-magic rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{c.code} — {c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.credits} credits · goal {c.gradeGoal}</p>
                    </div>
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-gold-muted">{c.progress}%</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={c.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.code} syllabus progress`}>
                    <div className="progress-magic h-full rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2">
              <DemoBadge />
              <p className="text-[11px] text-muted-foreground">Demo courses and progress — connect your real routine later.</p>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold tracking-wide">Deadline timeline</h2>
            <ol className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-gold-muted/40">
              {deadlines.map((d) => {
                const days = daysUntil(d.due);
                const overdue = days < 0;
                return (
                  <li key={d.id} className="relative flex items-center gap-4 rounded-xl border border-border bg-card p-3.5">
                    <span className="z-10 size-4 shrink-0 rounded-full border-2 border-gold-muted bg-cream" aria-hidden />
                    <span className="text-xl" aria-hidden>{KIND_ICON[d.kind]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.course} · {d.kind} · {d.weight}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-foreground">
                        {new Date(`${d.due}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}
                      </p>
                      <span className={cn("text-[11px] font-semibold", overdue ? "text-muted-foreground" : days <= 7 ? "text-destructive" : "text-success")}>
                        {overdue ? "passed" : days === 0 ? "today!" : `in ${days} day${days === 1 ? "" : "s"}`}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Add deadline */}
          <section className="rounded-2xl border border-dashed border-gold-muted/50 bg-card p-4">
            <h2 className="flex items-center gap-2 font-display font-bold tracking-wide"><CalendarPlus className="size-4 text-gold-muted" /> Pin your own deadline</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_150px_auto]">
              <div className="space-y-1">
                <Label htmlFor="mm-title">Task</Label>
                <Input id="mm-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lab report 3" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mm-course">Course</Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="mm-course" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEMO_COURSES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="mm-due">Due date</Label>
                <Input id="mm-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
              <Button onClick={addDeadline} className="btn-sparkle mt-auto font-semibold">Add</Button>
            </div>
          </section>
        </div>

        {/* Priorities rail */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <h2 className="flex items-center gap-2 font-display font-bold tracking-wide"><Flame className="size-4 text-destructive" /> Study priorities now</h2>
            <ul className="mt-3 space-y-2.5">
              {priorities.map((d, i) => (
                <li key={d.id} className="flex gap-2.5 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-[11px] font-bold text-destructive">{i + 1}</span>
                  <span>
                    <span className="font-medium text-foreground">{d.title}</span>
                    <span className="block text-xs text-muted-foreground">{d.course} · in {daysUntil(d.due)} day{daysUntil(d.due) === 1 ? "" : "s"} · {d.weight}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-gold-muted/40 bg-gold/10 p-4">
            <h2 className="flex items-center gap-2 font-display font-bold tracking-wide"><ListChecks className="size-4 text-gold-muted" /> Career quests beside class</h2>
            {careerTasks.length ? (
              <ul className="mt-3 space-y-2.5">
                {careerTasks.map((t) => (
                  <li key={t.id} className="text-sm">
                    <p className="font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.day} · ~{t.minutes} min · Potion Lab</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">All current quests done — brew a new plan in the Potion Lab.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
