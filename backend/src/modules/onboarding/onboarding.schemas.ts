import { z } from "zod";

export const saveOnboardingSchema = z.object({
  step: z.number().int().min(0).max(5).optional(),
  name: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  university: z.string().trim().optional(),
  degree: z.string().trim().optional(),
  academicYear: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  weeklyHours: z.coerce.number().min(1).max(80).optional(),
  targetRole: z.string().trim().optional(),
  links: z.string().trim().optional(),
  targetCgpa: z.coerce.number().min(0).max(4.0).optional(),
  upcomingCredits: z.coerce.number().min(0).max(200).optional(),
  courses: z
    .array(
      z.object({
        code: z.string().trim(),
        name: z.string().trim(),
        credits: z.coerce.number(),
        grade: z.string().trim(),
        semester: z.string().trim().optional(),
        confidence: z.coerce.number().optional(),
      }),
    )
    .optional(),
  skills: z
    .record(
      z.object({
        level: z.coerce.number().min(0).max(4),
        status: z.enum(["demonstrated", "developing", "missing"]).optional(),
        confidence: z.coerce.number().min(0).max(5).optional(),
        evidence: z.string().optional(),
      }),
    )
    .optional(),
  finish: z.boolean().optional(),
});

export type SaveOnboardingInput = z.infer<typeof saveOnboardingSchema>;

