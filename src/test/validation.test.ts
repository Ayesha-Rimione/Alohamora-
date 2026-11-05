import { describe, expect, it } from "vitest";

import {
  passwordStrength,
  validatePassword,
  validateStudentId,
  validateUniversityEmail,
} from "@/lib/api/validation";

// Registration rules from the auth spec: institutional emails only,
// digits-only student IDs and 8+ character passwords.
describe("registration validation", () => {
  const IUBAT = "IUBAT — International University of Business Agriculture and Technology";

  it("rejects personal mailbox domains with the required message", () => {
    expect(validateUniversityEmail("student@gmail.com", IUBAT)).toBe(
      "Please use your university email address.",
    );
    expect(validateUniversityEmail("student@yahoo.com", IUBAT)).toBe(
      "Please use your university email address.",
    );
    expect(validateUniversityEmail("student@outlook.com", IUBAT)).toBe(
      "Please use your university email address.",
    );
  });

  it("accepts an address on the university's allowed domain", () => {
    expect(validateUniversityEmail("ayesha@iubat.edu", IUBAT)).toBeNull();
  });

  it("rejects addresses outside the selected university's domains", () => {
    expect(validateUniversityEmail("ayesha@buet.ac.bd", IUBAT)).toContain("IUBAT");
  });

  it("rejects malformed addresses", () => {
    expect(validateUniversityEmail("not-an-email", IUBAT)).toContain("valid email");
  });

  it("requires 6–12 digits for the student ID", () => {
    expect(validateStudentId("12345")).toContain("6–12");
    expect(validateStudentId("1234567890123")).toContain("6–12");
    expect(validateStudentId("1234ab")).toContain("6–12");
    expect(validateStudentId("2210001")).toBeNull();
  });

  it("requires at least 8 characters for the password", () => {
    expect(validatePassword("short")).toContain("at least 8");
    expect(validatePassword("longenough1")).toBeNull();
  });

  it("scores password strength upward for stronger passwords", () => {
    expect(passwordStrength("abc").label).toBe("Weak");
    expect(passwordStrength("Str0ng!Pass").label).toBe("Strong");
    expect(passwordStrength("Str0ng!Pass").score).toBeGreaterThan(passwordStrength("abc").score);
  });
});
