import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlarmClock, CheckCircle2, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/state/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/owl-panic-room")({
  head: () => ({
    meta: [
      { title: "OWL Panic Room — Alohomora!" },
      {
        name: "description",
        content: "Last-minute exam rescue: turn remaining hours into a prioritized revision schedule.",
      },
      { property: "og:title", content: "OWL Panic Room — Alohomora!" },
      { property: "og:description", content: "Breathe. Plan. Revise what matters most first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanicRoom,
});

interface PanicInput {
  course: string;
  examAt: string;
  hours: number;
  topics: string[];
}

/** Prioritized mock schedule: hours are spread across the days before the exam,
 *  with the hardest/most important topics first. Deterministic and explainable. */
function buildPanicPlan(input: PanicInput) {
  const now = new Date();
  const exam = new Date(`${input.examAt}T00:00:00Z`).getTime();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysLeft = Math.max(0, Math.round((exam - today) / 86_400_000));
  if (!input.topics.length || daysLeft === 0 || input.hours <= 0) return null;

  // Priority = order entered (student knows best) — hours split largest-first.
  const sessionBlocks: { day: string; topic: string; minutes: number; kind: "Revise" | "Practice" | "Rapid recall" }[] = [];
  const minutesPerHour = 60;
  let remainingMinutes = input.hours * minutesPerHour;

  const dayLabels = Array.from({ length: daysLeft }, (_, i) =>
    i === daysLeft - 1 ? "Final day (light review only)" : `Day −${daysLeft - i}`,
  );

  // Spread topics across days, biggest chunks on early days.
  let t = 0;
  for (const day of dayLabels) {
    if (remainingMinutes <= 0) break;
    const budget = Math.min(remainingMinutes, Math.round((input.hours * minutesPerHour) / daysLeft));
    let left = budget;
    while (left >= 25 && t < input.topics.length) {
      const chunk = Math.min(left, t === input.topics.length - 1 ? left : Math.max(30, Math.round(budget / 2)));
      const isLastDay = day.startsWith("Final");
      sessionBlocks.push({
        day,
        topic: input.topics[t] ?? "",
        minutes: chunk,
        kind: isLastDay ? "Rapid recall" : chunk >= 60 ? "Practice" : "Revise",
      });
      left -= chunk;
      remainingMinutes -= chunk;
      t = (t + 1) % input.topics.length;
      if (t === 0 && remainingMinutes > 0) {
        // second pass = shorter rapid-recall sessions
      }
    }
    if (t === 0 && input.topics.length > 1) break;
  }

  const checklist = input.topics.flatMap((topic) => [
    `Rewrite ${topic} from memory, then check against notes`,
    `Do 3 practice problems on ${topic}`,
    `Explain ${topic} out loud in 60 seconds`,
  ]);

  const quickWins = [
    "Gather past questions / sample papers first",
    "Sleep at least 6 hours — memory consolidates while you sleep",
    "Pack calculator, admit card and pens the night before",
  ];

  return { daysLeft, sessionBlocks, checklist, quickWins };
}

function PanicRoom() {
  const { state, update, toggle } = useApp();
  const saved = state.panicPlan;
  const [course, setCourse] = useState(saved?.course ?? "");
  const [examDate, setExamDate] = useState(saved?.examAt ?? "");
  const [hours, setHours] = useState(saved?.hours ?? 6);
  const [topics, setTopics] = useState<string[]>(saved?.topics ?? ["Graph algorithms", "Dynamic programming", "Greedy proofs"]);
  const [topicDraft, setTopicDraft] = useState("");
  const [plan, setPlan] = useState<ReturnType<typeof buildPanicPlan>>(null);
  const [generatedFor, setGeneratedFor] = useState<string>("");

  function addTopic() {
    const v = topicDraft.trim();
    if (!v) return;
    if (topics.includes(v)) {
      toast.error("That topic is already on the list.");
      return;
    }
    setTopics((t) => [...t, v]);
    setTopicDraft("");
  }

  function generate() {
    if (!course.trim()) {
      toast.error("Which subject is panicking?");
      return;
    }
    if (!examDate) {
      toast.error("When is the exam? The owl needs a target.");
      return;
    }
    const input: PanicInput = { course: course.trim(), examAt: examDate, hours, topics };
    const result = buildPanicPlan(input);
    update({ panicPlan: input });
    setPlan(result);
    setGeneratedFor(examDate + course);
    if (!result) {
      toast.error("No time left or no topics — adjust the inputs and try again.");
    } else {
      toast.success("Rescue plan summoned. Breathe — you've got a map now.");
    }
  }

  const showPlan = plan ?? (saved && generatedFor === saved.examAt + saved.course ? buildPanicPlan(saved) : null);

  return (
    <div>
      <PageHeader
        title="OWL Panic Room"
        subtitle="Exam tomorrow and the book is still closed? Breathe. Tell the owl what's left and get a prioritized rescue plan in seconds."
        icon={<AlarmClock className="size-7" />}
        actions={<DemoBadge label="Mock planner" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pr-course">Subject or course</Label>
              <Input id="pr-course" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. CSE 331 — Algorithms" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pr-date">Exam date</Label>
                <Input id="pr-date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-hours">Study hours you have: {hours}h</Label>
                <input
                  id="pr-hours"
                  type="range"
                  min={1}
                  max={30}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="mt-2.5 w-full accent-[oklch(0.679_0.106_81.4)]"
                  aria-label="Total study hours available"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-topic">Topics to revise</Label>
              <div className="flex gap-2">
                <Input
                  id="pr-topic"
                  value={topicDraft}
                  onChange={(e) => setTopicDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTopic()}
                  placeholder="Most important first — order matters"
                />
                <Button onClick={addTopic} variant="outline" className="gold-frame bg-card" aria-label="Add topic">
                  <Plus className="size-4" />
                </Button>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {topics.map((t, i) => (
                  <li key={t} className="flex items-center gap-1 rounded-full border border-gold-muted/40 bg-gold/10 py-0.5 pl-2.5 pr-1 text-xs font-medium text-plum">
                    <span className="text-[10px] text-gold-muted">{i + 1}</span> {t}
                    <button onClick={() => setTopics((ts) => ts.filter((x) => x !== t))} aria-label={`Remove topic ${t}`} className="rounded-full p-0.5 hover:bg-gold/25">
                      <Trash2 className="size-3" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={generate} className="btn-sparkle glow-magic w-full font-semibold">
              <Zap className="size-4" /> Summon rescue plan
            </Button>
          </div>
        </section>

        <section>
          {showPlan ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-gold-muted/40 bg-gold/10 p-4">
                <p className="font-display text-lg font-bold text-foreground">
                  {showPlan.daysLeft} day{showPlan.daysLeft === 1 ? "" : "s"} left · {hours}h of fuel
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Highest-priority topics get the longest sessions, early. The final day is deliberately light — recall, not cramming.
                </p>
              </div>

              <ol className="space-y-2.5">
                {showPlan.sessionBlocks.map((b, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <span className="rounded-lg bg-plum px-2.5 py-1 font-display text-[11px] font-bold tracking-wide text-gold">{b.day}</span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{b.topic}</span>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      b.kind === "Practice" ? "border-success/40 bg-success/10 text-success" : b.kind === "Rapid recall" ? "border-lavender/60 bg-lavender/20 text-plum" : "border-gold-muted/40 bg-gold/15 text-gold-muted",
                    )}>
                      {b.kind}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{b.minutes} min</span>
                  </li>
                ))}
              </ol>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h2 className="font-display font-bold tracking-wide">Practice checklist</h2>
                  <ul className="mt-3 space-y-2.5">
                    {showPlan.checklist.map((c) => (
                      <li key={c} className="flex items-start gap-2.5">
                        <Checkbox
                          id={`pc-${c}`}
                          checked={Boolean(state.panicDone[c])}
                          onCheckedChange={() => toggle("panicDone", c)}
                          className="mt-0.5"
                          aria-label={`Check off: ${c}`}
                        />
                        <label htmlFor={`pc-${c}`} className={cn("cursor-pointer text-sm leading-snug text-foreground", state.panicDone[c] && "line-through opacity-60")}>
                          {c}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-success/40 bg-success/5 p-4">
                  <h2 className="flex items-center gap-1.5 font-display font-bold tracking-wide">
                    <CheckCircle2 className="size-4 text-success" /> Quick wins
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {showPlan.quickWins.map((q) => (
                      <li key={q} className="flex gap-2"><span aria-hidden>✓</span>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                This plan is a mock schedule built from what you enter — it does not replace your
                teacher's materials, syllabus notices or past questions. Use it as a triage tool.
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gold-muted/40 bg-card p-8 text-center">
              <AlarmClock className="size-10 text-gold-muted" aria-hidden />
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Enter your exam details and topics, then summon the plan. The owl will not judge the panic — it has seen worse.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
