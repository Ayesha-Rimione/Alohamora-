import { Router } from "express";
import { professorController } from "./professor.controller";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { chatLimiter } from "../../middleware/rateLimit";
import {
  chatMessageSchema,
  createSessionSchema,
  renameSessionSchema,
} from "./professor.schemas";
import { z } from "zod";

const router = Router();

// Chat sessions
router.get("/chat/sessions", requireAuth, professorController.listSessions);
router.post(
  "/chat/sessions",
  requireAuth,
  validate({ body: createSessionSchema }),
  professorController.createSession,
);
router.get(
  "/chat/sessions/:sessionId",
  requireAuth,
  professorController.getSessionHistory,
);
router.patch(
  "/chat/sessions/:sessionId",
  requireAuth,
  validate({ body: renameSessionSchema }),
  professorController.renameSession,
);
router.delete(
  "/chat/sessions/:sessionId",
  requireAuth,
  professorController.deleteSession,
);

// Legacy single endpoint (matches API_CONTRACT.md POST /api/chat)
router.post(
  "/chat",
  requireAuth,
  chatLimiter,
  validate({ body: chatMessageSchema }),
  professorController.sendMessage,
);

export default router;

