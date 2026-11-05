// Unified Skill Coverage Formula for Alohomora!
// Formula: coverage = 100 × Σ(wᵢ × min(aᵢ / rᵢ, 1)) / Σwᵢ
//
// Where:
// - wᵢ = importance weight (default: 1.0)
// - rᵢ = target skill level (default: 4 for Demonstrated)
// - aᵢ = assessed skill level (0: Not assessed, 1: Exploring, 2: Developing, 3: Practising, 4: Demonstrated)
//
// NOTE: Clearly documented as coverage of defined role requirements, NOT hiring probability.

export type LegacySkillStatus = "demonstrated" | "developing" | "missing";

export interface SkillRequirement {
  skillId: string;
  weight?: number; // wᵢ, defaults to 1.0
  targetLevel?: number; // rᵢ, defaults to 4
}

export interface AssessedSkill {
  level?: number; // 0–4 numeric rating
  status?: LegacySkillStatus; // legacy status string fallback
  confidence?: number;
  evidence?: string;
}

export const LEVEL_TO_STATUS: Record<number, LegacySkillStatus> = {
  0: "missing",
  1: "developing",
  2: "developing",
  3: "developing",
  4: "demonstrated",
};

export const STATUS_TO_LEVEL: Record<LegacySkillStatus, number> = {
  demonstrated: 4,
  developing: 2,
  missing: 0,
};

export const LEVEL_LABELS: Record<number, { label: string; hint: string }> = {
  0: { label: "Not assessed", hint: "No evidence submitted yet" },
  1: { label: "Exploring", hint: "Beginning to learn the fundamentals" },
  2: { label: "Developing", hint: "Applying knowledge with guides and practice" },
  3: { label: "Practising independently", hint: "Building projects and solving problems without hand-holding" },
  4: { label: "Demonstrated", hint: "Finished projects, verifiable evidence, or lab-tested work" },
};

export interface CoverageDetail {
  skillId: string;
  weight: number;
  targetLevel: number;
  assessedLevel: number;
  ratio: number; // min(aᵢ / rᵢ, 1)
  status: LegacySkillStatus;
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

/**
 * Normalizes assessed skill into a numeric level aᵢ in range [0, 4].
 */
export function getAssessedLevel(input?: AssessedSkill | LegacySkillStatus | number | null): number {
  if (input === undefined || input === null) return 0;
  if (typeof input === "number") return Math.max(0, Math.min(4, input));
  if (typeof input === "string") return STATUS_TO_LEVEL[input as LegacySkillStatus] ?? 0;
  if (typeof input === "object") {
    if (typeof input.level === "number") return Math.max(0, Math.min(4, input.level));
    if (input.status) return STATUS_TO_LEVEL[input.status] ?? 0;
  }
  return 0;
}

/**
 * Computes coverage using:
 * coverage = 100 × Σ(wᵢ × min(aᵢ / rᵢ, 1)) / Σwᵢ
 */
export function computeSkillCoverage(
  required: (string | SkillRequirement)[],
  assessedSkills: Record<string, AssessedSkill | LegacySkillStatus | number>,
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
  let totalWeightedAchieved = 0;
  let demonstratedCount = 0;
  let developingCount = 0;
  let missingCount = 0;

  const details: CoverageDetail[] = [];

  for (const item of required) {
    const skillId = typeof item === "string" ? item : item.skillId;
    const weight = (typeof item === "object" && item.weight !== undefined) ? item.weight : 1.0;
    const targetLevel = (typeof item === "object" && item.targetLevel !== undefined) ? item.targetLevel : 4;

    const assessed = assessedSkills[skillId];
    const assessedLevel = getAssessedLevel(assessed);
    const ratio = targetLevel > 0 ? Math.min(assessedLevel / targetLevel, 1) : 0;

    totalWeight += weight;
    totalWeightedAchieved += weight * ratio;

    let status: LegacySkillStatus = "missing";
    if (assessedLevel >= targetLevel) {
      status = "demonstrated";
      demonstratedCount++;
    } else if (assessedLevel > 0) {
      status = "developing";
      developingCount++;
    } else {
      missingCount++;
    }

    details.push({
      skillId,
      weight,
      targetLevel,
      assessedLevel,
      ratio,
      status,
    });
  }

  const percent = totalWeight > 0 ? Math.round((totalWeightedAchieved / totalWeight) * 100) : 0;

  return {
    percent,
    weightedScore: Number(totalWeightedAchieved.toFixed(2)),
    totalWeight,
    details,
    demonstratedCount,
    developingCount,
    missingCount,
  };
}
