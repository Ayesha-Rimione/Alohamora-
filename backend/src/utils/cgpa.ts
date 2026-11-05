// Deterministic CGPA Calculation Engine for Alohomora!
// Adheres strictly to standard credit-weighted UGC scales and custom university policies.

export interface CourseInput {
  id?: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
  semester?: string;
  confidence?: number;
}

export interface CGPAResult {
  cgpa: number;
  totalCredits: number;
  totalGradePoints: number;
  courseCount: number;
}

export const UGC_GRADE_SCALE: Record<string, number> = {
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

/**
 * Calculates credit-weighted CGPA.
 * Formula: CGPA = Σ(credits * gradePoints) / Σ(credits)
 */
export function calculateCGPA(
  courses: CourseInput[],
  scale: Record<string, number> = UGC_GRADE_SCALE,
  options?: { handleRepeats?: boolean },
): CGPAResult {
  if (!courses || courses.length === 0) {
    return { cgpa: 0, totalCredits: 0, totalGradePoints: 0, courseCount: 0 };
  }

  // If handleRepeats is true, if a course code appears multiple times, the latest/highest grade is taken.
  let effectiveCourses = courses;
  if (options?.handleRepeats) {
    const courseMap = new Map<string, CourseInput>();
    for (const c of courses) {
      const normalizedCode = c.code.trim().toUpperCase();
      const existing = courseMap.get(normalizedCode);
      if (!existing) {
        courseMap.set(normalizedCode, c);
      } else {
        const existingPoints = scale[existing.grade.trim().toUpperCase()] ?? 0;
        const newPoints = scale[c.grade.trim().toUpperCase()] ?? 0;
        if (newPoints >= existingPoints) {
          courseMap.set(normalizedCode, c);
        }
      }
    }
    effectiveCourses = Array.from(courseMap.values());
  }

  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const c of effectiveCourses) {
    const credits = Number(c.credits) || 0;
    if (credits <= 0) continue;

    const gradeLetter = c.grade ? c.grade.trim().toUpperCase() : "";
    const points = scale[gradeLetter] !== undefined ? scale[gradeLetter] : scale[c.grade] ?? 0;

    totalCredits += credits;
    totalGradePoints += credits * points;
  }

  const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;

  return {
    cgpa,
    totalCredits,
    totalGradePoints: Number(totalGradePoints.toFixed(2)),
    courseCount: effectiveCourses.length,
  };
}

export type RequiredGpaStatus = "achieved" | "ok" | "impossible" | "invalid" | "zeroUpcoming";

export interface RequiredGpaResult {
  kind: RequiredGpaStatus;
  requiredGpa: number;
  maxPossibleCgpa: number;
  totalCredits: number;
  message?: string;
}

/**
 * Calculates the required future term GPA to hit a target CGPA.
 * Formula:
 * Target CGPA * (Current Credits + Upcoming Credits) = Current Points + Required GPA * Upcoming Credits
 * => Required GPA = (Target CGPA * (Current Credits + Upcoming Credits) - Current Points) / Upcoming Credits
 */
export function calculateRequiredGpa(
  currentCgpa: number,
  completedCredits: number,
  upcomingCredits: number,
  targetCgpa: number,
  maxScaleGpa: number = 4.0,
): RequiredGpaResult {
  if (completedCredits < 0 || upcomingCredits < 0 || targetCgpa <= 0 || currentCgpa < 0) {
    return { kind: "invalid", requiredGpa: 0, maxPossibleCgpa: 0, totalCredits: 0, message: "Invalid parameters" };
  }

  const totalCredits = completedCredits + upcomingCredits;

  if (upcomingCredits === 0) {
    if (completedCredits === 0) {
      return { kind: "zeroUpcoming", requiredGpa: 0, maxPossibleCgpa: maxScaleGpa, totalCredits: 0 };
    }
    const achieved = currentCgpa >= targetCgpa;
    return {
      kind: achieved ? "achieved" : "impossible",
      requiredGpa: 0,
      maxPossibleCgpa: currentCgpa,
      totalCredits: completedCredits,
    };
  }

  const currentPoints = currentCgpa * completedCredits;
  const targetPoints = targetCgpa * totalCredits;
  const neededPoints = targetPoints - currentPoints;
  const requiredGpa = neededPoints / upcomingCredits;
  const maxPossiblePoints = currentPoints + maxScaleGpa * upcomingCredits;
  const maxPossibleCgpa = Number((maxPossiblePoints / totalCredits).toFixed(2));

  if (requiredGpa <= 0) {
    return {
      kind: "achieved",
      requiredGpa: 0,
      maxPossibleCgpa,
      totalCredits,
      message: "Target already mathematically achieved!",
    };
  }

  if (requiredGpa > maxScaleGpa) {
    return {
      kind: "impossible",
      requiredGpa: Number(requiredGpa.toFixed(2)),
      maxPossibleCgpa,
      totalCredits,
      message: `Mathematically impossible in ${upcomingCredits} credits. Maximum achievable CGPA is ${maxPossibleCgpa}.`,
    };
  }

  return {
    kind: "ok",
    requiredGpa: Number(requiredGpa.toFixed(2)),
    maxPossibleCgpa,
    totalCredits,
  };
}

