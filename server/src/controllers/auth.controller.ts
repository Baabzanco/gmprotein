import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await authService.login(email, password, ip, userAgent);
      return sendSuccess(res, result, 200);
    } catch (err: any) {
      return sendError(res, "AUTH_FAILED", err.message || "ورود به سیستم ناموفق بود", 401);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "UNAUTHORIZED", "احراز هویت نشده", 401);
      }
      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, user, 200);
    } catch (err: any) {
      return sendError(res, "USER_NOT_FOUND", err.message || "کاربر یافت نشد", 404);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // JWT is stateless on client-side; here we return confirmation and can audit if needed
    return sendSuccess(res, { message: "خروج با موفقیت انجام شد" }, 200);
  }
}

export const authController = new AuthController();
