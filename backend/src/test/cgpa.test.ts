import { describe, it, expect } from "vitest";
import {
  calculateCGPA,
  calculateRequiredGpa,
  UGC_GRADE_SCALE,
  type CourseInput,
} from "../utils/cgpa";

describe("calculateCGPA", () => {
  it("returns zero for empty courses", () => {
    const result = calculateCGPA([]);
    expect(result.cgpa).toBe(0);
    expect(result.totalCredits).toBe(0);
    expect(result.courseCount).toBe(0);
  });

  it("calculates correct CGPA for UGC scale", () => {
    const courses: CourseInput[] = [
      { code: "CSE111", name: "Intro", credits: 3, grade: "A" },   // 3 × 4.0 = 12
      { code: "CSE221", name: "DS",    credits: 3, grade: "A-" },  // 3 × 3.75 = 11.25
      { code: "CSE325", name: "DB",    credits: 3, grade: "B+" },  // 3 × 3.5 = 10.5
    ];
    const result = calculateCGPA(courses);
    expect(result.totalCredits).toBe(9);
    expect(result.totalGradePoints).toBeCloseTo(33.75);
    expect(result.cgpa).toBeCloseTo(3.75);
    expect(result.courseCount).toBe(3);
  });

  it("treats F grade as 0 grade points", () => {
    const courses: CourseInput[] = [
      { code: "FAIL1", name: "Failed", credits: 3, grade: "F" },
      { code: "PASS1", name: "Passed", credits: 3, grade: "A" },
    ];
    const result = calculateCGPA(courses);
    expect(result.cgpa).toBe(2.0); // (0 + 12) / 6
  });

  it("is case-insensitive for grade letters", () => {
    const courses: CourseInput[] = [
      { code: "CSE1", name: "Test", credits: 3, grade: "a+" }, // lowercase
    ];
    const result = calculateCGPA(courses);
    expect(result.cgpa).toBe(4.0);
  });

  it("handles repeat courses correctly when flag is on", () => {
    const courses: CourseInput[] = [
      { code: "CSE100", name: "Retake", credits: 3, grade: "D" }, // first attempt
      { code: "CSE100", name: "Retake", credits: 3, grade: "B" }, // better grade
    ];
    const result = calculateCGPA(courses, UGC_GRADE_SCALE, { handleRepeats: true });
    // Should only count B (3.25) once
    expect(result.totalCredits).toBe(3);
    expect(result.cgpa).toBe(3.25);
  });

  it("works with custom university grading scale", () => {
    const customScale: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0 };
    const courses: CourseInput[] = [
      { code: "ENG1", name: "English", credits: 3, grade: "B" },
    ];
    const result = calculateCGPA(courses, customScale);
    expect(result.cgpa).toBe(3.0);
  });
});

describe("calculateRequiredGpa", () => {
  it("returns impossible if required GPA exceeds 4.0", () => {
    const result = calculateRequiredGpa(2.0, 30, 15, 3.8);
    expect(result.kind).toBe("impossible");
    expect(result.requiredGpa).toBeGreaterThan(4.0);
  });

  it("returns achieved when required GPA is <= 0 (target already met by margin)", () => {
    // Current 3.9 × 45 = 175.5 pts
    // Target 3.5 × 60 = 210 pts
    // Required for 15 credits = (210 - 175.5) / 15 = 2.3  → "ok", not "achieved"
    // For truly "achieved": need currentCgpa so high that formula gives <=0
    // e.g. 4.0 × 30 = 120 pts; target 3.5 × 40 = 140; req = (140-120)/10 = 2.0 → "ok"
    // True achieved: 4.0 × 50 credits, target 3.5, upcoming 10:
    //   req = (3.5*60 - 4.0*50) / 10 = (210-200)/10 = 1.0 → "ok"
    // The "achieved" branch fires when required ≤ 0:
    //   currentCgpa=4.0, completedCredits=60, upcoming=10, target=3.0
    //   req = (3.0*70 - 4.0*60) / 10 = (210-240)/10 = -3 → "achieved"
    const result = calculateRequiredGpa(4.0, 60, 10, 3.0);
    expect(result.kind).toBe("achieved");
    expect(result.requiredGpa).toBe(0);
  });

  it("calculates required GPA correctly", () => {
    // Target 3.5, current 3.2 on 30 credits, upcoming 15
    // required = (3.5 * 45 - 3.2 * 30) / 15 = (157.5 - 96) / 15 = 61.5 / 15 = 4.1
    const result = calculateRequiredGpa(3.2, 30, 15, 3.5);
    expect(result.kind).toBe("impossible");
  });

  it("handles zero upcoming credits with target already met", () => {
    const result = calculateRequiredGpa(3.8, 30, 0, 3.5);
    expect(result.kind).toBe("achieved");
  });

  it("handles zero upcoming credits with target not met", () => {
    const result = calculateRequiredGpa(3.0, 30, 0, 3.5);
    expect(result.kind).toBe("impossible");
  });
});
