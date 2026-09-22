import { Request, Response, NextFunction } from "express";
import { contactService } from "../services/contact.service";
import { sendSuccess } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class ContactController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const contact = await contactService.submitContact(req.body, ip, userAgent);
      return sendSuccess(res, contact, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query as { status?: string };
      const requests = await contactService.getAll({ status });
      return sendSuccess(res, requests, 200, { total: requests.length });
    } catch (err: any) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await contactService.updateStatus(id, status, req.user?.id);
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }
}

export const contactController = new ContactController();
