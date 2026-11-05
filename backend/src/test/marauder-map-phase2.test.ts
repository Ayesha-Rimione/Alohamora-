import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { skillsService } from "../modules/skills/skills.service";

const prisma = new PrismaClient();

describe("Marauder Map Phase 2: Multi-Student Isolation & Dynamic Calculation", () => {
  let studentAId: string;
  let studentBId: string;

  beforeAll(async () => {
    // Clean up test users if they exist
    await prisma.user.deleteMany({
      where: { email: { in: ["student_a_test@iubat.edu", "student_b_test@iubat.edu"] } },
    });

    // Create Student A (target: aiml)
    const userA = await prisma.user.create({
      data: {
        email: "student_a_test@iubat.edu",
        studentId: "23100001",
        fullName: "Hermione Granger",
        passwordHash: "hash_test_a",
        universityName: "IUBAT",
        emailVerified: true,
        academicProfile: {
          create: {
            targetRole: "aiml",
            degree: "BSc CSE",
            academicYear: "3rd Year",
            semester: "Fall 2026",
            weeklyHours: 12,
          },
        },
        onboardingProgress: {
          create: {
            currentStep: 5,
            completedAt: new Date(),
          },
        },
      },
    });
    studentAId = userA.id;

    // Create Student B (target: frontend, incomplete onboarding)
    const userB = await prisma.user.create({
      data: {
        email: "student_b_test@iubat.edu",
        studentId: "23100002",
        fullName: "Ron Weasley",
        passwordHash: "hash_test_b",
        universityName: "IUBAT",
        emailVerified: true,
        academicProfile: {
          create: {
            targetRole: "frontend",
            degree: "BSc CSE",
            academicYear: "1st Year",
            semester: "Spring 2026",
            weeklyHours: 6,
          },
        },
        onboardingProgress: {
          create: {
            currentStep: 2,
            completedAt: null, // NOT completed onboarding
          },
        },
      },
    });
    studentBId = userB.id;

    // Give Student A skills for AI/ML: Python (level 4) + Data handling (level 2)
    await prisma.userSkill.create({
      data: {
        userId: studentAId,
        skillId: "python",
        level: 4,
        status: "demonstrated",
        confidence: 4,
      },
    });

    await prisma.userSkill.create({
      data: {
        userId: studentAId,
        skillId: "data-handling",
        level: 2,
        status: "developing",
        confidence: 3,
      },
    });

    // Student A attaches evidence to python
    await skillsService.addEvidence(studentAId, "python", {
      url: "https://github.com/hermione/ai-classifier",
      notes: "Production ML model evaluated with cross-validation",
    });

    // Give Student B skills for Frontend: JS (level 2)
    await prisma.userSkill.create({
      data: {
        userId: studentBId,
        skillId: "js-fundamentals",
        level: 2,
        status: "developing",
        confidence: 2,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [studentAId, studentBId] } },
    });
    await prisma.$disconnect();
  });

  it("1. Returns isolated dynamic data for Student A (AIML)", async () => {
    const mapA = await skillsService.getMarauderMap(studentAId);
    expect(mapA.roleId).toBe("aiml");
    expect(mapA.roleTitle).toBe("AI/ML Engineer");
    expect(mapA.isOnboarded).toBe(true);
    expect(mapA.demonstratedCount).toBe(1); // python
    expect(mapA.developingCount).toBe(1);   // data-handling
    expect(mapA.evidenceCount).toBe(1);     // evidence on python
    expect(mapA.evidencePercent).toBeGreaterThan(0);
    expect(mapA.coveragePercent).toBeGreaterThan(0);

    // Starting Gate is completed because Student A is onboarded
    expect(mapA.milestones[0]?.id).toBe("starting-gate");
    expect(mapA.milestones[0]?.status).toBe("completed");
  });

  it("2. Returns isolated dynamic data for Student B (Frontend with incomplete onboarding)", async () => {
    const mapB = await skillsService.getMarauderMap(studentBId);
    expect(mapB.roleId).toBe("frontend");
    expect(mapB.roleTitle).toBe("Frontend Developer");
    expect(mapB.isOnboarded).toBe(false);
    expect(mapB.demonstratedCount).toBe(0);
    expect(mapB.developingCount).toBe(1);   // js-fundamentals
    expect(mapB.evidenceCount).toBe(0);     // no evidence attached

    // Starting Gate is active (NOT completed) because onboarding is incomplete
    expect(mapB.milestones[0]?.id).toBe("starting-gate");
    expect(mapB.milestones[0]?.status).toBe("active");
  });

  it("3. Confirms user isolation: Student A changes do not mutate Student B", async () => {
    // Add a new demonstrated skill to Student A
    await prisma.userSkill.create({
      data: {
        userId: studentAId,
        skillId: "sql",
        level: 4,
        status: "demonstrated",
        confidence: 4,
      },
    });

    const mapAAfter = await skillsService.getMarauderMap(studentAId);
    const mapBAfter = await skillsService.getMarauderMap(studentBId);

    expect(mapAAfter.demonstratedCount).toBe(2);
    expect(mapBAfter.demonstratedCount).toBe(0); // completely untouched
  });

  it("4. Target career can be switched dynamically", async () => {
    // Query Student A's map for Software Engineer role without modifying default profile
    const sweMapA = await skillsService.getMarauderMap(studentAId, "swe");
    expect(sweMapA.roleId).toBe("swe");
    expect(sweMapA.roleTitle).toBe("Software Engineer");
    expect(sweMapA.details.some((d) => d.skillId === "problem-solving")).toBe(true);
  });

  it("5. Attaching evidence does NOT falsely mark a skill as verified", async () => {
    const evidence = await prisma.skillEvidence.findFirst({
      where: { userId: studentAId, skillId: "python" },
    });
    expect(evidence).toBeDefined();
    expect(evidence?.verified).toBe(false); // strictly unverified proof
  });
});
