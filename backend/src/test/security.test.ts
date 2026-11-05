import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateVerificationCode } from "../utils/password";
import { signSessionToken, verifySessionToken } from "../utils/tokens";

describe("hashPassword / verifyPassword", () => {
  it("hashes and verifies a password correctly", async () => {
    const plain = "StrongTestPassword123!";
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(await verifyPassword(plain, hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correctPassword");
    expect(await verifyPassword("wrongPassword", hash)).toBe(false);
  });
});

describe("generateVerificationCode", () => {
  it("produces a 6-digit string", () => {
    for (let i = 0; i < 10; i++) {
      const code = generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });

  it("produces different codes each time (probabilistic)", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateVerificationCode()));
    expect(codes.size).toBeGreaterThan(5);
  });
});

describe("signSessionToken / verifySessionToken", () => {
  it("encodes and decodes a session payload", () => {
    const payload = { userId: "usr_test123", email: "test@uni.edu", studentId: "12345" };
    const token = signSessionToken(payload);
    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
  });

  it("returns null for invalid tokens", () => {
    expect(verifySessionToken("not.a.valid.jwt")).toBeNull();
    expect(verifySessionToken("")).toBeNull();
  });

  it("returns null for tampered tokens", () => {
    const token = signSessionToken({ userId: "u1", email: "e@e.com", studentId: "s1" });
    const tampered = token.slice(0, -5) + "xxxxx";
    expect(verifySessionToken(tampered)).toBeNull();
  });
});

