import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema,
} from "../modules/auth/auth.schemas";

describe("registerSchema", () => {
  it("rejects short names", () => {
    const result = registerSchema.safeParse({
      fullName: "A", email: "a@uni.edu", studentId: "12345", password: "Password1!",
      university: "Test University",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      fullName: "Ayesha Rahman", email: "not-an-email", studentId: "12345",
      password: "Password1!", university: "Test University",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = registerSchema.safeParse({
      fullName: "Ayesha Rahman", email: "ayesha@iubat.edu", studentId: "12345",
      password: "short", university: "Test University",
    });
    expect(result.success).toBe(false);
  });

  it("normalises email to lowercase", () => {
    const result = registerSchema.safeParse({
      fullName: "Ayesha Rahman", email: "AYESHA@IUBAT.EDU", studentId: "2210001",
      password: "StrongPass1!", university: "IUBAT",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ayesha@iubat.edu");
    }
  });
});

describe("loginSchema", () => {
  it("accepts email identifier", () => {
    const result = loginSchema.safeParse({ identifier: "user@uni.edu", password: "pass123" });
    expect(result.success).toBe(true);
  });

  it("accepts student ID identifier", () => {
    const result = loginSchema.safeParse({ identifier: "2210001", password: "pass123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty identifier", () => {
    const result = loginSchema.safeParse({ identifier: "", password: "pass123" });
    expect(result.success).toBe(false);
  });
});

describe("verifyEmailSchema", () => {
  it("accepts valid 6-digit code", () => {
    const result = verifyEmailSchema.safeParse({ email: "a@b.com", code: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects codes that are not 6 digits", () => {
    const r1 = verifyEmailSchema.safeParse({ email: "a@b.com", code: "12345" });
    const r2 = verifyEmailSchema.safeParse({ email: "a@b.com", code: "abcdef" });
    expect(r1.success).toBe(false);
    expect(r2.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects short new passwords", () => {
    const result = resetPasswordSchema.safeParse({ token: "abc123longtoken", newPassword: "abc" });
    expect(result.success).toBe(false);
  });

  it("accepts valid reset payload", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123longtokenhere", newPassword: "NewPass1234!",
    });
    expect(result.success).toBe(true);
  });
});

