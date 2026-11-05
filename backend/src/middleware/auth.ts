import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { verifySessionToken } from "../utils/tokens";
import { AppError } from "./error";

export interface AuthenticatedUser {
  id: string;
  email: string;
  studentId: string;
  fullName: string;
  universityName: string;
  emailVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[env.SESSION_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      throw new AppError("unauthorized", "Authentication required. Please log in.", 401);
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      res.clearCookie(env.SESSION_COOKIE_NAME);
      throw new AppError("unauthorized", "Session expired or invalid. Please log in again.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        studentId: true,
        fullName: true,
        universityName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      res.clearCookie(env.SESSION_COOKIE_NAME);
      throw new AppError("unauthorized", "User account no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[env.SESSION_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      return next();
    }

    const payload = verifySessionToken(token);
    if (!payload) return next();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        studentId: true,
        fullName: true,
        universityName: true,
        emailVerified: true,
      },
    });

    if (user) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}

