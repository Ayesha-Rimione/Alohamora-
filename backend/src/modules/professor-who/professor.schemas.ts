import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(4000),
  sessionId: z.string().optional(),
  courseContext: z.string().optional(),
  roleContext: z.string().optional(),
  course: z.string().optional(), // compatibility with API_CONTRACT { courseContext: "CSE 331" }
  role: z.string().optional(),
});

export const createSessionSchema = z.object({
  title: z.string().trim().min(1).max(100).default("New Study Session"),
  courseContext: z.string().optional(),
  roleContext: z.string().optional(),
});

export const renameSessionSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(100),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type RenameSessionInput = z.infer<typeof renameSessionSchema>;

