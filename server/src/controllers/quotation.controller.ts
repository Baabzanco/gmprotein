import { Request, Response, NextFunction } from "express";
import { quotationService } from "../services/quotation.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class QuotationController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const quotation = await quotationService.submitQuotation(req.body, ip, userAgent);
      return sendSuccess(res, quotation, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query as { status?: string };
      const quotations = await quotationService.getAll({ status });
      return sendSuccess(res, quotations, 200, { total: quotations.length });
    } catch (err: any) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await quotationService.updateStatus(id, status, req.user?.id);
      if (!updated) {
        return sendError(res, "QUOTATION_NOT_FOUND", "درخواست پیش‌فاکتور یافت نشد", 404);
      }
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }
}

export const quotationController = new QuotationController();
