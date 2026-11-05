import { z } from "zod";

// ---------- Opportunities ----------
export const opportunityFilterSchema = z.object({
  type: z.enum(["internship", "entry", "all"]).optional(),
  q: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// ---------- Resources ----------
export const resourceFilterSchema = z.object({
  tag: z.string().optional(),
  price: z.enum(["Free", "Paid", "all"]).optional(),
  type: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// ---------- Bookmarks ----------
export const addBookmarkSchema = z.object({
  itemId: z.string().trim().min(1),
  itemType: z.enum(["opportunity", "resource"]),
});

// ---------- Deadlines ----------
export const deadlineSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  course: z.string().trim().min(1, "Course is required"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().optional().default("23:59"),
  type: z.enum(["assignment", "quiz", "exam", "project", "lab", "other"]).default("assignment"),
  notes: z.string().optional(),
});

export const updateDeadlineSchema = deadlineSchema.partial().extend({
  status: z.enum(["pending", "completed", "overdue"]).optional(),
});

// ---------- Learning Plans ----------
export const planSettingsSchema = z.object({
  hoursPerWeek: z.coerce.number().min(1).max(80),
  roleId: z.string().optional(),
  variant: z.string().optional(),
});

export const toggleTaskSchema = z.object({
  done: z.boolean(),
});

export type OpportunityFilter = z.infer<typeof opportunityFilterSchema>;
export type ResourceFilter = z.infer<typeof resourceFilterSchema>;
export type AddBookmarkInput = z.infer<typeof addBookmarkSchema>;
export type DeadlineInput = z.infer<typeof deadlineSchema>;
export type UpdateDeadlineInput = z.infer<typeof updateDeadlineSchema>;
export type PlanSettingsInput = z.infer<typeof planSettingsSchema>;

