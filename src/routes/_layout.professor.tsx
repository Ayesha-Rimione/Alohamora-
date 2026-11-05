import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { DemoBadge } from "@/components/StatusPill";
import { Owl } from "@/components/Owl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/state/app-state";
import { computeCoverage, getCareer } from "@/data/skills";
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
      { property: "og:description", content: "Your study and career companion." },
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
  "Prepare me for a junior interview.",
  "Help me revise for exam.",
];

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
        : `Your map shows every required skill demonstrated. Shift focus to depth: a second, more ambitious project for ${role.title}.`;
    }
    if (q.includes("gap") || q.includes("explain")) {
      const missing = coverage.areas.filter((a) => a.status === "missing").map((a) => a.skill.name);
      return `Here's your gap: you demonstrate ${coverage.demonstrated} of ${coverage.areas.length} core areas for ${role.title}. Missing: ${missing.join(", ") || "none"}.`;
    }
    if (q.includes("portfolio") || q.includes("project")) {
      return `A great portfolio project needs: (1) a real problem; (2) a deployed link; (3) a README explaining choices; (4) an honest retrospective. For ${role.title}, use ${nextMissing?.name ?? "your strongest skill"}.`;
    }
    if (q.includes("interview")) {
      return `For a junior interview: (1) your project story — problem, approach, trade-offs; (2) fundamentals — explain ${nextDeveloping?.name ?? "your core skill"} simply; (3) honest unknowns score better than bluffing.`;
    }
    if (q.includes("revise") || q.includes("exam")) {
      return `Last-minute revision: triage topics by marks weight first, then revise actively — rewrite from memory, then check.`;
    }
    return `Good question. Select a prompt button below to explore advice tailored to your active career roadmap.`;
  };
}

function Professor() {
  const { state } = useApp();
  const demoAnswer = useDemoAnswer();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      from: "owl",
      text: USE_MOCK_API
        ? `Hoot! I'm Professor Who? — ${state.profile.name || "student"}'s study companion.`
        : `Hoot! I'm Professor Who? — your tutor. Ask me about coursework, skill gaps, projects, or interview prep. ✦`,
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
      await new Promise((r) => setTimeout(r, 600));
      setMessages((m) => [...m, { id: Date.now() + 1, from: "owl", text: demoAnswer(q) }]);
      setThinking(false);
      return;
    }

    try {
      const result = await api.chat.sendMessage(q, {
        course: state.profile.targetRole,
        role: state.profile.targetRole,
      });
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
      const message = err instanceof ApiError ? err.message : "Professor Who? is unavailable right now.";
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "owl", text: `⚠️ ${message}` },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Professor Who?"
        subtitle="Your study and career companion."
        icon={<MessageCircle className="size-8" />}
      />

      <div className="flex h-[75vh] min-h-[550px] flex-col rounded-3xl border border-border bg-card overflow-hidden">
        {/* Messages scroll area */}
        <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-4 items-start", m.from === "you" && "flex-row-reverse")}>
              {m.from === "owl" ? (
                <Owl size={44} animate={false} alt="" />
              ) : (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-plum text-sm font-bold text-gold" aria-hidden>
                  {(state.profile.name || "You").slice(0, 2).toUpperCase()}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-4 text-base sm:text-lg leading-relaxed sm:max-w-[75%]",
                  m.from === "owl" ? "bg-gold/15 text-foreground" : "bg-plum text-cream",
                )}
              >
                {m.text}
                {m.sources && m.sources.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground border-t border-border/40 pt-1.5">
                    Sources: {m.sources.join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex items-center gap-4">
              <Owl size={44} animate={false} alt="" />
              <div className="rounded-2xl bg-gold/15 px-5 py-3 text-base text-muted-foreground" aria-label="The professor is thinking">
                <span className="animate-twinkle">✦</span> thinking…
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border p-5 sm:p-6 bg-card space-y-4">
          {/* 5 prompt chips as big buttons */}
          <div className="flex flex-wrap gap-2.5">
            {CHIPS.map((c) => (
              <Button
                key={c}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => send(c)}
                className="min-h-[44px] text-sm font-medium px-4 bg-background hover:bg-gold/15"
              >
                {c}
              </Button>
            ))}
          </div>

          <form
            className="flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Professor Who? anything about your career path…"
              aria-label="Message the professor"
              className="min-h-[48px] text-base sm:text-lg"
            />
            <Button
              type="submit"
              className="min-h-[48px] px-6 text-base font-semibold btn-sparkle shrink-0"
              disabled={!input.trim() || thinking}
              aria-label="Send message"
            >
              <Send className="size-5 mr-1.5" /> Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
