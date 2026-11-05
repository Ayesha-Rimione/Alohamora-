import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "test" ? 1000 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "rate_limited",
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "test" ? 5000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "rate_limited",
    message: "Request limit exceeded. Please slow down.",
  },
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.NODE_ENV === "test" ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "rate_limited",
    message: "Professor Who? needs a short moment to breathe. Please wait a minute.",
  },
});

