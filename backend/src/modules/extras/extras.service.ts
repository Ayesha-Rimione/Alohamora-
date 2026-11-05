import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import type {
  OpportunityFilter,
  ResourceFilter,
  AddBookmarkInput,
  DeadlineInput,
  UpdateDeadlineInput,
  PlanSettingsInput,
} from "./extras.schemas";

// ============================================================
// Opportunities
// ============================================================
export async function getOpportunities(filters: OpportunityFilter) {
  const { type, q, role, location, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (type && type !== "all") where.type = type;
  if (role) where.role = role;
  if (location) where.location = { contains: location };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { company: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return {
    items: opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      company: o.company,
      role: o.role,
      type: o.type,
      location: o.location,
      stipend: o.stipend,
      deadline: o.deadline,
      isDemo: o.isDemo, // Always transparently labelled
      description: o.description,
      tags: o.tagsJson ? JSON.parse(o.tagsJson) : [],
      link: o.link,
    })),
    total,
    page,
    limit,
  };
}

// ============================================================
// Learning Resources
// ============================================================
export async function getResources(filters: ResourceFilter) {
  const { tag, price, type, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (price && price !== "all") where.price = price;
  if (type) where.type = type;

  let resources = await prisma.learningResource.findMany({
    where,
    skip,
    take: limit + 50, // over-fetch for tag filtering
    orderBy: { createdAt: "desc" },
  });

  if (tag) {
    resources = resources.filter((r) => {
      if (!r.tagsJson) return false;
      const tags: string[] = JSON.parse(r.tagsJson);
      return tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()));
    });
  }

  return resources.slice(0, limit).map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    provider: r.provider,
    type: r.type,
    price: r.price,
    isSponsored: r.isSponsored, // Transparently labelled
    sponsorName: r.sponsorName,
    tags: r.tagsJson ? JSON.parse(r.tagsJson) : [],
  }));
}

// ============================================================
// Bookmarks
// ============================================================
export async function addBookmark(userId: string, input: AddBookmarkInput) {
  return prisma.bookmark.upsert({
    where: { userId_itemId: { userId, itemId: input.itemId } },
    create: { userId, itemId: input.itemId, itemType: input.itemType },
    update: { itemType: input.itemType },
  });
}

export async function removeBookmark(userId: string, itemId: string) {
  const bm = await prisma.bookmark.findUnique({
    where: { userId_itemId: { userId, itemId } },
  });
  if (!bm) throw new AppError("not_found", "Bookmark not found", 404);

  await prisma.bookmark.delete({ where: { userId_itemId: { userId, itemId } } });
}

export async function getUserBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================================
// Deadlines
// ============================================================
export async function getDeadlines(userId: string) {
  const deadlines = await prisma.deadline.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  return deadlines;
}

export async function addDeadline(userId: string, input: DeadlineInput) {
  return prisma.deadline.create({
    data: { userId, ...input },
  });
}

export async function updateDeadline(
  userId: string,
  id: string,
  patch: UpdateDeadlineInput,
) {
  const dl = await prisma.deadline.findUnique({ where: { id } });
  if (!dl) throw new AppError("not_found", "Deadline not found", 404);
  if (dl.userId !== userId)
    throw new AppError("forbidden", "Not your deadline", 403);

  return prisma.deadline.update({ where: { id }, data: patch });
}

export async function deleteDeadline(userId: string, id: string) {
  const dl = await prisma.deadline.findUnique({ where: { id } });
  if (!dl) throw new AppError("not_found", "Deadline not found", 404);
  if (dl.userId !== userId)
    throw new AppError("forbidden", "Not your deadline", 403);

  await prisma.deadline.delete({ where: { id } });
}

