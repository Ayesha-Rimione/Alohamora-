import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, CheckCircle2, ChevronRight, Plus, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/state/app-state";
import { DEMO_COURSES, DEMO_NOTES, DEMO_QUESTIONS, type DemoCourse } from "@/data/academic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/spellbook")({
  head: () => ({
    meta: [
      { title: "Spellbook — Alohomora!" },
      {
        name: "description",
        content: "Your personal academic library: courses, notes, saved resources and practice quizzes.",
      },
      { property: "og:title", content: "Spellbook — Alohomora!" },
      { property: "og:description", content: "Courses, syllabus notes, and practice quizzes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Spellbook,
});

interface CourseItem extends DemoCourse {
  semester: string;
}

const INITIAL_COURSES: CourseItem[] = [
  { code: "CSE 331", title: "Algorithms", credits: 3, progress: 62, gradeGoal: "A−", semester: "Fall 2026" },
  { code: "CSE 325", title: "Database Systems", credits: 3, progress: 48, gradeGoal: "A", semester: "Fall 2026" },
  { code: "MAT 215", title: "Statistics for Engineers", credits: 3, progress: 35, gradeGoal: "B+", semester: "Fall 2026" },
  { code: "CSE 338", title: "Machine Learning", credits: 3, progress: 55, gradeGoal: "A−", semester: "Fall 2026" },
  { code: "BUS 201", title: "Business Communication", credits: 2, progress: 70, gradeGoal: "A", semester: "Fall 2026" },
];

function CourseQuiz({ courseCode }: { courseCode: string }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const relevantQuestions = DEMO_QUESTIONS.filter((q) => q.course.includes(courseCode.split(" ")[0] ?? ""));
  const questions = relevantQuestions.length > 0 ? relevantQuestions : DEMO_QUESTIONS.slice(0, 2);
  const q = questions[idx] ?? questions[0]!;

  function answer(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  }

  function nextQuestion() {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-gold-muted/40 bg-gold/10 p-6 text-center">
        <Owl size={80} alt="" />
        <p className="mt-3 font-display text-xl font-bold text-foreground">
          {score} / {questions.length} correct
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {score === questions.length ? "Great mastery on this topic!" : "Review the notes to solidify your grasp."}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 min-h-[44px] text-sm"
          onClick={() => {
            setIdx(0);
            setScore(0);
            setPicked(null);
            setFinished(false);
          }}
        >
          Retake quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {idx + 1} of {questions.length}</span>
        <span className="font-semibold text-gold-muted">{q.course}</span>
      </div>
      <p className="font-medium text-base text-foreground">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isRight = picked !== null && i === q.answer;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => answer(i)}
              disabled={picked !== null}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-colors min-h-[44px]",
                isRight
                  ? "border-success bg-success/10 text-success"
                  : isPicked
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border bg-background hover:border-gold-muted/60",
              )}
            >
              <span>{opt}</span>
              {isRight && <CheckCircle2 className="size-4 shrink-0 text-success" />}
              {isPicked && !isRight && <XCircle className="size-4 shrink-0 text-destructive" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="rounded-xl bg-muted/60 p-4 text-sm space-y-3">
          <p className="text-foreground">{q.explain}</p>
          <Button size="sm" onClick={nextQuestion} className="w-full min-h-[44px] text-sm font-semibold">
            Next question
          </Button>
        </div>
      )}
    </div>
  );
}

