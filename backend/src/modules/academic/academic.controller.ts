import type { Request, Response, NextFunction } from "express";
import { academicService } from "./academic.service";

export class AcademicController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await academicService.getProfile(req.user!.id);
      return res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await academicService.updateProfile(req.user!.id, req.body);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await academicService.getCourses(req.user!.id);
      return res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  }

  async addCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await academicService.addCourse(req.user!.id, req.body);
      return res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await academicService.updateCourse(
        req.user!.id,
        req.params.id as string,
        req.body,
      );
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      await academicService.deleteCourse(req.user!.id, req.params.id as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getCgpa(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await academicService.getCgpa(req.user!.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const semesters = await academicService.getSemesters(req.user!.id);
      return res.status(200).json(semesters);
    } catch (error) {
      next(error);
    }
  }

  async createSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = await academicService.createSemester(req.user!.id, req.body);
      return res.status(201).json(semester);
    } catch (error) {
      next(error);
    }
  }

  async calculateRequiredGpa(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetCgpa, upcomingCredits } = req.body;
      const result = await academicService.calculateRequiredForStudent(
        req.user!.id,
        Number(targetCgpa),
        Number(upcomingCredits),
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const { semesterLt, semester, q } = req.query;
      const list = await academicService.getCurriculum({
        semesterLt: semesterLt ? Number(semesterLt) : undefined,
        semester: semester ? Number(semester) : undefined,
        q: q ? String(q) : undefined,
      });
      return res.status(200).json(list);
    } catch (error) {
      next(error);
    }
  }
}

export const academicController = new AcademicController();

