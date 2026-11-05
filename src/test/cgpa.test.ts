import { describe, expect, it } from "vitest";
import { calculateCGPA, calculateRequiredGpa, type CourseRecord } from "@/lib/cgpa";

describe("CGPA Calculations", () => {
  it("calculates weighted CGPA accurately from completed courses", () => {
    // Hand-checked calculation:
    // CSE 331: 3 credits, grade A (4.0) -> 12.0 grade points
    // CSE 325: 3 credits, grade B+ (3.5) -> 10.5 grade points
    // MAT 215: 3 credits, grade A- (3.75) -> 11.25 grade points
    // BUS 201: 2 credits, grade B (3.25) -> 6.5 grade points
    // Total credits = 11
    // Total points = 12.0 + 10.5 + 11.25 + 6.5 = 40.25
    // CGPA = 40.25 / 11 = 3.65909... -> 3.66
    const sampleCourses: CourseRecord[] = [
      { id: "1", code: "CSE 331", name: "Algorithms", credits: 3, grade: "A", semester: "Fall 2025", confidence: 4 },
      { id: "2", code: "CSE 325", name: "Databases", credits: 3, grade: "B+", semester: "Fall 2025", confidence: 3 },
      { id: "3", code: "MAT 215", name: "Statistics", credits: 3, grade: "A-", semester: "Spring 2026", confidence: 4 },
      { id: "4", code: "BUS 201", name: "Communication", credits: 2, grade: "B", semester: "Spring 2026", confidence: 3 },
    ];

    const result = calculateCGPA(sampleCourses);
    expect(result.totalCredits).toBe(11);
    expect(result.totalGradePoints).toBe(40.25);
    expect(result.cgpa).toBe(3.66);
    expect(result.courseCount).toBe(4);
  });

  it("handles empty course list gracefully", () => {
    const result = calculateCGPA([]);
    expect(result.totalCredits).toBe(0);
    expect(result.cgpa).toBe(0);
  });

  it("calculates required future GPA correctly", () => {
    // Hand-checked calculation:
    // Current: 60 credits at 3.00 CGPA -> 180 points
    // Upcoming: 45 credits
    // Total credits: 105
    // Target CGPA: 3.30 -> Target points = 3.30 * 105 = 346.5
    // Needed points from upcoming = 346.5 - 180 = 166.5
    // Required GPA = 166.5 / 45 = 3.70
    const res = calculateRequiredGpa(3.0, 60, 45, 3.3);
    expect(res.kind).toBe("ok");
    expect(res.requiredGpa).toBe(3.7);
    expect(res.totalCredits).toBe(105);
  });

  it("identifies impossible GPA targets accurately", () => {
    // Current: 60 credits at 2.50 CGPA -> 150 points
    // Upcoming: 15 credits
    // Total: 75 credits
    // Target: 3.90 -> Target points = 292.5
    // Needed = 292.5 - 150 = 142.5
    // Required = 142.5 / 15 = 9.5 (impossible since max GPA is 4.0)
    // Max possible = (150 + 15 * 4.0) / 75 = 210 / 75 = 2.80
    const res = calculateRequiredGpa(2.5, 60, 15, 3.9);
    expect(res.kind).toBe("impossible");
    expect(res.requiredGpa).toBe(9.5);
    expect(res.maxPossibleCgpa).toBe(2.8);
  });

  it("identifies already achieved targets", () => {
    // Current: 60 credits at 3.80 CGPA
    // Target: 3.00 CGPA
    const res = calculateRequiredGpa(3.8, 60, 15, 3.0);
    expect(res.kind).toBe("achieved");
    expect(res.requiredGpa).toBe(0);
  });
});
