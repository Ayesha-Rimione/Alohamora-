import type { Request, Response, NextFunction } from "express";
import { skillsService } from "./skills.service";

export class SkillsController {
  async getRoles(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await skillsService.getRoles();
      return res.status(200).json({ data: roles });
    } catch (error) {
      next(error);
    }
  }

  async getRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await skillsService.getRole(req.params.id as string);
      return res.status(200).json(role);
    } catch (error) {
      next(error);
    }
  }

  async getUserSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await skillsService.getUserSkills(req.user!.id);
      return res.status(200).json(skills);
    } catch (error) {
      next(error);
    }
  }

  async updateSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await skillsService.updateUserSkill(
        req.user!.id,
        req.params.skillId as string,
        req.body,
      );
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async addEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const evidence = await skillsService.addEvidence(
        req.user!.id,
        req.params.skillId as string,
        req.body,
      );
      return res.status(201).json(evidence);
    } catch (error) {
      next(error);
    }
  }

  async deleteEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      await skillsService.deleteEvidence(req.user!.id, req.params.id as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getMarauderMap(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = req.query.roleId as string | undefined;
      const map = await skillsService.getMarauderMap(req.user!.id, roleId);
      return res.status(200).json(map);
    } catch (error) {
      next(error);
    }
  }
}

export const skillsController = new SkillsController();

