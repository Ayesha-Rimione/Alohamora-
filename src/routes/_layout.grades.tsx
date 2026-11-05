import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Calculator, CheckCircle2, GraduationCap, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/state/app-state";
import { calculateRequiredGpa, calculateCGPA, GRADE_OPTIONS, type CourseRecord } from "@/lib/cgpa";

export const Route = createFileRoute("/_layout/grades")({
  head: () => ({
    meta: [
      { title: "Accio Grades — Alohomora!" },
      {
        name: "description",
        content: "A working CGPA goal calculator: find the GPA you need next term to reach your target.",
      },
      { property: "og:title", content: "Accio Grades — Alohomora!" },
      { property: "og:description", content: "Work out the GPA you need next term — with honest math." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Grades,
});

export function Grades() {
  const { state, cgpaResult, addCourse, removeCourse, setTargetCgpa, setUpcomingCredits } = useApp();

  const [current, setCurrent] = useState(
    cgpaResult.totalCredits > 0 ? cgpaResult.cgpa.toFixed(2) : "3.42",
  );
  const [doneCredits, setDoneCredits] = useState(
    cgpaResult.totalCredits > 0 ? String(cgpaResult.totalCredits) : "45",
  );
  const [upcomingCredits, setUpcomingCreditsInput] = useState(
    String(state.upcomingCredits || 15),
  );
  const [target, setTarget] = useState(
    String(state.targetCgpa || "3.65"),
  );
  const [submitted, setSubmitted] = useState(true);

  // New course quick adder state
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(3);
  const [newGrade, setNewGrade] = useState("A");

  // Sync inputs from store button
  function syncFromAcademicRecord() {
    if (cgpaResult.totalCredits > 0) {
      setCurrent(cgpaResult.cgpa.toFixed(2));
      setDoneCredits(String(cgpaResult.totalCredits));
      toast.success("Loaded current numbers from your academic record!");
    } else {
      toast.info("Add completed courses below to automatically populate your baseline.");
    }
  }

  // Reusable deterministic calculation via src/lib/cgpa.ts
  const calculation = useMemo(() => {
    const cur = parseFloat(current);
    const done = parseFloat(doneCredits);
    const up = parseFloat(upcomingCredits);
    const tgt = parseFloat(target);
    return calculateRequiredGpa(cur, done, up, tgt);
  }, [current, doneCredits, upcomingCredits, target]);

  function handleCalculate() {
    setSubmitted(true);
    const up = parseFloat(upcomingCredits);
    const tgt = parseFloat(target);
    if (!Number.isNaN(up)) setUpcomingCredits(up);
    if (!Number.isNaN(tgt)) setTargetCgpa(tgt);
  }

  function handleSaveCourse() {
    if (!newCode.trim() || !newName.trim()) {
      toast.error("Please provide both course code and title.");
      return;
    }
    addCourse({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      credits: Number(newCredits) || 3,
      grade: newGrade,
      semester: state.profile.semester || "Current Term",
      confidence: 4,
    });
    setNewCode("");
    setNewName("");
    setIsAddingCourse(false);
    toast.success(`Course ${newCode.toUpperCase()} added to academic record.`);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accio Grades"
        subtitle="A weighted-average CGPA goal calculator — exact arithmetic with your real course records."
        icon={<Calculator className="size-7" />}
        actions={<DemoBadge label="Deterministic UGC scale" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left: Input parameters */}
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-wide text-foreground">Your Target Plan</h2>
            <button
              onClick={syncFromAcademicRecord}
              className="text-xs text-gold-muted hover:underline font-semibold"
            >
              Use My Courses
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ag-current" className="text-foreground font-semibold">Current CGPA (0.00–4.00)</Label>
              <Input
                id="ag-current"
                inputMode="decimal"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ag-done" className="text-foreground font-semibold">Completed credit hours</Label>
              <Input
                id="ag-done"
                inputMode="numeric"
                value={doneCredits}
                onChange={(e) => setDoneCredits(e.target.value)}
                className="bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ag-up" className="text-foreground font-semibold">Upcoming credit hours (next term)</Label>
              <Input
                id="ag-up"
                inputMode="numeric"
                value={upcomingCredits}
                onChange={(e) => setUpcomingCreditsInput(e.target.value)}
                className="bg-card text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ag-target" className="text-foreground font-semibold">Target CGPA</Label>
              <Input
                id="ag-target"
                inputMode="decimal"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-card text-foreground"
              />
            </div>

            <Button onClick={handleCalculate} className="btn-sparkle glow-magic w-full font-semibold">
              <GraduationCap className="size-4" /> Summon my required GPA
            </Button>

            <p className="text-[11px] text-muted-foreground leading-normal">
              Formula: (Target × Total Credits - Current × Completed Credits) / Upcoming Credits.
            </p>
          </div>
        </section>

        {/* Right: Detailed Outcome & Course List */}
        <div className="space-y-6">
          <section className="space-y-4">
            {calculation.kind === "ok" && (
              <div className="rounded-3xl border border-gold-muted/40 bg-card p-6 shadow-xs">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Result</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {calculation.requiredGpa.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">GPA required across {upcomingCredits} upcoming credits</span>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  Achieving a <strong>{calculation.requiredGpa.toFixed(2)} GPA</strong> next term across {upcomingCredits} credits will lift your CGPA from {current} to your target of {target}.
                </p>
                <div className="mt-4 rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
                  Highest possible CGPA with straight 4.00s: <strong>{calculation.maxPossibleCgpa.toFixed(2)}</strong> across {calculation.totalCredits} total credits.
                </div>
              </div>
            )}

            {calculation.kind === "impossible" && (
              <div role="alert" className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-bold">
                  <AlertTriangle className="size-5" /> Target Mathematically Out of Reach for Next Term
                </div>
                <p className="text-sm text-muted-foreground">
                  Reaching {target} in one term would require a GPA of <strong>{calculation.requiredGpa.toFixed(2)}</strong>, which exceeds the maximum achievable GPA (4.00).
                </p>
                <p className="text-xs text-foreground font-medium">
                  The maximum achievable CGPA next term (with straight 4.00s) is <strong>{calculation.maxPossibleCgpa.toFixed(2)}</strong>. Consider pacing your goal across two terms.
                </p>
              </div>
            )}

            {calculation.kind === "achieved" && (
              <div className="rounded-3xl border border-emerald-600/40 bg-emerald-500/10 p-6 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="size-5" /> Target Already Achieved!
                </div>
                <p className="text-sm text-foreground">
                  Your current CGPA ({current}) is already equal to or higher than your target ({target}). Simply maintain passing grades next term.
                </p>
              </div>
            )}

            {calculation.kind === "invalid" && (
              <div role="alert" className="rounded-3xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive font-medium">
                Please enter valid positive numbers between 0.00 and 4.00.
              </div>
            )}
          </section>

          {/* Academic Courses Record Table */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">Your Course Record</h3>
                <p className="text-xs text-muted-foreground">These courses feed your baseline and student profile.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsAddingCourse(true)} className="text-xs font-semibold">
                <Plus className="size-3.5 mr-1" /> Add Course
              </Button>
            </div>

            {isAddingCourse && (
              <div className="rounded-xl border border-gold-muted/40 bg-background p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground">New Course Details</h4>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">Course Code</Label>
                    <Input
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="e.g. CSE 441"
                      className="h-8 text-xs bg-card text-foreground"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-[11px] font-semibold text-foreground">Course Title</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Machine Learning Systems"
                      className="h-8 text-xs bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">Grade</Label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-card px-2 text-xs text-foreground"
                    >
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g.letter} value={g.letter}>
                          {g.letter} ({g.points.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingCourse(false)} className="h-7 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveCourse} className="h-7 text-xs font-semibold btn-sparkle">
                    Save Course
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {state.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs transition-colors hover:border-gold-muted/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-foreground">{course.code}</span>
                    <span className="text-muted-foreground truncate max-w-xs">{course.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      Grade: {course.grade}
                    </span>
                    <span className="text-[11px] text-fairy hidden sm:inline">{course.credits} credits</span>
                  </div>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                    aria-label={`Remove ${course.code}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
