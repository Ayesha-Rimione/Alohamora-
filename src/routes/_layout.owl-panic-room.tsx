import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlarmClock, CheckCircle2, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
      { property: "og:description", content: "Prioritized revision plan in 3 steps." },
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

function buildPanicPlan(input: PanicInput) {
  if (!input.topics.length || input.hours <= 0) return null;

  const checklist = input.topics.flatMap((topic) => [
    `Rewrite ${topic} core formulas from memory`,
    `Solve 2 representative problems on ${topic}`,
    `Explain ${topic} aloud in 60 seconds`,
  ]);

  return { checklist };
}

function PanicRoom() {
  const { state, update, toggle } = useApp();
  const saved = state.panicPlan;
  const [course, setCourse] = useState(saved?.course ?? "CSE 331 — Algorithms");
  const [hours, setHours] = useState(saved?.hours ?? 8);
  const [plan, setPlan] = useState<ReturnType<typeof buildPanicPlan>>(
    buildPanicPlan({
      course: saved?.course ?? "CSE 331 — Algorithms",
      examAt: "",
      hours: saved?.hours ?? 8,
      topics: ["Graph algorithms", "Dynamic programming", "Greedy proofs"],
    }),
  );

  function generatePlan() {
    if (!course.trim()) {
      toast.error("Please enter a course name.");
      return;
    }
    const topics = ["Core Foundations & Theory", "Problem Sets & Proofs", "Past Exam Patterns"];
    const input: PanicInput = { course: course.trim(), examAt: "2026-11-20", hours, topics };
    const result = buildPanicPlan(input);
    update({ panicPlan: input });
    setPlan(result);
    toast.success("Rescue checklist summoned!");
  }

  return (
    <div className="space-y-12">
      <PageHeader
        title="OWL Panic Room"
        subtitle="Turn remaining hours into a prioritized revision checklist."
        icon={<AlarmClock className="size-8" />}
      />

      {/* 3-step layout (pick course, set time, get plan) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Step 1: Pick course */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="space-y-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-gold-muted">
              Step 1
            </span>
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              Pick Course
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pr-course" className="text-base font-semibold text-foreground">
                Target subject
              </Label>
              <Input
                id="pr-course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CSE 331 — Algorithms"
                className="min-h-[48px] text-base"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Choose the course that requires urgent triage.
            </p>
          </CardContent>
        </Card>

        {/* Step 2: Set time */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="space-y-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-gold-muted">
              Step 2
            </span>
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              Set Study Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-4xl font-bold text-gold-muted">{hours}h</span>
              <span className="text-base text-muted-foreground">Hours of fuel</span>
            </div>
            <Slider
              id="pr-hours"
              className="py-2"
              value={[hours]}
              onValueChange={(v) => setHours(v[0] ?? hours)}
              min={2}
              max={24}
              step={1}
              aria-label="Available study hours"
            />
            <p className="text-sm text-muted-foreground">
              Set your total available focus budget.
            </p>
          </CardContent>
        </Card>

        {/* Step 3: Get plan (ONE primary button) */}
        <Card className="flex flex-col justify-between border-gold-muted/50 bg-gold/10">
          <CardHeader className="space-y-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-gold-muted">
              Step 3
            </span>
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              Summon Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-foreground leading-relaxed">
              Generate a high-yield checklist structured around your remaining time budget.
            </p>
            <Button
              onClick={generatePlan}
              className="w-full min-h-[48px] text-base font-semibold btn-sparkle glow-magic"
            >
              <Zap className="size-5 mr-2" /> Generate rescue plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result shown as a short checklist */}
      {plan && (
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Your Emergency Revision Checklist
            </h2>
            <p className="text-base text-muted-foreground mt-1">
              Work down this list sequentially. Check items off as completed.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <ul className="divide-y divide-border/50">
              {plan.checklist.map((item, idx) => {
                const isDone = Boolean(state.panicDone[item]);
                return (
                  <li key={item} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <Checkbox
                      id={`chk-panic-${idx}`}
                      checked={isDone}
                      onCheckedChange={() => toggle("panicDone", item)}
                      className="size-6 mt-0.5"
                    />
                    <label
                      htmlFor={`chk-panic-${idx}`}
                      className={cn(
                        "cursor-pointer text-base sm:text-lg font-medium leading-snug text-foreground flex-1",
                        isDone && "line-through opacity-60",
                      )}
                    >
                      {item}
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
