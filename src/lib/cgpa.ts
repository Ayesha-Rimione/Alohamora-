// Reusable, pure, deterministic CGPA calculation functions for Alohomora!
// Follows standard Bangladeshi university (UGC) credit-weighted grading scales.
// No AI, no estimation — verified arithmetic.

export interface CourseRecord {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
  confidence?: number; // 1 to 5
  status?: "completed" | "not_completed";
  rating?: number; // 1 to 5 personal course rating
}

export const DEFAULT_GRADE_SCALE: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.75,
  "B+": 3.5,
  B: 3.25,
  "B-": 3.0,
  "C+": 2.75,
  C: 2.5,
  D: 2.0,
  F: 0.0,
};

export const GRADE_OPTIONS: { letter: string; points: number; label: string }[] = [
  { letter: "A+", points: 4.0, label: "A+ (4.00) — Outstanding" },
  { letter: "A", points: 4.0, label: "A (4.00) — Excellent" },
  { letter: "A-", points: 3.75, label: "A- (3.75) — Very Good" },
  { letter: "B+", points: 3.5, label: "B+ (3.50) — Good" },
  { letter: "B", points: 3.25, label: "B (3.25) — Satisfactory" },
  { letter: "B-", points: 3.0, label: "B- (3.00) — Above Average" },
  { letter: "C+", points: 2.75, label: "C+ (2.75) — Average" },
  { letter: "C", points: 2.5, label: "C (2.50) — Below Average" },
  { letter: "D", points: 2.0, label: "D (2.00) — Pass" },
  { letter: "F", points: 0.0, label: "F (0.00) — Fail" },
];

export interface CGPAResult {
  cgpa: number;
  totalCredits: number;
  totalGradePoints: number;
  courseCount: number;
}

/**
 * Calculates deterministic CGPA:
 * CGPA = Sum of (course credit × course grade point) / Total completed credits
 */
export function calculateCGPA(
  courses: CourseRecord[],
  scale: Record<string, number> = DEFAULT_GRADE_SCALE,
): CGPAResult {
  if (!courses || courses.length === 0) {
    return { cgpa: 0, totalCredits: 0, totalGradePoints: 0, courseCount: 0 };
  }

  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const c of courses) {
    if (c.status === "not_completed" || !c.grade || !c.grade.trim()) {
      continue;
    }
    const credit = Number(c.credits) || 0;
    if (credit <= 0) continue; // Zero-credit courses excluded from CGPA calculation
    const gradeLetter = c.grade.trim().toUpperCase();
    const points = scale[gradeLetter] ?? scale[c.grade] ?? 0;

    totalCredits += credit;
    totalGradePoints += credit * points;
  }

  const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;

  return {
    cgpa,
    totalCredits,
    totalGradePoints: Number(totalGradePoints.toFixed(2)),
    courseCount: courses.length,
  };
}

export type RequiredGpaStatus = "achieved" | "ok" | "impossible" | "invalid" | "zeroUpcoming";

export interface RequiredGpaResult {
  kind: RequiredGpaStatus;
  requiredGpa: number;
  maxPossibleCgpa: number;
  totalCredits: number;
}

/**
 * Calculates the required future term GPA to hit a target CGPA.
 * Formula:
 * Target CGPA * (Current Credits + Upcoming Credits) = Current CGPA * Current Credits + Required GPA * Upcoming Credits
 * => Required GPA = (Target CGPA * (Current Credits + Upcoming Credits) - Current CGPA * Current Credits) / Upcoming Credits
 */
export function calculateRequiredGpa(
  currentCgpa: number,
  completedCredits: number,
  upcomingCredits: number,
  targetCgpa: number,
): RequiredGpaResult {
  if (
    Number.isNaN(currentCgpa) ||
    Number.isNaN(completedCredits) ||
    Number.isNaN(upcomingCredits) ||
    Number.isNaN(targetCgpa) ||
    completedCredits < 0 ||
    upcomingCredits < 0 ||
    currentCgpa < 0 ||
    currentCgpa > 4 ||
    targetCgpa < 0 ||
    targetCgpa > 4
  ) {
    return { kind: "invalid", requiredGpa: 0, maxPossibleCgpa: 0, totalCredits: 0 };
  }

  if (upcomingCredits <= 0) {
    return {
      kind: "zeroUpcoming",
      requiredGpa: 0,
      maxPossibleCgpa: currentCgpa,
      totalCredits: completedCredits,
    };
  }

  const totalCredits = completedCredits + upcomingCredits;
  const currentPoints = currentCgpa * completedCredits;
  const targetTotalPoints = targetCgpa * totalCredits;
  const maxPossiblePoints = currentPoints + 4.0 * upcomingCredits;
  const maxPossibleCgpa = Number((maxPossiblePoints / totalCredits).toFixed(2));

  const required = (targetTotalPoints - currentPoints) / upcomingCredits;
  const requiredGpa = Number(required.toFixed(2));

  if (required > 4.0) {
    return {
      kind: "impossible",
      requiredGpa,
      maxPossibleCgpa,
      totalCredits,
    };
  }

  if (required <= 0) {
    return {
      kind: "achieved",
      requiredGpa: 0,
      maxPossibleCgpa,
      totalCredits,
    };
  }

  return {
    kind: "ok",
    requiredGpa,
    maxPossibleCgpa,
    totalCredits,
  };
}
