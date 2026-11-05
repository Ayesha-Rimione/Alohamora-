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
  hasEvidence?: boolean;
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
  hasEvidence: boolean;
}

export interface CoverageResult {
  percent: number; // self-assessed requirement coverage
  evidencePercent: number; // percentage of requirements with attached project/evidence
  weightedScore: number;
  totalWeight: number;
  details: CoverageDetail[];
  demonstratedCount: number;
  developingCount: number;
  missingCount: number;
  evidenceCount: number;
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
      evidencePercent: 0,
      weightedScore: 0,
      totalWeight: 0,
      details: [],
      demonstratedCount: 0,
      developingCount: 0,
      missingCount: 0,
      evidenceCount: 0,
    };
  }

  let totalWeight = 0;
  let weightedScore = 0;
  let demonstratedCount = 0;
  let developingCount = 0;
  let missingCount = 0;
  let evidenceCount = 0;

  const details: CoverageDetail[] = [];

  for (const item of required) {
    const skillId = typeof item === "string" ? item : item.skillId;
    const weight = typeof item === "object" && typeof item.weight === "number" ? Math.max(0, item.weight) : 1.0;
    const targetLevel = typeof item === "object" && typeof item.targetLevel === "number" ? Math.max(1, item.targetLevel) : 4;

    const assessedInput = assessedSkills[skillId];
    const assessedLevel = getAssessedLevel(assessedInput);
    const ratio = Math.min(assessedLevel / targetLevel, 1.0);

    const hasEvidence = typeof assessedInput === "object" && assessedInput !== null
      ? Boolean(assessedInput.hasEvidence || (assessedInput.evidence && assessedInput.evidence.trim().length > 0))
      : false;

    totalWeight += weight;
    weightedScore += weight * ratio;

    const status = LEVEL_TO_STATUS[assessedLevel] ?? "missing";
    if (status === "demonstrated") demonstratedCount += 1;
    else if (status === "developing") developingCount += 1;
    else missingCount += 1;

    if (hasEvidence) evidenceCount += 1;

    details.push({
      skillId,
      weight,
      targetLevel,
      assessedLevel,
      ratio: Number(ratio.toFixed(2)),
      status,
      hasEvidence,
    });
  }

  const percent = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
  const evidencePercent = required.length > 0 ? Math.round((evidenceCount / required.length) * 100) : 0;

  return {
    percent,
    evidencePercent,
    weightedScore: Number(weightedScore.toFixed(2)),
    totalWeight: Number(totalWeight.toFixed(2)),
    details,
    demonstratedCount,
    developingCount,
    missingCount,
    evidenceCount,
  };
}

export interface MapMilestone {
  id: string;
  title: string;
  room: string;
  status: "completed" | "active" | "upcoming";
  skills: string[];
  requirementsDescription: string;
  isSatisfied: boolean;
}

