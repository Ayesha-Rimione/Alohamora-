import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateVerificationCode(): string {
  // 6-digit random number string
  return Math.floor(100000 + Math.random() * 900000).toString();
}

