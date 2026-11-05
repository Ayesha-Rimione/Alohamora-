import { createFileRoute } from "@tanstack/react-router";
import { Flame, Rocket, Sparkles, Trophy } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Owl } from "@/components/Owl";
import { useApp } from "@/state/app-state";
import { DEMO_BADGES, DEMO_COMPLETED_QUESTS } from "@/data/academic";

export const Route = createFileRoute("/_layout/codex")({
  head: () => ({
    meta: [
      { title: "The Comeback Codex — Alohomora!" },
      {
        name: "description",
        content: "Your completed quests, streaks, projects, milestones and earned badges — proof of progress.",
      },
      { property: "og:title", content: "The Comeback Codex — Alohomora!" },
      { property: "og:description", content: "Proof of progress and achievements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Codex,
});

function Codex() {
  const { state } = useApp();
  const planTasksDone = Object.values(state.planDone).filter(Boolean).length;
  const badgesEarned = DEMO_BADGES.filter((b) => b.earned).length;

  const stats = [
    {
      icon: Sparkles,
      label: "Quests Completed",
      value: DEMO_COMPLETED_QUESTS.length + planTasksDone,
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: "5 days",
    },
    {
      icon: Rocket,
      label: "Projects Shipped",
      value: "2 projects",
    },
    {
      icon: Trophy,
      label: "Badges Earned",
      value: `${badgesEarned} of ${DEMO_BADGES.length}`,
    },
  ];

  return (
    <div className="space-y-12">
      <PageHeader
        title="The Comeback Codex"
        subtitle="A steady record of your learning milestones and achievements."
        icon={<Trophy className="size-8" />}
      />

      {/* Big stat cards (quests, projects, streak, badges) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-6 sm:p-8 flex flex-col justify-between">
            <s.icon className="size-8 text-gold-muted" aria-hidden />
            <div className="mt-4 space-y-1">
              <span className="font-display text-4xl font-bold text-foreground">
                {s.value}
              </span>
              <p className="text-base font-semibold text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Short recent-activity list with supportive wording */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Recent Activity
          </h2>
          <p className="text-base text-muted-foreground mt-1">
            Every step forward builds verifiable proof. Take pride in regular progress.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <ul className="divide-y divide-border/50">
            {DEMO_COMPLETED_QUESTS.map((q) => (
              <li
                key={q.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Sparkles className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold font-sans text-foreground truncate">
                      {q.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {q.kind} · {q.when}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-success/15 px-3.5 py-1 text-sm font-bold text-success uppercase tracking-wider shrink-0">
                  Completed
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Supportive encouragement banner */}
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-gold-muted/40 bg-gold/10 p-6 sm:p-8">
        <Owl size={64} alt="" />
        <p className="min-w-52 flex-1 text-base leading-relaxed text-foreground">
          Life happens. Missed a few days? Your progress stays safe in the Codex.
          Pick up any quest whenever you are ready — consistency over perfection.
        </p>
      </div>
    </div>
  );
}
