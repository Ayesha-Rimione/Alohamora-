import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, CheckCircle2, Plus, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/state/app-state";
import { DEMO_NOTES, DEMO_QUESTIONS, DEMO_BADGES } from "@/data/academic";
import { RESOURCES } from "@/data/resources";
import { getSkill } from "@/data/skills";
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
      { property: "og:description", content: "Notes, saved resources and quizzes in one personal library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Spellbook,
});

interface Note {
  id: string;
  course: string;
  title: string;
  body: string;
}

function Quiz() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = DEMO_QUESTIONS[idx]!;

  function answer(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  }

  function nextQuestion() {
    if (idx + 1 >= DEMO_QUESTIONS.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-gold-muted/40 bg-gold/10 p-8 text-center">
        <Owl size={110} alt="" />
        <p className="mt-3 font-display text-2xl font-bold text-foreground">
          {score} / {DEMO_QUESTIONS.length} correct
        </p>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {score === DEMO_QUESTIONS.length
            ? "A perfect score — the Keykeeper tips its tiny crooked spectacles at you."
            : score >= 2
              ? "Solid work. Review the explanations and the next quiz will feel easy."
              : "Every wrong answer is a map to what to revise. That's the whole trick."}
        </p>
        <Button
          variant="outline"
          className="gold-frame mt-4 bg-card font-semibold"
          onClick={() => {
            setIdx(0);
            setScore(0);
            setPicked(null);
            setFinished(false);
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Question {idx + 1} of {DEMO_QUESTIONS.length} · {q.course}
      </p>
      <p className="mt-2 font-semibold text-foreground">{q.question}</p>
      <ul className="mt-4 space-y-2">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isRight = picked !== null && i === q.answer;
          return (
            <li key={opt}>
              <button
                onClick={() => answer(i)}
                disabled={picked !== null}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                  isRight
                    ? "border-success bg-success/10 text-success"
                    : isPicked
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border bg-background hover:border-gold-muted/60",
                )}
                aria-label={`Answer option: ${opt}`}
              >
                {opt}
                {isRight && <CheckCircle2 className="size-4" aria-hidden />}
                {isPicked && !isRight && <XCircle className="size-4" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null && (
        <div className="mt-4 rounded-xl bg-muted p-3 text-sm">
          <p className="text-foreground">{q.explain}</p>
          <Button size="sm" onClick={nextQuestion} className="btn-sparkle mt-3 font-semibold">
            Next question
          </Button>
        </div>
      )}
    </div>
  );
}

function Spellbook() {
  const { state } = useApp();
  const [notes, setNotes] = useState<Note[]>(DEMO_NOTES.map((n) => ({ id: n.id, course: n.course, title: n.title, body: n.excerpt })));
  const [ntTitle, setNtTitle] = useState("");
  const [ntCourse, setNtCourse] = useState("");
  const [ntBody, setNtBody] = useState("");

  const bookmarked = RESOURCES.filter((r) => state.bookmarks.includes(r.id));
  const earned = DEMO_BADGES.filter((b) => b.earned);

  function addNote() {
    if (!ntTitle.trim() || !ntBody.trim()) {
      toast.error("A note needs at least a title and a body.");
      return;
    }
    setNotes((n) => [
      { id: `own-${n.length}`, course: ntCourse.trim() || "General", title: ntTitle.trim(), body: ntBody.trim() },
      ...n,
    ]);
    toast.success("Note inscribed into your Spellbook.");
    setNtTitle("");
    setNtCourse("");
    setNtBody("");
  }

  return (
    <div>
      <PageHeader
        title="Spellbook"
        subtitle="Your personal academic library — courses, syllabi notes, saved resources and practice quizzes. Built ready for real file uploads later."
        icon={<BookOpen className="size-7" />}
        actions={<DemoBadge label="Demo content" />}
      />

      <Tabs defaultValue="notes">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="resources">Saved resources ({bookmarked.length})</TabsTrigger>
          <TabsTrigger value="quiz">Practice quizzes</TabsTrigger>
          <TabsTrigger value="badges">Achievements ({earned.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-4 space-y-4">
          <section className="rounded-2xl border border-dashed border-gold-muted/50 bg-card p-4">
            <h2 className="font-display font-bold tracking-wide">Inscribe a new note</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
              <div className="space-y-1">
                <Label htmlFor="sb-course">Course</Label>
                <Input id="sb-course" value={ntCourse} onChange={(e) => setNtCourse(e.target.value)} placeholder="CSE 331" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sb-title">Title</Label>
                <Input id="sb-title" value={ntTitle} onChange={(e) => setNtTitle(e.target.value)} placeholder="e.g. Graph traversal cheat-sheet" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Label htmlFor="sb-body">Note</Label>
              <textarea
                id="sb-body"
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={ntBody}
                onChange={(e) => setNtBody(e.target.value)}
                placeholder="Write it in your own words — that's the spell that makes it stick."
              />
            </div>
            <Button onClick={addNote} className="btn-sparkle mt-3 font-semibold">
              <Plus className="size-4" /> Add note
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">Notes live in this session of the prototype — backend storage comes later.</p>
          </section>

          <ul className="grid gap-3 sm:grid-cols-2">
            {notes.map((n) => (
              <li key={n.id} className="card-magic rounded-2xl border border-border bg-card p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold-muted">{n.course}</p>
                <p className="mt-0.5 font-semibold text-foreground">{n.title}</p>
                <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-muted-foreground">{n.body}</p>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          {bookmarked.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarked.map((r) => (
                <li key={r.id} className="card-magic rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-muted">{getSkill(r.skillId)?.name}</p>
                  <p className="mt-0.5 font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.provider} · {r.price}</p>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-gold-muted hover:underline">
                    Open ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-gold-muted/40 bg-card p-8 text-center">
              <Owl size={80} alt="" />
              <p className="mt-3 text-sm text-muted-foreground">Your shelf is empty. Bookmark resources in the Restricted Section and they appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <Quiz />
          <p className="mt-3 text-xs text-muted-foreground">Demo questions based on common course topics — real course quizzes connect to your syllabus later.</p>
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_BADGES.map((b) => (
              <li key={b.id} className={cn("rounded-2xl border p-4 text-center", b.earned ? "border-gold-muted/50 bg-gold/10" : "border-dashed border-border bg-muted/40 opacity-70")}>
                <Sparkles className={cn("mx-auto size-6", b.earned ? "text-gold-muted" : "text-muted-foreground")} aria-hidden />
                <p className="mt-2 font-display font-semibold text-foreground">{b.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
                <p className={cn("mt-2 text-[10px] font-bold uppercase tracking-wider", b.earned ? "text-success" : "text-muted-foreground")}>
                  {b.earned ? "Earned ✓" : "Locked"}
                </p>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
