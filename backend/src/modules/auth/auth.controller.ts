import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { env } from "../../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.verifyEmail(req.body);
      res.cookie(env.SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async resendCode(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resendCode(req.body.email);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie(env.SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie(env.SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(200).json(null);
      }
      const user = await authService.getCurrentUser(req.user.id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

