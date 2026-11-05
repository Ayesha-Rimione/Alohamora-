import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import {
  computeSkillCoverage,
  generateMarauderMapMilestones,
  LEVEL_TO_STATUS,
  STATUS_TO_LEVEL,
  type SkillStatus,
} from "../../utils/coverage";
import type { UpdateSkillInput, AddEvidenceInput } from "./skills.schemas";

export class SkillsService {
  async getRoles() {
    const roles = await prisma.careerRole.findMany({
      include: {
        requirements: {
          select: { skillId: true, weight: true, targetLevel: true },
        },
      },
    });

    return roles.map((r) => ({
      id: r.id,
      title: r.title,
      blurb: r.blurb,
      requiredSkills: r.requirements.map((req) => req.skillId),
      required: r.requirements.map((req) => req.skillId),
    }));
  }

  async getRole(id: string) {
    const role = await prisma.careerRole.findUnique({
      where: { id },
      include: {
        requirements: {
          include: { skill: true },
        },
      },
    });

    if (!role) {
      throw new AppError("not_found", `Role '${id}' not found`, 404);
    }

    return {
      id: role.id,
      title: role.title,
      blurb: role.blurb,
      requiredSkills: role.requirements.map((req) => req.skillId),
      required: role.requirements.map((req) => req.skillId),
      skills: role.requirements.map((req) => ({
        id: req.skill.id,
        name: req.skill.name,
        category: req.skill.category,
        description: req.skill.description,
        weight: req.weight,
        targetLevel: req.targetLevel,
      })),
    };
  }

  async getUserSkills(userId: string) {
    const skills = await prisma.userSkill.findMany({
      where: { userId },
      include: { evidences: true },
    });

    const result: Record<
      string,
      {
        level: number;
        status: SkillStatus;
        confidence: number;
        evidence: string;
        evidences: Array<{ id: string; url: string; notes?: string | null; verified: boolean; submittedAt: Date }>;
      }
    > = {};

    for (const s of skills) {
      result[s.skillId] = {
        level: s.level,
        status: (s.status as SkillStatus) || LEVEL_TO_STATUS[s.level] || "missing",
        confidence: s.confidence,
        evidence: s.evidenceSummary || s.evidences[0]?.url || "",
        evidences: s.evidences.map((e) => ({
          id: e.id,
          url: e.url,
          notes: e.notes,
          verified: e.verified,
          submittedAt: e.submittedAt,
        })),
      };
    }

    return result;
  }

  async updateUserSkill(userId: string, skillId: string, input: UpdateSkillInput) {
    let level = input.level;
    let status = input.status;

    if (level !== undefined && !status) {
      status = LEVEL_TO_STATUS[level] || "missing";
    } else if (status && level === undefined) {
      level = STATUS_TO_LEVEL[status] || 0;
    }

    const updated = await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: {
        userId,
        skillId,
        level: level ?? 0,
        status: status ?? "missing",
        confidence: input.confidence ?? 3,
        evidenceSummary: input.evidence ?? "",
      },
      update: {
        ...(level !== undefined ? { level } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
        ...(input.evidence !== undefined ? { evidenceSummary: input.evidence } : {}),
      },
      include: { evidences: true },
    });

    return {
      level: updated.level,
      status: updated.status as SkillStatus,
      confidence: updated.confidence,
      evidence: updated.evidenceSummary || "",
    };
  }

  async addEvidence(userId: string, skillId: string, input: AddEvidenceInput) {
    const userSkill = await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: {
        userId,
        skillId,
        level: 2,
        status: "developing",
        confidence: 3,
        evidenceSummary: input.url,
      },
      update: {},
    });

    const evidence = await prisma.skillEvidence.create({
      data: {
        userId,
        userSkillId: userSkill.id,
        skillId,
        url: input.url,
        notes: input.notes,
        verified: false, // Transparent: unverified self-submission until verified review
      },
    });

    return {
      id: evidence.id,
      skillId: evidence.skillId,
      url: evidence.url,
      notes: evidence.notes ?? undefined,
      submittedAt: evidence.submittedAt.toISOString(),
      verified: evidence.verified,
    };
  }

  async deleteEvidence(userId: string, evidenceId: string) {
    const ev = await prisma.skillEvidence.findUnique({ where: { id: evidenceId } });
    if (!ev) {
      throw new AppError("not_found", "Evidence item not found", 404);
    }
    if (ev.userId !== userId) {
      throw new AppError("forbidden", "You do not own this evidence artifact", 403);
    }

    await prisma.skillEvidence.delete({ where: { id: evidenceId } });
  }

  async getMarauderMap(userId: string, requestedRoleId?: string) {
    const profile = await prisma.academicProfile.findUnique({ where: { userId } });
    const targetRoleId = requestedRoleId || profile?.targetRole || "aiml";

    const role = await prisma.careerRole.findUnique({
      where: { id: targetRoleId },
      include: {
        requirements: {
          include: { skill: true },
        },
      },
    });

    if (!role) {
      throw new AppError("not_found", `Role '${targetRoleId}' not found`, 404);
    }

    const userSkills = await prisma.userSkill.findMany({ where: { userId } });
    const assessedMap: Record<string, { level: number; status: SkillStatus; confidence: number }> = {};

    for (const us of userSkills) {
      assessedMap[us.skillId] = {
        level: us.level,
        status: us.status as SkillStatus,
        confidence: us.confidence,
      };
    }

    const requirements = role.requirements.map((r) => ({
      skillId: r.skillId,
      weight: r.weight,
      targetLevel: r.targetLevel,
    }));

    const coverage = computeSkillCoverage(requirements, assessedMap);
    const { currentMilestoneIndex, milestones } = generateMarauderMapMilestones(
      role.requirements.map((r) => r.skillId),
      coverage,
    );

    // Identify first recommended quest (first missing or developing skill)
    let firstQuest: { skillId: string; name: string; quest: string } | null = null;
    for (const detail of coverage.details) {
      if (detail.status === "missing" || detail.status === "developing") {
        const skill = role.requirements.find((r) => r.skillId === detail.skillId)?.skill;
        if (skill) {
          firstQuest = {
            skillId: skill.id,
            name: skill.name,
            quest: `Submit verifiable evidence for ${skill.name} to advance your Marauder Map.`,
          };
          break;
        }
      }
    }

    return {
      roleId: role.id,
      roleTitle: role.title,
      coveragePercent: coverage.percent,
      demonstratedCount: coverage.demonstratedCount,
      developingCount: coverage.developingCount,
      missingCount: coverage.missingCount,
      currentMilestoneIndex,
      milestones,
      firstQuest,
      details: coverage.details,
    };
  }
}

export const skillsService = new SkillsService();

