import type { Request, Response, NextFunction } from "express";
import * as svc from "./extras.service";

export const extrasController = {
  // Opportunities
  async getOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.parsedQuery as import("./extras.schemas").OpportunityFilter;
      const result = await svc.getOpportunities(filters);
      return res.status(200).json({ data: result.items, total: result.total, page: result.page, limit: result.limit });
    } catch (e) { next(e); }
  },

  // Resources
  async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.parsedQuery as import("./extras.schemas").ResourceFilter;
      const result = await svc.getResources(filters);
      return res.status(200).json({ data: result });
    } catch (e) { next(e); }
  },

  // Bookmarks
  async addBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      await svc.addBookmark(req.user!.id, req.body);
      return res.status(201).json({ success: true });
    } catch (e) { next(e); }
  },
  async removeBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      await svc.removeBookmark(req.user!.id, req.params.id as string);
      return res.status(204).send();
    } catch (e) { next(e); }
  },
  async getUserBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const bms = await svc.getUserBookmarks(req.user!.id);
      return res.status(200).json(bms);
    } catch (e) { next(e); }
  },

  // Deadlines
  async getDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const dls = await svc.getDeadlines(req.user!.id);
      return res.status(200).json(dls);
    } catch (e) { next(e); }
  },
  async addDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      const dl = await svc.addDeadline(req.user!.id, req.body);
      return res.status(201).json(dl);
    } catch (e) { next(e); }
  },
  async updateDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      const dl = await svc.updateDeadline(req.user!.id, req.params.id as string, req.body);
      return res.status(200).json(dl);
    } catch (e) { next(e); }
  },
  async deleteDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      await svc.deleteDeadline(req.user!.id, req.params.id as string);
      return res.status(204).send();
    } catch (e) { next(e); }
  },

  // Activity
  async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await svc.getActivity(req.user!.id);
      return res.status(200).json(activity);
    } catch (e) { next(e); }
  },

  // Learning Plans
  async getPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = (req.query.roleId as string) || "aiml";
      const hours = Number(req.query.hours) || 8;
      const plan = await svc.getPlan(req.user!.id, roleId, hours);
      return res.status(200).json(plan);
    } catch (e) { next(e); }
  },
  async updatePlanSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await svc.updatePlanSettings(req.user!.id, req.body);
      return res.status(200).json(result);
    } catch (e) { next(e); }
  },
  async toggleTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await svc.toggleTask(req.user!.id, req.params.taskId as string, req.body.done);
      return res.status(200).json(result);
    } catch (e) { next(e); }
  },
};

