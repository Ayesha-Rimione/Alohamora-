import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().trim().min(2, "Course code required").max(20),
  name: z.string().trim().min(2, "Course name required").max(100),
  credits: z.coerce.number().min(0.5).max(12),
  grade: z.string().trim().min(1, "Grade letter required").max(5),
  semester: z.string().trim().min(1).default("Current"),
  confidence: z.coerce.number().min(1).max(5).default(3),
});

export const updateCourseSchema = courseSchema.partial();

export const semesterSchema = z.object({
  name: z.string().trim().min(2, "Semester name required"),
  term: z.string().optional(),
  year: z.coerce.number().optional(),
  orderIndex: z.coerce.number().default(0),
});

export const targetCgpaSchema = z.object({
  targetCgpa: z.coerce.number().min(0).max(4.0),
  upcomingCredits: z.coerce.number().min(1).max(200).default(15),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  degree: z.string().trim().optional(),
  academicYear: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  weeklyHours: z.coerce.number().min(1).max(80).optional(),
  targetRole: z.string().trim().optional(),
  links: z.string().trim().optional(),
  targetCgpa: z.coerce.number().min(0).max(4.0).optional(),
  upcomingCredits: z.coerce.number().min(0).max(200).optional(),
  onboarded: z.boolean().optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type SemesterInput = z.infer<typeof semesterSchema>;
export type TargetCgpaInput = z.infer<typeof targetCgpaSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

