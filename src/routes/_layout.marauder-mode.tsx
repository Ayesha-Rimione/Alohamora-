import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, Flame, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useApp } from "@/state/app-state";
import { DEMO_COURSES, DEMO_DEADLINES, type DemoDeadline } from "@/data/academic";
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
      { property: "og:description", content: "Semester deadlines and academic schedule." },
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

function MarauderMode() {
  const [extra, setExtra] = useState<DemoDeadline[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(DEMO_COURSES[0]!.code);
  const [due, setDue] = useState("");
  const [kind, setKind] = useState<DemoDeadline["kind"]>("assignment");

  const deadlines = useMemo(() => {
    return [...DEMO_DEADLINES, ...extra].sort((a, b) => a.due.localeCompare(b.due));
  }, [extra]);

  function handleAddDeadline(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for the deadline.");
      return;
    }
    if (!due) {
      toast.error("Please choose a due date.");
      return;
    }
    const newDl: DemoDeadline = {
      id: `custom-${Date.now()}`,
      course,
      title: title.trim(),
      kind,
      due,
      weight: "10%",
    };
    setExtra((prev) => [...prev, newDl]);
    setIsAddOpen(false);
    setTitle("");
    setDue("");
    toast.success("Deadline added to your schedule!");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Marauder Mode"
        subtitle="Your semester timeline and key academic deadlines."
        icon={<CalendarDays className="size-8" />}
        actions={
          <Button
            onClick={() => setIsAddOpen(true)}
            className="min-h-[48px] px-6 text-base font-semibold"
          >
            <Plus className="size-5 mr-2" /> Add deadline
          </Button>
        }
      />

      {/* Large deadline rows */}
      <div className="space-y-4">
        {deadlines.map((d) => {
          const days = daysUntil(d.due);
          const isPassed = days < 0;
          const isUrgent = !isPassed && days <= 5;

          const formattedDate = new Date(`${d.due}T00:00:00Z`).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          });

          return (
            <Card
              key={d.id}
              className={cn(
                "p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                isUrgent ? "border-destructive/40 bg-destructive/5" : "border-border bg-card",
              )}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-gold-muted">
                    {d.course}
                  </span>
                  <span className="rounded-full border border-border bg-muted/60 px-3 py-0.5 text-sm font-medium capitalize text-muted-foreground">
                    {d.kind}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-sans text-foreground truncate">
                  {d.title}
                </h3>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <span className="text-base text-muted-foreground font-medium">
                  {formattedDate}
                </span>
                <span
                  className={cn(
                    "rounded-full px-3.5 py-1 text-sm font-bold uppercase tracking-wider",
                    isPassed
                      ? "bg-muted text-muted-foreground"
                      : isUrgent
                        ? "bg-destructive/15 text-destructive border border-destructive/30"
                        : "bg-success/15 text-success border border-success/30",
                  )}
                >
                  {isPassed ? "Passed" : days === 0 ? "Due today" : `${days}d left`}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Deadline Drawer */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto space-y-6 p-6 sm:p-8">
          <form onSubmit={handleAddDeadline} className="space-y-6">
            <SheetHeader className="text-left space-y-2">
              <SheetTitle className="font-display text-2xl font-bold text-foreground">
                Add Deadline
              </SheetTitle>
              <SheetDescription className="text-base text-muted-foreground">
                Pin a new assignment, exam or project submission.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 text-base">
              <div className="space-y-2">
                <Label htmlFor="mm-title">Deadline Title</Label>
                <Input
                  id="mm-title"
                  placeholder="e.g. Lab Report 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="min-h-[48px] text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-course">Course</Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="mm-course" className="min-h-[48px] text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_COURSES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-kind">Type</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
                  <SelectTrigger id="mm-kind" className="min-h-[48px] text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-due">Due Date</Label>
                <Input
                  id="mm-due"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="min-h-[48px] text-base"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full min-h-[48px] text-base font-semibold">
                Pin deadline
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
