import { Router } from "express";
import { extrasController } from "./extras.controller";
import { requireAuth, optionalAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  opportunityFilterSchema,
  resourceFilterSchema,
  addBookmarkSchema,
  deadlineSchema,
  updateDeadlineSchema,
  planSettingsSchema,
  toggleTaskSchema,
} from "./extras.schemas";

const router = Router();

// Public listings (read-only, optional auth for bookmark status)
router.get("/opportunities", optionalAuth, validate({ query: opportunityFilterSchema }), extrasController.getOpportunities);
router.get("/resources", optionalAuth, validate({ query: resourceFilterSchema }), extrasController.getResources);

// Bookmarks (require auth)
router.get("/bookmarks", requireAuth, extrasController.getUserBookmarks);
router.post("/bookmarks", requireAuth, validate({ body: addBookmarkSchema }), extrasController.addBookmark);
router.delete("/bookmarks/:id", requireAuth, extrasController.removeBookmark);

// Deadlines
router.get("/me/deadlines", requireAuth, extrasController.getDeadlines);
router.post("/me/deadlines", requireAuth, validate({ body: deadlineSchema }), extrasController.addDeadline);
router.patch("/me/deadlines/:id", requireAuth, validate({ body: updateDeadlineSchema }), extrasController.updateDeadline);
router.delete("/me/deadlines/:id", requireAuth, extrasController.deleteDeadline);

// Activity
router.get("/me/activity", requireAuth, extrasController.getActivity);

// Learning Plans (Potion Lab)
router.get("/me/plan", requireAuth, extrasController.getPlan);
router.put("/me/plan/settings", requireAuth, validate({ body: planSettingsSchema }), extrasController.updatePlanSettings);
router.patch("/me/plan/tasks/:taskId", requireAuth, validate({ body: toggleTaskSchema }), extrasController.toggleTask);

export default router;

