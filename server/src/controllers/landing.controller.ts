import { Request, Response, NextFunction } from "express";
import { landingService } from "../services/landing.service";
import { sendSuccess } from "../utils/response";

export class LandingController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await landingService.getFullLandingData();
      return sendSuccess(res, data, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await landingService.getActiveCampaign();
      return sendSuccess(res, campaign, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getFaqs(req: Request, res: Response, next: NextFunction) {
    try {
      const faqs = await landingService.getFaqs();
      return sendSuccess(res, faqs, 200, { total: faqs.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await landingService.getCustomers();
      return sendSuccess(res, customers, 200, { total: customers.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const achievements = await landingService.getAchievements();
      return sendSuccess(res, achievements, 200, { total: achievements.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getCooperationSteps(req: Request, res: Response, next: NextFunction) {
    try {
      const steps = await landingService.getCooperationSteps();
      return sendSuccess(res, steps, 200, { total: steps.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await landingService.getPublicSettings();
      return sendSuccess(res, settings, 200);
    } catch (err: any) {
      next(err);
    }
  }
}

export const landingController = new LandingController();
