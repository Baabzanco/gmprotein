import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { sendError } from "../utils/response";
import { config } from "../config";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`Unhandled Error at ${req.method} ${req.url}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = config.isProduction
    ? "خطای غیرمنتظره در سرور رخ داد. لطفاً با پشتیبانی تماس بگیرید."
    : err.message || "خطای سرور";

  sendError(
    res,
    err.code || "INTERNAL_SERVER_ERROR",
    message,
    statusCode,
    config.isProduction ? undefined : { stack: err.stack }
  );
}

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, "NOT_FOUND", `مسیر درخواستی ${req.method} ${req.path} در سرور وجود ندارد`, 404);
}
