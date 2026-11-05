import { describe, it, expect } from "vitest";
import {
  computeSkillCoverage,
  getAssessedLevel,
  generateMarauderMapMilestones,
  LEVEL_TO_STATUS,
} from "../utils/coverage";

describe("getAssessedLevel", () => {
  it("returns 0 for undefined/null", () => {
    expect(getAssessedLevel(undefined)).toBe(0);
    expect(getAssessedLevel(null)).toBe(0);
  });

  it("converts legacy string statuses", () => {
    expect(getAssessedLevel("demonstrated")).toBe(4);
    expect(getAssessedLevel("developing")).toBe(2);
    expect(getAssessedLevel("missing")).toBe(0);
  });

  it("returns numeric level directly", () => {
    expect(getAssessedLevel(3)).toBe(3);
    expect(getAssessedLevel(0)).toBe(0);
    expect(getAssessedLevel(4)).toBe(4);
  });

  it("reads level from AssessedSkill object", () => {
    expect(getAssessedLevel({ level: 3 })).toBe(3);
    expect(getAssessedLevel({ status: "demonstrated" })).toBe(4);
  });

  it("clamps values to 0-4", () => {
    expect(getAssessedLevel(10)).toBe(4);
    expect(getAssessedLevel(-5)).toBe(0);
  });
});

describe("computeSkillCoverage", () => {
  it("returns zero for empty requirements", () => {
    const result = computeSkillCoverage([], {});
    expect(result.percent).toBe(0);
    expect(result.demonstratedCount).toBe(0);
  });

  it("correctly identifies demonstrated, developing, missing", () => {
    const required = ["python", "sql", "ml-fundamentals"];
    const assessed = {
      python: { level: 4 },           // demonstrated
      sql: { level: 2 },              // developing
      "ml-fundamentals": { level: 0 }, // missing
    };
    const result = computeSkillCoverage(required, assessed);
    expect(result.demonstratedCount).toBe(1);
    expect(result.developingCount).toBe(1);
    expect(result.missingCount).toBe(1);
  });

  it("calculates 100% when all skills fully demonstrated", () => {
    const required = ["python", "sql"];
    const assessed = { python: 4, sql: 4 };
    const result = computeSkillCoverage(required, assessed);
    expect(result.percent).toBe(100);
  });

  it("calculates 0% when no skills assessed", () => {
    const required = ["python", "sql", "ml-fundamentals"];
    const result = computeSkillCoverage(required, {});
    expect(result.percent).toBe(0);
    expect(result.missingCount).toBe(3);
  });

  it("handles partial coverage (mix of levels)", () => {
    const required = ["a", "b"]; // each targetLevel = 4
    const assessed = { a: 4, b: 2 }; // a=1.0, b=0.5; avg=0.75 => 75%
    const result = computeSkillCoverage(required, assessed);
    expect(result.percent).toBe(75);
  });

  it("respects custom weights", () => {
    const required = [
      { skillId: "python", weight: 2, targetLevel: 4 },
      { skillId: "sql",    weight: 1, targetLevel: 4 },
    ];
    // python: level 4 -> ratio 1.0, weight 2 => contrib 2.0
    // sql: level 0 -> ratio 0, weight 1 => contrib 0
    // total weight 3, score 2, percent = 66.67% => 67%
    const assessed = { python: { level: 4 }, sql: { level: 0 } };
    const result = computeSkillCoverage(required, assessed);
    expect(result.percent).toBe(67);
  });
});

describe("LEVEL_TO_STATUS mapping", () => {
  it("maps 0 to missing", () => expect(LEVEL_TO_STATUS[0]).toBe("missing"));
  it("maps 1-3 to developing", () => {
    expect(LEVEL_TO_STATUS[1]).toBe("developing");
    expect(LEVEL_TO_STATUS[2]).toBe("developing");
    expect(LEVEL_TO_STATUS[3]).toBe("developing");
  });
  it("maps 4 to demonstrated", () => expect(LEVEL_TO_STATUS[4]).toBe("demonstrated"));
});

describe("generateMarauderMapMilestones", () => {
  it("marks starting-gate as completed only when isOnboarded is true", () => {
    const { milestones: completedGate } = generateMarauderMapMilestones(
      ["python", "sql"],
      { percent: 0, evidencePercent: 0, weightedScore: 0, totalWeight: 2, details: [], demonstratedCount: 0, developingCount: 0, missingCount: 2, evidenceCount: 0 },
      { isOnboarded: true },
    );
    expect(completedGate[0]?.id).toBe("starting-gate");
    expect(completedGate[0]?.status).toBe("completed");

    const { milestones: activeGate } = generateMarauderMapMilestones(
      ["python", "sql"],
      { percent: 0, evidencePercent: 0, weightedScore: 0, totalWeight: 2, details: [], demonstratedCount: 0, developingCount: 0, missingCount: 2, evidenceCount: 0 },
      { isOnboarded: false },
    );
    expect(activeGate[0]?.id).toBe("starting-gate");
    expect(activeGate[0]?.status).toBe("active");
    expect(activeGate[1]?.status).toBe("upcoming");
  });

  it("advances library-foundations to completed when foundation skills are satisfied", () => {
    const required = ["python", "sql", "git-collab", "portfolio-projects"];
    const assessed = {
      python: { level: 3, hasEvidence: false }, // foundation satisfied
      sql: { level: 0 },
      "git-collab": { level: 0 },
      "portfolio-projects": { level: 0 },
    };
    const coverage = computeSkillCoverage(required, assessed);
    const { milestones } = generateMarauderMapMilestones(required, coverage, { isOnboarded: true });

    expect(milestones[0]?.status).toBe("completed"); // starting gate
    expect(milestones[1]?.id).toBe("library-foundations");
    expect(milestones[1]?.status).toBe("completed"); // python is chunk 1
    expect(milestones[2]?.status).toBe("active"); // workshop of quests is now active
  });

  it("calculates separate skill coverage and evidence coverage", () => {
    const required = ["python", "sql"];
    const assessed = {
      python: { level: 4, hasEvidence: true },
      sql: { level: 4, hasEvidence: false },
    };
    const coverage = computeSkillCoverage(required, assessed);
    expect(coverage.percent).toBe(100); // 100% self-assessed skill coverage
    expect(coverage.evidencePercent).toBe(50); // only 1 of 2 skills has attached evidence
    expect(coverage.evidenceCount).toBe(1);
  });
});

