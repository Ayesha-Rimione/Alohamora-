import { Router } from "express";
import { onboardingController } from "./onboarding.controller";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { saveOnboardingSchema } from "./onboarding.schemas";

const router = Router();

router.get("/onboarding", requireAuth, onboardingController.getState);
router.post(
  "/onboarding",
  requireAuth,
  validate({ body: saveOnboardingSchema }),
  onboardingController.saveState,
);

export default router;

