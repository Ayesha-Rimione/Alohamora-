// Potion Lab plan generator — transparent mock logic.
// Given a target role, current skills and weekly hours, produce a simple
// hands-on weekly schedule prioritising the least-covered skill areas.

import { computeCoverage, getCareer, getSkill, type SkillStatus } from "@/data/skills";

export interface PlanTask {
  id: string;
  day: string;
  title: string;
  kind: "Learn" | "Practice" | "Build" | "Share";
  minutes: number;
  url?: string;
}

export interface PlanWeek {
  id: string;
  focusSkill: string;
  goal: string;
  tasks: PlanTask[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Spread `minutes` over the week. More hours => longer sessions + weekend build days. */
function sessionMinutes(hoursPerWeek: number, dayIndex: number): number {
  const perDay = (hoursPerWeek * 60) / 7;
  const weekendBoost = dayIndex >= 5 ? 1.4 : 1;
  const rounded = Math.max(20, Math.round((perDay * weekendBoost) / 5) * 5);
  return Math.min(rounded, 180);
}

export function generatePlan(
  roleId: string,
  skills: Record<string, { status: SkillStatus }>,
  hoursPerWeek: number,
  variant = 0,
): PlanWeek[] {
  const career = getCareer(roleId) ?? getCareer("aiml")!;
  const coverage = computeCoverage(roleId, skills);

  // Priority: missing first, then developing, then demonstrated (light practice).
  const priority = [...coverage.areas].sort((a, b) => {
    const rank = { missing: 0, developing: 1, demonstrated: 2 } as const;
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    return 0;
  });
  const focusSkills = priority.slice(0, Math.max(2, Math.min(4, Math.round(hoursPerWeek / 4) + 1)));

  const weeks: PlanWeek[] = focusSkills.slice(0, 3).map((area, wi) => {
    const skill = area.skill;
    const practice = variant % 2 === 1 && wi > 0 ? skill.quest : skill.resource.title;
    const url = area.skill.resource.url;
    const tasks: PlanTask[] = DAYS.flatMap((day, di): PlanTask[] => {
      const minutes = sessionMinutes(hoursPerWeek, di);
      const kinds: (PlanTask["kind"] | "Rest")[] =
        hoursPerWeek >= 8
          ? ["Learn", "Practice", "Practice", "Build", "Practice", "Build", "Share"]
          : ["Learn", "Practice", "Build", "Practice", "Build", "Share", "Rest"];
      const kind = kinds[di] ?? "Learn";
      if (kind === "Rest") return []; // rest day: no task
      let title: string;
      if (kind === "Learn") title = `Learn: ${practice} — ${skill.name} fundamentals`;
      else if (kind === "Practice") title = `Practice: ${di % 2 === 0 ? "guided exercise" : "self-made challenge"} for ${skill.name}`;
      else if (kind === "Build") title = `Build: apply ${skill.name} in your running mini-project`;
      else title = `Share: document your ${skill.name} progress in the Spellbook`;
      const task: PlanTask = {
        id: `w${wi + 1}-d${di + 1}`,
        day,
        title,
        kind,
        minutes,
      };
      if (kind === "Learn") task.url = url;
      return [task];
    });

    return {
      id: `week-${wi + 1}`,
      focusSkill: skill.id,
      goal: `Week ${wi + 1}: ${skill.name} — ${area.status === "missing" ? "from zero to a working example" : "from rusty to demonstrable"}`,
      tasks,
    };
  });

  return weeks;
}

export function planProgress(plan: PlanWeek[], done: Record<string, boolean>): number {
  const all = plan.flatMap((w) => w.tasks);
  if (!all.length) return 0;
  return Math.round((all.filter((t) => done[t.id]).length / all.length) * 100);
}

export function nextPlanTask(plan: PlanWeek[], done: Record<string, boolean>): PlanTask | undefined {
  return plan.flatMap((w) => w.tasks).find((t) => !done[t.id]);
}
