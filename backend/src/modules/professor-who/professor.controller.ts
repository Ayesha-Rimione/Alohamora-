import type { Request, Response, NextFunction } from "express";
import { professorService } from "./professor.service";

export class ProfessorController {
  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await professorService.listSessions(req.user!.id);
      return res.status(200).json(sessions);
    } catch (error) {
      next(error);
    }
  }

  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await professorService.createSession(req.user!.id, req.body);
      return res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }

  async getSessionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await professorService.getSessionHistory(
        req.user!.id,
        req.params.sessionId as string,
      );
      return res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  }

  async renameSession(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await professorService.renameSession(
        req.user!.id,
        req.params.sessionId as string,
        req.body.title,
      );
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
      await professorService.deleteSession(req.user!.id, req.params.sessionId as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await professorService.sendMessage(req.user!.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const professorController = new ProfessorController();

