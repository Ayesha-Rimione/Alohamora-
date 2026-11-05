import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Calculator, CheckCircle2, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/state/app-state";
import { calculateRequiredGpa } from "@/lib/cgpa";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/grades")({
  head: () => ({
    meta: [
      { title: "Accio Grades — Alohomora!" },
      {
        name: "description",
        content: "A working CGPA goal calculator: find the GPA you need next term to reach your target.",
      },
      { property: "og:title", content: "Accio Grades — Alohomora!" },
      { property: "og:description", content: "Work out the GPA you need next term." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Grades,
});

export function Grades() {
  const { state, cgpaResult, setTargetCgpa, setUpcomingCredits } = useApp();

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
  const [showFormula, setShowFormula] = useState(false);

  const calculation = useMemo(() => {
    const cur = parseFloat(current);
    const done = parseFloat(doneCredits);
    const up = parseFloat(upcomingCredits);
    const tgt = parseFloat(target);
    return calculateRequiredGpa(cur, done, up, tgt);
  }, [current, doneCredits, upcomingCredits, target]);

  function handleCalculate() {
    const up = parseFloat(upcomingCredits);
    const tgt = parseFloat(target);
    if (!Number.isNaN(up)) setUpcomingCredits(up);
    if (!Number.isNaN(tgt)) setTargetCgpa(tgt);
    toast.success("CGPA goal calculated!");
  }

  return (
    <div className="space-y-12">
      <PageHeader
        title="Accio Grades"
        subtitle="Work out the GPA you need next term."
        icon={<Calculator className="size-8" />}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        {/* Three big number inputs */}
        <Card className="p-6 sm:p-8 space-y-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              Your Target Parameters
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 space-y-6 text-base">
            <div className="space-y-2">
              <Label htmlFor="ag-current" className="text-base font-semibold text-foreground">
                Current CGPA (0.00–4.00)
              </Label>
              <Input
                id="ag-current"
                inputMode="decimal"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="min-h-[48px] text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ag-done" className="text-base font-semibold text-foreground">
                Completed credit hours
              </Label>
              <Input
                id="ag-done"
                inputMode="numeric"
                value={doneCredits}
                onChange={(e) => setDoneCredits(e.target.value)}
                className="min-h-[48px] text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ag-target" className="text-base font-semibold text-foreground">
                Target CGPA goal
              </Label>
              <Input
                id="ag-target"
                inputMode="decimal"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="min-h-[48px] text-lg font-medium"
              />
            </div>

            <div className="pt-2">
              <Button
                onClick={handleCalculate}
                className="w-full min-h-[48px] text-base font-semibold btn-sparkle"
              >
                <GraduationCap className="size-5 mr-2" /> Calculate required GPA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ONE very large result card with formula behind toggle */}
        <div className="space-y-4">
          <Card className="p-8 sm:p-10 flex flex-col justify-between border-gold-muted/50 bg-card">
            <CardHeader className="p-0 pb-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Target Projection
              </span>
              <CardTitle className="font-display text-2xl font-bold text-foreground mt-1">
                Required GPA Next Term
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              {calculation.kind === "ok" && (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-6xl font-bold text-gold-muted">
                      {calculation.requiredGpa.toFixed(2)}
                    </span>
                    <span className="text-base text-muted-foreground">
                      / 4.00 needed
                    </span>
                  </div>
                  <p className="text-lg text-foreground leading-relaxed">
                    Achieving a <strong>{calculation.requiredGpa.toFixed(2)} GPA</strong> next term will lift your cumulative standing to <strong>{target}</strong>.
                  </p>
                  <p className="text-base text-muted-foreground">
                    Highest possible CGPA with straight 4.00s: <strong>{calculation.maxPossibleCgpa.toFixed(2)}</strong>.
                  </p>
                </div>
              )}

              {calculation.kind === "impossible" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-destructive font-bold text-lg">
                    <AlertTriangle className="size-6 shrink-0" /> Mathematically Out of Reach for 1 Term
                  </div>
                  <div className="font-display text-5xl font-bold text-destructive">
                    {calculation.requiredGpa.toFixed(2)}
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Exceeds 4.00 limit. Highest achievable CGPA next term with straight 4.00s is <strong>{calculation.maxPossibleCgpa.toFixed(2)}</strong>.
                  </p>
                </div>
              )}

              {calculation.kind === "achieved" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-success font-bold text-lg">
                    <CheckCircle2 className="size-6 shrink-0" /> Goal Already Met!
                  </div>
                  <div className="font-display text-5xl font-bold text-success">
                    {current}
                  </div>
                  <p className="text-base text-foreground leading-relaxed">
                    Your current CGPA already meets or exceeds your goal of {target}.
                  </p>
                </div>
              )}

              {calculation.kind === "invalid" && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-base font-medium">
                  Please enter valid positive numbers between 0.00 and 4.00.
                </div>
              )}
            </CardContent>

            {/* Formula toggle */}
            <div className="pt-6 border-t border-border/40 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowFormula((prev) => !prev)}
                className="text-base font-semibold text-gold-muted hover:text-foreground p-0 h-auto"
              >
                {showFormula ? (
                  <>
                    <ChevronUp className="size-4 mr-1.5" /> Hide explanation
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4 mr-1.5" /> How is this calculated?
                  </>
                )}
              </Button>

              {showFormula && (
                <div className="mt-4 rounded-xl bg-muted/60 p-5 text-sm text-muted-foreground space-y-2 animate-in fade-in duration-200">
                  <p className="font-semibold text-foreground">Exact Arithmetic Formula:</p>
                  <p className="font-mono text-foreground">
                    Required GPA = (Target × Total Credits - Current × Done Credits) / Upcoming Credits
                  </p>
                  <p>
                    Where Total Credits = Done Credits + Upcoming Credits. All calculations adhere to UGC standard grading curves.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
