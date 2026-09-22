import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendError } from "../utils/response";

export function validateBody(schema: ZodSchema<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        return sendError(res, "VALIDATION_ERROR", "داده‌های ورودی نامعتبر است", 400, issues);
      }
      return sendError(res, "VALIDATION_ERROR", "خطای اعتبارسنجی ورودی", 400);
    }
  };
}

export function validateQuery(schema: ZodSchema<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        return sendError(res, "QUERY_VALIDATION_ERROR", "پارامترهای جستجو نامعتبر است", 400, issues);
      }
      return sendError(res, "QUERY_VALIDATION_ERROR", "خطای اعتبارسنجی پارامترهای آدرس", 400);
    }
  };
}
