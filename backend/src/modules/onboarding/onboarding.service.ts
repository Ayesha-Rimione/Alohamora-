import { prisma } from "../../config/prisma";
import { LEVEL_TO_STATUS } from "../../utils/coverage";
import type { SaveOnboardingInput } from "./onboarding.schemas";

export class OnboardingService {
  async getOnboardingState(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        academicProfile: true,
        courses: { orderBy: { createdAt: "asc" } },
        userSkills: { include: { evidences: true } },
      },
    });

    if (!user) return null;

    const p = user.academicProfile;

    const skillsMap: Record<
      string,
      { level: number; status: string; confidence: number; evidence: string }
    > = {};

    for (const us of user.userSkills) {
      skillsMap[us.skillId] = {
        level: us.level,
        status: us.status,
        confidence: us.confidence,
        evidence: us.evidenceSummary || us.evidences[0]?.url || "",
      };
    }

    return {
      profile: {
        name: user.fullName,
        studentId: user.studentId,
        university: user.universityName,
        degree: p?.degree ?? "",
        academicYear: p?.academicYear ?? "",
        semester: p?.semester ?? "",
        weeklyHours: p?.weeklyHours ?? 8,
        targetRole: p?.targetRole ?? "",
        links: p?.links ?? "",
      },
      courses: user.courses.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade: c.grade,
        semester: c.semesterName,
        confidence: c.confidence,
      })),
      skills: skillsMap,
      targetCgpa: p?.targetCgpa ?? 0,
      upcomingCredits: p?.upcomingCredits ?? 0,
      onboarded: p?.onboarded ?? false,
    };
  }

  async saveOnboardingState(userId: string, input: SaveOnboardingInput) {
    // 1. Update User if name or university provided
    if (input.name || input.university) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(input.name ? { fullName: input.name } : {}),
          ...(input.university ? { universityName: input.university } : {}),
        },
      });
    }

    // 2. Upsert AcademicProfile
    await prisma.academicProfile.upsert({
      where: { userId },
      create: {
        userId,
        degree: input.degree ?? "",
        academicYear: input.academicYear ?? "",
        semester: input.semester ?? "",
        weeklyHours: input.weeklyHours ?? 8,
        targetRole: input.targetRole ?? "",
        links: input.links ?? "",
        targetCgpa: input.targetCgpa ?? 0,
        upcomingCredits: input.upcomingCredits ?? 0,
        onboarded: Boolean(input.finish),
      },
      update: {
        ...(input.degree !== undefined ? { degree: input.degree } : {}),
        ...(input.academicYear !== undefined ? { academicYear: input.academicYear } : {}),
        ...(input.semester !== undefined ? { semester: input.semester } : {}),
        ...(input.weeklyHours !== undefined ? { weeklyHours: input.weeklyHours } : {}),
        ...(input.targetRole !== undefined ? { targetRole: input.targetRole } : {}),
        ...(input.links !== undefined ? { links: input.links } : {}),
        ...(input.targetCgpa !== undefined ? { targetCgpa: input.targetCgpa } : {}),
        ...(input.upcomingCredits !== undefined ? { upcomingCredits: input.upcomingCredits } : {}),
        ...(input.finish !== undefined ? { onboarded: input.finish } : {}),
      },
    });

    // 3. Upsert Courses if provided
    if (input.courses && input.courses.length > 0) {
      for (const c of input.courses) {
        const existing = await prisma.course.findFirst({
          where: { userId, code: c.code.toUpperCase() },
        });

        if (existing) {
          await prisma.course.update({
            where: { id: existing.id },
            data: {
              name: c.name,
              credits: c.credits,
              grade: c.grade.toUpperCase(),
              semesterName: c.semester ?? existing.semesterName,
              confidence: c.confidence ?? existing.confidence,
            },
          });
        } else {
          await prisma.course.create({
            data: {
              userId,
              code: c.code.toUpperCase(),
              name: c.name,
              credits: c.credits,
              grade: c.grade.toUpperCase(),
              semesterName: c.semester ?? "Term 1",
              confidence: c.confidence ?? 3,
            },
          });
        }
      }
    }

    // 4. Upsert Skills & Evidence if provided
    if (input.skills) {
      for (const [skillId, s] of Object.entries(input.skills)) {
        const status = s.status || LEVEL_TO_STATUS[s.level] || "missing";
        const userSkill = await prisma.userSkill.upsert({
          where: { userId_skillId: { userId, skillId } },
          create: {
            userId,
            skillId,
            level: s.level,
            status,
            confidence: s.confidence ?? 3,
            evidenceSummary: s.evidence ?? "",
          },
          update: {
            level: s.level,
            status,
            confidence: s.confidence ?? 3,
            evidenceSummary: s.evidence ?? "",
          },
        });

        if (s.evidence && s.evidence.trim().startsWith("http")) {
          const existingEv = await prisma.skillEvidence.findFirst({
            where: { userId, skillId, url: s.evidence.trim() },
          });
          if (!existingEv) {
            await prisma.skillEvidence.create({
              data: {
                userId,
                skillId,
                userSkillId: userSkill.id,
                url: s.evidence.trim(),
                notes: "Submitted during onboarding",
                verified: false,
              },
            });
          }
        }
      }
    }

    return this.getOnboardingState(userId);
  }
}

export const onboardingService = new OnboardingService();