export function generateMarauderMapMilestones(
  requiredSkillIds: string[],
  coverage: CoverageResult,
  options?: { isOnboarded?: boolean },
): { currentMilestoneIndex: number; milestones: MapMilestone[] } {
  const isOnboarded = options?.isOnboarded ?? true;

  // Split skills deterministically across learning rooms
  const total = requiredSkillIds.length;
  const foundationSkills = requiredSkillIds.slice(0, Math.ceil(total * 0.25));
  const questSkills = requiredSkillIds.slice(Math.ceil(total * 0.25), Math.ceil(total * 0.6));
  const portfolioSkills = requiredSkillIds.slice(Math.ceil(total * 0.6), Math.ceil(total * 0.85));
  const interviewSkills = requiredSkillIds.slice(Math.ceil(total * 0.85));

  const detailsMap = new Map(coverage.details.map((d) => [d.skillId, d]));

  // Room 1: Starting Gate — requires onboarding to be completed
  const startingGateSatisfied = isOnboarded;

  // Room 2: Library of Foundations — all foundation skills must be at least developing (level >= 1)
  const foundationsSatisfied =
    foundationSkills.length > 0 &&
    foundationSkills.every((sId) => {
      const d = detailsMap.get(sId);
      return d && d.assessedLevel >= 1;
    });

  // Room 3: Workshop of Quests — quest skills developing or demonstrated, AND at least one project evidence attached
  const questsSkillsSatisfied =
    questSkills.length > 0 &&
    questSkills.every((sId) => {
      const d = detailsMap.get(sId);
      return d && d.assessedLevel >= 2;
    });
  const workshopSatisfied = questsSkillsSatisfied && coverage.evidenceCount >= 1;

  // Room 4: Portfolio Gallery — portfolio skills demonstrated (level >= 3) AND at least 2 evidence attachments
  const portfolioSkillsSatisfied =
    portfolioSkills.length > 0 &&
    portfolioSkills.every((sId) => {
      const d = detailsMap.get(sId);
      return d && d.assessedLevel >= 3;
    });
  const gallerySatisfied = portfolioSkillsSatisfied && coverage.evidenceCount >= 2;

  // Room 5: Interview Hall — advanced/interview skills demonstrated (level >= 4)
  const interviewSatisfied =
    interviewSkills.length > 0 &&
    interviewSkills.every((sId) => {
      const d = detailsMap.get(sId);
      return d && d.assessedLevel >= 4;
    });

  // Room 6: Application Tower — all prior rooms satisfied and career coverage >= 95%
  const towerSatisfied =
    startingGateSatisfied &&
    foundationsSatisfied &&
    workshopSatisfied &&
    gallerySatisfied &&
    interviewSatisfied &&
    coverage.percent >= 95;

  // Assemble milestones with room progression (active is first non-completed room)
  const milestones: MapMilestone[] = [
    {
      id: "starting-gate",
      title: "Starting Gate",
      room: "Starting Gate",
      status: startingGateSatisfied ? "completed" : "active",
      skills: [],
      requirementsDescription: "Complete student registration and academic onboarding.",
      isSatisfied: startingGateSatisfied,
    },
    {
      id: "library-foundations",
      title: "Library of Foundations",
      room: "Library of Foundations",
      status: !startingGateSatisfied
        ? "upcoming"
        : foundationsSatisfied
        ? "completed"
        : "active",
      skills: foundationSkills,
      requirementsDescription: "Establish at least developing proficiency in core foundation skills.",
      isSatisfied: foundationsSatisfied,
    },
    {
      id: "workshop-quests",
      title: "Workshop of Quests",
      room: "Workshop of Quests",
      status: !foundationsSatisfied
        ? "upcoming"
        : workshopSatisfied
        ? "completed"
        : "active",
      skills: questSkills,
      requirementsDescription: "Develop intermediate competencies and attach at least 1 project proof.",
      isSatisfied: workshopSatisfied,
    },
    {
      id: "portfolio-gallery",
      title: "Portfolio Gallery",
      room: "Portfolio Gallery",
      status: !workshopSatisfied
        ? "upcoming"
        : gallerySatisfied
        ? "completed"
        : "active",
      skills: portfolioSkills,
      requirementsDescription: "Achieve advanced proficiency in craft skills and submit 2+ project links.",
      isSatisfied: gallerySatisfied,
    },
    {
      id: "interview-hall",
      title: "Interview Hall",
      room: "Interview Hall",
      status: !gallerySatisfied
        ? "upcoming"
        : interviewSatisfied
        ? "completed"
        : "active",
      skills: interviewSkills,
      requirementsDescription: "Demonstrate professional fluency in systems & specialized requirements.",
      isSatisfied: interviewSatisfied,
    },
    {
      id: "application-tower",
      title: "Application Tower",
      room: "Application Tower",
      status: !interviewSatisfied
        ? "upcoming"
        : towerSatisfied
        ? "completed"
        : "active",
      skills: [],
      requirementsDescription: "Attain 95%+ requirements coverage with verified portfolio artifacts.",
      isSatisfied: towerSatisfied,
    },
  ];

  let currentMilestoneIndex = 0;
  for (let i = 0; i < milestones.length; i++) {
    if (milestones[i]?.status === "active") {
      currentMilestoneIndex = i;
      break;
    }
  }

  return { currentMilestoneIndex, milestones };
}