// ============================================================
// Activity (Comeback Codex)
// ============================================================
export async function getActivity(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [tasksDone, totalMessages] = await Promise.all([
    prisma.learningTask.count({ where: { done: true, plan: { userId } } }),
    prisma.chatMessage.count({
      where: { role: "user", session: { userId, updatedAt: { gte: thirtyDaysAgo } } },
    }),
  ]);

  // Derive activity signals honestly — no fabricated streaks
  const estimatedWeeklyHours = Math.min(Math.round(totalMessages * 0.5), 40);

  return {
    weeklyHours: estimatedWeeklyHours,
    streakDays: null, // Honest: streak not tracked yet — pending Phase 7 implementation
    completedQuests: tasksDone,
    message:
      "Activity indicators are derived from your actual chat usage and completed plan tasks — not fabricated streaks.",
  };
}

// ============================================================
// Learning Plans (Potion Lab)
// ============================================================
export async function getPlan(
  userId: string,
  roleId: string,
  hoursPerWeek: number,
) {
  // Check if a plan already exists for this user + role
  let plan = await prisma.learningPlan.findFirst({
    where: { userId, roleId },
    include: { tasks: { orderBy: [{ week: "asc" }, { orderIndex: "asc" }] } },
  });

  if (!plan) {
    plan = await generatePlan(userId, roleId, hoursPerWeek);
  }

  return {
    planId: plan.id,
    roleId: plan.roleId,
    hoursPerWeek: plan.hoursPerWeek,
    tasks: plan.tasks.map((t) => ({
      id: t.id,
      week: t.week,
      title: t.title,
      skill: t.skillId || "",
      hours: t.hours,
      done: t.done,
    })),
  };
}

async function generatePlan(userId: string, roleId: string, hoursPerWeek: number) {
  const role = await prisma.careerRole.findUnique({
    where: { id: roleId },
    include: { requirements: { include: { skill: true } } },
  });
  if (!role) throw new AppError("not_found", "Role not found", 404);

  const plan = await prisma.learningPlan.create({
    data: { userId, roleId, hoursPerWeek },
  });

  const tasks: Array<{
    planId: string;
    week: number;
    title: string;
    skillId: string;
    hours: number;
    orderIndex: number;
  }> = [];

  let week = 1;
  for (const [i, req] of role.requirements.entries()) {
    const skill = req.skill;
    tasks.push(
      {
        planId: plan.id,
        week,
        title: `Study ${skill.name} — concepts and theory`,
        skillId: skill.id,
        hours: Math.max(1, Math.floor(hoursPerWeek * 0.4)),
        orderIndex: 0,
      },
      {
        planId: plan.id,
        week,
        title: `Practice ${skill.name} — hands-on quest`,
        skillId: skill.id,
        hours: Math.max(1, Math.floor(hoursPerWeek * 0.6)),
        orderIndex: 1,
      },
    );
    if ((i + 1) % 2 === 0) week++;
  }

  await prisma.learningTask.createMany({ data: tasks });

  return prisma.learningPlan.findUniqueOrThrow({
    where: { id: plan.id },
    include: { tasks: { orderBy: [{ week: "asc" }, { orderIndex: "asc" }] } },
  });
}

export async function toggleTask(userId: string, taskId: string, done: boolean) {
  const task = await prisma.learningTask.findUnique({
    where: { id: taskId },
    include: { plan: true },
  });
  if (!task) throw new AppError("not_found", "Task not found", 404);
  if (task.plan.userId !== userId)
    throw new AppError("forbidden", "Not your task", 403);

  const updated = await prisma.learningTask.update({
    where: { id: taskId },
    data: { done },
  });
  return { id: updated.id, done: updated.done };
}

export async function updatePlanSettings(
  userId: string,
  input: PlanSettingsInput,
) {
  const plan = await prisma.learningPlan.findFirst({
    where: { userId, roleId: input.roleId || undefined },
  });
  if (plan) {
    await prisma.learningPlan.update({
      where: { id: plan.id },
      data: { hoursPerWeek: input.hoursPerWeek },
    });
  }
  // Update profile weekly hours too
  await prisma.academicProfile.upsert({
    where: { userId },
    create: { userId, weeklyHours: input.hoursPerWeek },
    update: { weeklyHours: input.hoursPerWeek },
  });
  return { success: true };
}

