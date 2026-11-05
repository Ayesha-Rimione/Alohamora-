import { Router } from "express";
import { academicController } from "./academic.controller";
import { requireAuth, optionalAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  courseSchema,
  updateCourseSchema,
  semesterSchema,
  targetCgpaSchema,
  profileUpdateSchema,
} from "./academic.schemas";

const router = Router();

// Curriculum catalog
router.get("/curriculum", optionalAuth, academicController.getCurriculum);

// Profile endpoints
router.get("/me", requireAuth, academicController.getProfile);
router.put(
  "/me/profile",
  requireAuth,
  validate({ body: profileUpdateSchema }),
  academicController.updateProfile,
);

// CGPA endpoints
router.get("/me/cgpa", requireAuth, academicController.getCgpa);
router.post(
  "/me/required-gpa",
  requireAuth,
  validate({ body: targetCgpaSchema }),
  academicController.calculateRequiredGpa,
);

// Course endpoints
router.get("/courses", requireAuth, academicController.getCourses);
router.post(
  "/courses",
  requireAuth,
  validate({ body: courseSchema }),
  academicController.addCourse,
);
router.put(
  "/courses/:id",
  requireAuth,
  validate({ body: updateCourseSchema }),
  academicController.updateCourse,
);
router.delete("/courses/:id", requireAuth, academicController.deleteCourse);

// Semester endpoints
router.get("/semesters", requireAuth, academicController.getSemesters);
router.post(
  "/semesters",
  requireAuth,
  validate({ body: semesterSchema }),
  academicController.createSemester,
);

export default router;

