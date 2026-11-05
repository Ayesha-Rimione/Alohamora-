import { describe, expect, it } from "vitest";
import { computeSkillCoverage, type SkillRequirement } from "@/lib/coverage";

describe("Skill Coverage Formula", () => {
  it("computes coverage according to the formula: 100 * Σ(wᵢ * min(aᵢ / rᵢ, 1)) / Σwᵢ", () => {
    // Hand-checked calculation:
    // 4 required skills, all equal weight w = 1.0, target r = 4:
    // 1. python: level 4 (demonstrated) -> min(4/4, 1) = 1.0 -> weight*ratio = 1.0
    // 2. data-handling: level 2 (developing) -> min(2/4, 1) = 0.5 -> weight*ratio = 0.5
    // 3. ml-fundamentals: level 1 (exploring) -> min(1/4, 1) = 0.25 -> weight*ratio = 0.25
    // 4. apis: level 0 (missing) -> min(0/4, 1) = 0.0 -> weight*ratio = 0.0
    // Total weight = 4.0
    // Total weighted achieved = 1.0 + 0.5 + 0.25 + 0.0 = 1.75
    // Percent = 100 * (1.75 / 4.0) = 43.75% -> rounded to 44%
    const skills = {
      python: { level: 4 },
      "data-handling": { level: 2 },
      "ml-fundamentals": { level: 1 },
      apis: { level: 0 },
    };

    const res = computeSkillCoverage(["python", "data-handling", "ml-fundamentals", "apis"], skills);
    expect(res.totalWeight).toBe(4);
    expect(res.weightedScore).toBe(1.75);
    expect(res.percent).toBe(44);
    expect(res.demonstratedCount).toBe(1);
    expect(res.developingCount).toBe(2);
    expect(res.missingCount).toBe(1);
  });

  it("handles legacy string statuses properly (demonstrated=4/4=1, developing=2/4=0.5, missing=0)", () => {
    // 2 skills:
    // python: demonstrated -> ratio 1.0
    // sql: developing -> ratio 0.5
    // Total weight = 2.0
    // Sum = 1.5
    // Percent = 100 * (1.5 / 2.0) = 75%
    const skills = {
      python: "demonstrated" as const,
      sql: "developing" as const,
    };
    const res = computeSkillCoverage(["python", "sql"], skills);
    expect(res.percent).toBe(75);
    expect(res.demonstratedCount).toBe(1);
    expect(res.developingCount).toBe(1);
  });

  it("respects custom weights and target levels", () => {
    // Custom requirements:
    // skill-A: weight 2.0, target 4, assessed 4 -> ratio 1.0 -> achieved = 2.0
    // skill-B: weight 1.0, target 2, assessed 1 -> ratio 0.5 -> achieved = 0.5
    // Total weight = 3.0
    // Achieved = 2.5
    // Percent = 100 * (2.5 / 3.0) = 83.33% -> 83%
    const requirements: SkillRequirement[] = [
      { skillId: "skill-A", weight: 2.0, targetLevel: 4 },
      { skillId: "skill-B", weight: 1.0, targetLevel: 2 },
    ];
    const skills = {
      "skill-A": { level: 4 },
      "skill-B": { level: 1 },
    };
    const res = computeSkillCoverage(requirements, skills);
    expect(res.totalWeight).toBe(3);
    expect(res.weightedScore).toBe(2.5);
    expect(res.percent).toBe(83);
  });
});
