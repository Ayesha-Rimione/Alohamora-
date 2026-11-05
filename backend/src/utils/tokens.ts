import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface SessionPayload {
  userId: string;
  email: string;
  studentId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.SESSION_SECRET, {
    expiresIn: `${env.SESSION_MAX_AGE_DAYS}d`,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.SESSION_SECRET) as SessionPayload;
    if (!decoded || !decoded.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

