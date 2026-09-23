import { Request, Response, NextFunction } from "express";
import { campaignRepository } from "../repositories/campaign.repository";
import { auditRepository } from "../repositories/audit.repository";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class CampaignController {
  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const activeCampaigns = await campaignRepository.getActive();
      return sendSuccess(res, activeCampaigns, 200, { total: activeCampaigns.length });
    } catch (err: any) {
      next(err);
    }
  }

  async adminList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const all = await campaignRepository.findAll();
      return sendSuccess(res, all, 200, { total: all.length });
    } catch (err: any) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const created = await campaignRepository.create(req.body);
      await auditRepository.log({
        userId: req.user?.id,
        action: "CAMPAIGN_CREATED",
        entity: "Campaign",
        entityId: created.id,
        metadata: { title: created.title },
      });
      return sendSuccess(res, created, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await campaignRepository.update(id, req.body);
      if (!updated) {
        return sendError(res, "CAMPAIGN_NOT_FOUND", "کمپین مورد نظر یافت نشد", 404);
      }
      await auditRepository.log({
        userId: req.user?.id,
        action: "CAMPAIGN_UPDATED",
        entity: "Campaign",
        entityId: id,
        metadata: { title: updated.title },
      });
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await campaignRepository.toggleStatus(id, Boolean(isActive));
      if (!updated) {
        return sendError(res, "CAMPAIGN_NOT_FOUND", "کمپین مورد نظر یافت نشد", 404);
      }
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await campaignRepository.delete(id);
      if (!success) {
        return sendError(res, "CAMPAIGN_NOT_FOUND", "کمپین برای حذف یافت نشد", 404);
      }
      await auditRepository.log({
        userId: req.user?.id,
        action: "CAMPAIGN_DELETED",
        entity: "Campaign",
        entityId: id,
      });
      return sendSuccess(res, { deleted: true }, 200);
    } catch (err: any) {
      next(err);
    }
  }
}

export const campaignController = new CampaignController();
