import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";

export class AppError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(code: string, message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: "validation",
      message: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      details: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Handle Prisma unique constraint error
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      const field = prismaErr.meta?.target?.join(", ") || "field";
      return res.status(409).json({
        code: "conflict",
        message: `A record with this ${field} already exists.`,
      });
    }
  }

  // Catch-all
  console.error("Unhandled server error:", err);

  const isProd = env.NODE_ENV === "production";
  return res.status(500).json({
    code: "internal_error",
    message: isProd ? "An internal server error occurred." : (err as Error)?.message || "Internal server error",
  });
}

