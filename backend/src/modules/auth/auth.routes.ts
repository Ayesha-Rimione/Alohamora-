import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authLimiter } from "../../middleware/rateLimit";
import { requireAuth, optionalAuth } from "../../middleware/auth";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  authController.register,
);

router.post(
  "/verify-email",
  authLimiter,
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail,
);

router.post(
  "/resend-code",
  authLimiter,
  validate({ body: resendCodeSchema }),
  authController.resendCode,
);

router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  authController.login,
);

router.post("/logout", authController.logout);

router.post(
  "/forgot-password",
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  authLimiter,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

router.get("/me", optionalAuth, authController.me);

export default router;

