import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error";
import { apiLimiter } from "./middleware/rateLimit";

// Route modules
import authRoutes from "./modules/auth/auth.routes";
import academicRoutes from "./modules/academic/academic.routes";
import onboardingRoutes from "./modules/onboarding/onboarding.routes";
import skillsRoutes from "./modules/skills/skills.routes";
import professorRoutes from "./modules/professor-who/professor.routes";
import extrasRoutes from "./modules/extras/extras.routes";

const app = express();

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [env.CLIENT_ORIGIN, "http://localhost:5173", "http://localhost:8080", "http://localhost:3000"];

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);
      if (
        allowedOrigins.includes(requestOrigin) ||
        (env.NODE_ENV === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${requestOrigin}`));
    },
    credentials: true, // Required for HttpOnly cookie passthrough
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Global rate limit ───────────────────────────────────────
app.use(apiLimiter);

// ─── Health check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Alohomora! Backend",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────────
const PREFIX = env.API_PREFIX; // defaults to "/api/v1"

app.use(`${PREFIX}/auth`, authRoutes);
app.use(PREFIX, academicRoutes);   // /me, /courses, /semesters, /me/cgpa
app.use(PREFIX, onboardingRoutes); // /onboarding
app.use(PREFIX, skillsRoutes);     // /roles, /me/skills, /me/map, /evidence
app.use(PREFIX, professorRoutes);  // /chat, /chat/sessions
app.use(PREFIX, extrasRoutes);     // /opportunities, /resources, /bookmarks, /me/deadlines, /me/plan

// ─── 404 fallback ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ code: "not_found", message: "API endpoint not found." });
});

// ─── Centralised error handler ───────────────────────────────
app.use(errorHandler);

export default app;

