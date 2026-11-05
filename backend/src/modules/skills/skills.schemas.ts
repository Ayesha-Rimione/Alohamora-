import { z } from "zod";

export const updateSkillSchema = z.object({
  level: z.coerce.number().min(0).max(4).optional(),
  status: z.enum(["demonstrated", "developing", "missing"]).optional(),
  confidence: z.coerce.number().min(0).max(5).optional(),
  evidence: z.string().optional(),
});

export const addEvidenceSchema = z.object({
  url: z.string().trim().url("Please provide a valid URL for your evidence artifact"),
  notes: z.string().trim().optional(),
});

export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type AddEvidenceInput = z.infer<typeof addEvidenceSchema>;

