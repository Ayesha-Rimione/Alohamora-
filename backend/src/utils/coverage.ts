// Deterministic Skill Coverage & Marauder Map Engine for Alohomora!
// Formula: coverage = 100 × Σ(wᵢ × min(aᵢ / rᵢ, 1)) / Σwᵢ
//
// NOTE: Clearly documented as coverage of defined role requirements, NOT hiring probability.

export type SkillStatus = "demonstrated" | "developing" | "missing";

export interface SkillRequirement {
  skillId: string;
  weight?: number; // wᵢ, default 1.0
  targetLevel?: number; // rᵢ, default 4
}

export interface AssessedSkill {
  level?: number; // 0 to 4
  status?: SkillStatus;
  confidence?: number;
  evidence?: string;
}

export const LEVEL_TO_STATUS: Record<number, SkillStatus> = {
  0: "missing",
  1: "developing",
  2: "developing",
  3: "developing",
  4: "demonstrated",
};

export const STATUS_TO_LEVEL: Record<SkillStatus, number> = {
  demonstrated: 4,
  developing: 2,
  missing: 0,
};

export interface CoverageDetail {
  skillId: string;
  weight: number;
  targetLevel: number;
  assessedLevel: number;
  ratio: number;
  status: SkillStatus;
}

export interface CoverageResult {
  percent: number;
  weightedScore: number;
  totalWeight: number;
  details: CoverageDetail[];
  demonstratedCount: number;
  developingCount: number;
  missingCount: number;
}

export function getAssessedLevel(input?: AssessedSkill | SkillStatus | number | null): number {
  if (input === undefined || input === null) return 0;
  if (typeof input === "number") return Math.max(0, Math.min(4, input));
  if (typeof input === "string") return STATUS_TO_LEVEL[input as SkillStatus] ?? 0;
  if (typeof input === "object") {
    if (typeof input.level === "number") return Math.max(0, Math.min(4, input.level));
    if (input.status) return STATUS_TO_LEVEL[input.status] ?? 0;
  }
  return 0;
}

export function computeSkillCoverage(
  required: (string | SkillRequirement)[],
  assessedSkills: Record<string, AssessedSkill | SkillStatus | number>,
): CoverageResult {
  if (!required || required.length === 0) {
    return {
      percent: 0,
      weightedScore: 0,
      totalWeight: 0,
      details: [],
      demonstratedCount: 0,
      developingCount: 0,
      missingCount: 0,
    };
  }

  let totalWeight = 0;
  let weightedScore = 0;
  let demonstratedCount = 0;
  let developingCount = 0;
  let missingCount = 0;

  const details: CoverageDetail[] = [];

  for (const item of required) {
    const skillId = typeof item === "string" ? item : item.skillId;
    const weight = typeof item === "object" && typeof item.weight === "number" ? Math.max(0, item.weight) : 1.0;
    const targetLevel = typeof item === "object" && typeof item.targetLevel === "number" ? Math.max(1, item.targetLevel) : 4;

    const assessedInput = assessedSkills[skillId];
    const assessedLevel = getAssessedLevel(assessedInput);
    const ratio = Math.min(assessedLevel / targetLevel, 1.0);

    totalWeight += weight;
    weightedScore += weight * ratio;

    const status = LEVEL_TO_STATUS[assessedLevel] ?? "missing";
    if (status === "demonstrated") demonstratedCount += 1;
    else if (status === "developing") developingCount += 1;
    else missingCount += 1;

    details.push({
      skillId,
      weight,
      targetLevel,
      assessedLevel,
      ratio: Number(ratio.toFixed(2)),
      status,
    });
  }

  const percent = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  return {
    percent,
    weightedScore: Number(weightedScore.toFixed(2)),
    totalWeight: Number(totalWeight.toFixed(2)),
    details,
    demonstratedCount,
    developingCount,
    missingCount,
  };
}

export interface MapMilestone {
  id: string;
  title: string;
  room: string;
  status: "completed" | "active" | "upcoming";
  skills: string[];
}

export function generateMarauderMapMilestones(
  requiredSkillIds: string[],
  coverage: CoverageResult,
): { currentMilestoneIndex: number; milestones: MapMilestone[] } {
  // Distribute required skills across 4 learning rooms
  const total = requiredSkillIds.length;
  const chunk1 = requiredSkillIds.slice(0, Math.ceil(total * 0.25));
  const chunk2 = requiredSkillIds.slice(Math.ceil(total * 0.25), Math.ceil(total * 0.6));
  const chunk3 = requiredSkillIds.slice(Math.ceil(total * 0.6), Math.ceil(total * 0.85));
  const chunk4 = requiredSkillIds.slice(Math.ceil(total * 0.85));

  const milestones: MapMilestone[] = [
    {
      id: "starting-gate",
      title: "Starting Gate",
      room: "Starting Gate",
      status: "completed",
      skills: [],
    },
    {
      id: "library-foundations",
      title: "Library of Foundations",
      room: "Library of Foundations",
      status: coverage.percent >= 25 ? "completed" : "active",
      skills: chunk1,
    },
    {
      id: "workshop-quests",
      title: "Workshop of Quests",
      room: "Workshop of Quests",
      status: coverage.percent >= 60 ? "completed" : coverage.percent >= 25 ? "active" : "upcoming",
      skills: chunk2,
    },
    {
      id: "portfolio-gallery",
      title: "Portfolio Gallery",
      room: "Portfolio Gallery",
      status: coverage.percent >= 85 ? "completed" : coverage.percent >= 60 ? "active" : "upcoming",
      skills: chunk3,
    },
    {
      id: "interview-hall",
      title: "Interview Hall",
      room: "Interview Hall",
      status: coverage.percent >= 95 ? "completed" : coverage.percent >= 85 ? "active" : "upcoming",
      skills: chunk4,
    },
    {
      id: "application-tower",
      title: "Application Tower",
      room: "Application Tower",
      status: coverage.percent >= 100 ? "completed" : coverage.percent >= 95 ? "active" : "upcoming",
      skills: [],
    },
  ];

  let currentMilestoneIndex = 1;
  for (let i = 0; i < milestones.length; i++) {
    if (milestones[i]?.status === "active") {
      currentMilestoneIndex = i;
      break;
    }
  }

  return { currentMilestoneIndex, milestones };
}

