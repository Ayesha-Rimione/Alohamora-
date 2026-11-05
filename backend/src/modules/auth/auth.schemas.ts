import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  university: z.string().trim().min(2, "University is required"),
  email: z.string().trim().email("Please provide a valid university email address").toLowerCase(),
  studentId: z.string().trim().min(3, "Student ID must be at least 3 characters").max(30),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or student ID"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const resendCodeSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, "Invalid reset token"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

