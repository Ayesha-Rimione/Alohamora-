import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/state/app-state";
import { computeCoverage, getCareer, getSkill } from "@/data/skills";
import { api, USE_MOCK_API, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_layout/professor")({
  head: () => ({
    meta: [
      { title: "Professor Who? — Alohomora!" },
      {
        name: "description",
        content: "A demo AI study and career companion: plan projects, understand skill gaps, prep for interviews.",
      },
      { property: "og:title", content: "Professor Who? — Alohomora!" },
      { property: "og:description", content: "Your study and career companion (demo responses)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Professor,
});

interface Msg {
  id: number;
  from: "owl" | "you";
  text: string;
  sources?: string[];
}

const CHIPS = [
  "What should I learn next?",
  "Explain this skill gap.",
  "Help me plan a portfolio project.",
  "Prepare me for a junior developer interview.",
  "Help me revise for tomorrow's exam.",
];

// ─── Demo fallback (VITE_USE_MOCK_API=true) ─────────────────────────────────
function useDemoAnswer() {
  const { state } = useApp();
  const role = getCareer(state.profile.targetRole) ?? getCareer("aiml")!;
  const coverage = computeCoverage(state.profile.targetRole, state.skills);
  const nextMissing = coverage.areas.find((a) => a.status === "missing")?.skill;
  const nextDeveloping = coverage.areas.find((a) => a.status === "developing")?.skill;

  return (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes("next") && (q.includes("learn") || q.includes("should"))) {
      const target = nextMissing ?? nextDeveloping;
      return target
        ? `Looking at your map for ${role.title}, the highest-value next step is ${target.name}. Start with: ${target.quest}`
        : `Your map shows every required skill demonstrated. Shift focus to depth: a second, more ambitious end-to-end project for ${role.title}.`;
    }
    if (q.includes("gap") || q.includes("explain")) {
      const missing = coverage.areas.filter((a) => a.status === "missing").map((a) => a.skill.name);
      return `Here's your gap: you demonstrate ${coverage.demonstrated} of ${coverage.areas.length} core areas for ${role.title}. Missing: ${missing.join(", ") || "none"}. Pick one, build one small proof.`;
    }
    if (q.includes("portfolio") || q.includes("project")) {
      return `A great portfolio project needs: (1) a real problem; (2) a deployed link; (3) a README explaining choices; (4) an honest retrospective. For ${role.title}, use ${nextMissing?.name ?? "your strongest skill"} end-to-end.`;
    }
    if (q.includes("interview")) {
      return `For a junior interview: (1) your project story — problem, approach, trade-offs; (2) fundamentals — explain ${nextDeveloping?.name ?? "your core skill"} simply; (3) honest unknowns score better than bluffing.`;
    }
    if (q.includes("revise") || q.includes("exam")) {
      return `Last-minute revision: triage topics by marks weight first, then revise actively — rewrite from memory, then check. Use the OWL Panic Room to turn remaining hours into a schedule.`;
    }
    return `Good question. (Demo mode — connect a Groq API key to enable live AI.) Try one of the suggested prompts to see example responses.`;
  };
}

// ─── Main component ──────────────────────────────────────────────────────────
function Professor() {
  const { state } = useApp();
  const demoAnswer = useDemoAnswer();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      from: "owl",
      text: USE_MOCK_API
        ? `Hoot! I'm Professor Who? — ${state.profile.name || "student"}'s study companion. (Demo responses — no live AI connected yet.)`
        : `Hoot! I'm Professor Who? — your Alohomora! tutor powered by Groq AI. Ask me about your coursework, skill gaps, project ideas, or interview prep. ✦`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), from: "you", text: q }]);
    setThinking(true);

    if (USE_MOCK_API) {
      // Demo path: simulate a delay then return local answer
      await new Promise((r) => setTimeout(r, 900));
      setMessages((m) => [...m, { id: Date.now() + 1, from: "owl", text: demoAnswer(q) }]);
      setThinking(false);
      return;
    }

    // Real API path
    try {
      const result = await api.chat.sendMessage(q, {
        course: state.profile.targetRole,
        role: state.profile.targetRole,
      });
      // Capture sessionId so subsequent messages continue the same session
      const anyResult = result as { reply: string; sessionId?: string; sources?: string[] };
      if (anyResult.sessionId && !sessionId) {
        setSessionId(anyResult.sessionId);
      }
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "owl",
          text: anyResult.reply,
          sources: anyResult.sources,
        },
      ]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Professor Who? is unavailable right now. Please try again.";
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "owl", text: `⚠️ ${message}` },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Professor Who?"
        subtitle="An AI tutor for coursework, skill-gap questions, project planning and interview prep — always encouraging honest, independent understanding."
        icon={<MessageCircle className="size-7" />}
        actions={USE_MOCK_API ? <DemoBadge label="Demo responses" /> : undefined}
      />

      <div className="flex h-[70vh] min-h-125 flex-col rounded-3xl border border-border bg-card">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-3", m.from === "you" && "flex-row-reverse")}>
              {m.from === "owl" ? <Owl size={36} animate={false} alt="" /> : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-plum text-xs font-bold text-gold" aria-hidden>
                  {(state.profile.name || "You").slice(0, 2).toUpperCase()}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%]",
                  m.from === "owl" ? "bg-gold/15 text-foreground" : "bg-plum text-cream",
                )}
              >
                {m.text}
                {m.sources && m.sources.length > 0 && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    📄 Sources: {m.sources.join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex items-center gap-3">
              <Owl size={36} animate={false} alt="" />
              <div className="rounded-2xl bg-gold/15 px-4 py-2.5 text-sm text-muted-foreground" aria-label="The professor is thinking">
                <span className="animate-twinkle">✦</span> thinking…
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 sm:p-4">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="rounded-full border border-gold-muted/40 bg-gold/10 px-3 py-1 text-xs font-medium text-plum transition-colors hover:bg-gold/25"
              >
                {c}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the professor anything…"
              aria-label="Message the professor"
            />
            <Button type="submit" className="btn-sparkle font-semibold" disabled={!input.trim() || thinking} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="size-3" aria-hidden />
            {USE_MOCK_API
              ? "Demo mode — set VITE_USE_MOCK_API=false and add a GROQ_API_KEY to enable live AI responses."
              : "Powered by Groq AI (Llama 3.3-70B) · Answers are for study support only — verify important facts with your lecturer."}
          </p>
        </div>
      </div>
    </div>
  );
}