function Spellbook() {
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New course form
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCredits, setNewCredits] = useState("3");
  const [newSemester, setNewSemester] = useState("Fall 2026");

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) {
      toast.error("Please provide both course code and title.");
      return;
    }
    const c: CourseItem = {
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      credits: Number(newCredits) || 3,
      progress: 0,
      gradeGoal: "A",
      semester: newSemester.trim() || "Fall 2026",
    };
    setCourses((prev) => [c, ...prev]);
    setIsAddOpen(false);
    setNewCode("");
    setNewTitle("");
    toast.success(`Course ${c.code} added to your Spellbook!`);
  };

  const courseNotes = selectedCourse
    ? DEMO_NOTES.filter((n) => n.course.includes(selectedCourse.code.split(" ")[0] ?? ""))
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Spellbook"
        subtitle="Your courses and syllabus library."
        icon={<BookOpen className="size-8" />}
        actions={
          <Button
            onClick={() => setIsAddOpen(true)}
            className="min-h-[48px] px-6 text-base font-semibold"
          >
            <Plus className="size-5 mr-2" /> Add course
          </Button>
        }
      />

      {/* Courses as a grid of large cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card
            key={course.code}
            onClick={() => setSelectedCourse(course)}
            className="cursor-pointer transition-all hover:border-gold-muted/70 hover:shadow-md flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-bold text-gold-muted">
                  {course.code}
                </span>
                <span className="rounded-full border border-border bg-muted/60 px-3 py-1 text-sm font-medium text-foreground">
                  {course.semester}
                </span>
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                {course.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-base text-muted-foreground">
                <span>{course.credits} Credits</span>
                <span>{course.progress}% covered</span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={course.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-magic h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </CardContent>

            <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between text-sm font-semibold text-gold-muted">
              <span>View syllabus, notes & quiz</span>
              <ChevronRight className="size-4" />
            </div>
          </Card>
        ))}
      </div>

      {/* Course Detail Drawer (Syllabus, Notes, Quiz) */}
      <Sheet open={Boolean(selectedCourse)} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto space-y-6 p-6 sm:p-8">
          {selectedCourse && (
            <>
              <SheetHeader className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-bold uppercase tracking-wider text-gold-muted">
                    {selectedCourse.semester}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedCourse.credits} Credits · Goal: {selectedCourse.gradeGoal}
                  </span>
                </div>
                <SheetTitle className="font-display text-2xl font-bold text-foreground">
                  {selectedCourse.code}: {selectedCourse.title}
                </SheetTitle>
                <SheetDescription className="text-base text-muted-foreground">
                  Syllabus coverage: {selectedCourse.progress}%
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="syllabus" className="w-full space-y-4">
                <TabsList className="grid grid-cols-3 min-h-[48px] p-1 bg-muted/60">
                  <TabsTrigger value="syllabus" className="text-base font-semibold min-h-[40px]">Syllabus</TabsTrigger>
                  <TabsTrigger value="notes" className="text-base font-semibold min-h-[40px]">Notes</TabsTrigger>
                  <TabsTrigger value="quiz" className="text-base font-semibold min-h-[40px]">Quiz</TabsTrigger>
                </TabsList>

                {/* Syllabus Tab */}
                <TabsContent value="syllabus" className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <h4 className="font-bold text-base text-foreground">Core Modules</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        <span>Module 1: Foundations and core principles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        <span>Module 2: Practical applications and assignments</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="size-4 rounded-full border border-muted-foreground shrink-0" />
                        <span>Module 3: Advanced paradigms & final term project</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-gold-muted/40 bg-gold/10 p-5 text-sm text-foreground space-y-1">
                    <p className="font-semibold text-gold-muted">Study Tip</p>
                    <p>Review current lecture summaries and complete self-quizzes regularly.</p>
                  </div>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-4">
                  {courseNotes.length > 0 ? (
                    <div className="space-y-3">
                      {courseNotes.map((note) => (
                        <div key={note.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                          <h5 className="font-semibold text-base text-foreground">{note.title}</h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">{note.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-2">
                      <p className="text-base font-medium text-foreground">No notes recorded yet</p>
                      <p className="text-sm text-muted-foreground">
                        Syllabus note-taking will be synchronized with your university portal.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Quiz Tab */}
                <TabsContent value="quiz" className="space-y-4">
                  <CourseQuiz courseCode={selectedCourse.code} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Big Add Course Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md p-6 sm:p-8">
          <form onSubmit={handleAddCourse} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold text-foreground">
                Add Course
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Add an academic course to track syllabus progress and quizzes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-base">
              <div className="space-y-1.5">
                <Label htmlFor="c-code">Course Code</Label>
                <Input
                  id="c-code"
                  placeholder="e.g. CSE 420"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="min-h-[48px] text-base"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-title">Course Title</Label>
                <Input
                  id="c-title"
                  placeholder="e.g. Compiler Design"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="min-h-[48px] text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-credits">Credits</Label>
                  <Input
                    id="c-credits"
                    type="number"
                    min="1"
                    max="6"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    className="min-h-[48px] text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-sem">Semester</Label>
                  <Input
                    id="c-sem"
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="min-h-[48px] text-base"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="min-h-[48px] text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-h-[48px] text-base font-semibold px-6"
              >
                Add course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
