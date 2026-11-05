import { Router } from "express";
import { skillsController } from "./skills.controller";
import { requireAuth, optionalAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateSkillSchema, addEvidenceSchema } from "./skills.schemas";

const router = Router();

// Public / optional auth career roles catalog
router.get("/roles", optionalAuth, skillsController.getRoles);
router.get("/roles/:id", optionalAuth, skillsController.getRole);

// Student skills and evidence
router.get("/me/skills", requireAuth, skillsController.getUserSkills);
router.put(
  "/me/skills/:skillId",
  requireAuth,
  validate({ body: updateSkillSchema }),
  skillsController.updateSkill,
);
router.post(
  "/me/skills/:skillId/evidence",
  requireAuth,
  validate({ body: addEvidenceSchema }),
  skillsController.addEvidence,
);
router.delete("/evidence/:id", requireAuth, skillsController.deleteEvidence);

// Marauder Map
router.get("/me/map", requireAuth, skillsController.getMarauderMap);

export default router;

