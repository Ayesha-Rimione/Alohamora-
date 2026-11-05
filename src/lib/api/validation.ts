// Pure registration-validation helpers (no React, no network) so they can be
// unit-tested and reused by both the register form and the API layer.
import { findUniversity, type University } from "@/config/universities";

/** Consumer mailbox providers that must never be accepted for registration. */
export const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
];

export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

/** Returns an error message, or null when the address is acceptable. */
export function validateUniversityEmail(email: string, universityName: string): string | null {
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  const domain = emailDomain(trimmed);
  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return "Please use your university email address.";
  }
  const university = findUniversity(universityName);
  if (university && !university.emailDomains.includes(domain)) {
    return `Use your ${university.name} email address (e.g. you@${university.emailDomains[0]}).`;
  }
  return null;
}

/** Student IDs: digits only, 6–12 characters. */
export function validateStudentId(id: string): string | null {
  if (!/^\d{6,12}$/.test(id.trim())) {
    return "Student ID must be 6–12 digits (numbers only).";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}

/** 0–4 strength score with a plain-language label for the meter. */
export function passwordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "" };
  let points = 0;
  if (password.length >= 8) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) points += 1;
  const score = Math.min(4, points);
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"] as const;
  return { score, label: labels[score] ?? "Weak" };
}
