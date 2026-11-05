import type { Request, Response, NextFunction } from "express";
import { onboardingService } from "./onboarding.service";

export class OnboardingController {
  async getState(req: Request, res: Response, next: NextFunction) {
    try {
      const state = await onboardingService.getOnboardingState(req.user!.id);
      return res.status(200).json(state);
    } catch (error) {
      next(error);
    }
  }

  async saveState(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await onboardingService.saveOnboardingState(req.user!.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const onboardingController = new OnboardingController();

