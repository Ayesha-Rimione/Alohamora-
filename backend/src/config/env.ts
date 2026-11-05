import dotenv from "dotenv";
import { z } from "zod";

// Load .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_PREFIX: z.string().default("/api/v1"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().default("mysql://root:password@localhost:3306/alohomora_db"),
  SESSION_SECRET: z.string().min(16).default("dev-session-secret-min-32-chars-long-alohomora-keykeeper"),
  SESSION_COOKIE_NAME: z.string().default("alohomora_session"),
  SESSION_MAX_AGE_DAYS: z.coerce.number().default(7),
  GROQ_API_KEY: z.string().optional().default(""),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().default("Alohomora! Keykeeper <no-reply@alohomora.edu.bd>"),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_DIR: z.string().default("./uploads"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

