import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { sendError } from "../utils/response";
import { RoleName } from "../../../shared/types";

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: { action: string; resource: string }[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "UNAUTHORIZED", "توکن احراز هویت ارائه نشده است", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    return sendError(res, "INVALID_TOKEN", "توکن نامعتبر یا منقضی شده است", 401);
  }
}

export function requireRole(...allowedRoles: (RoleName | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "UNAUTHORIZED", "کاربر احراز هویت نشده است", 401);
    }

    // SUPER_ADMIN has access to everything
    if (req.user.roles.includes("SUPER_ADMIN")) {
      return next();
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return sendError(
        res,
        "FORBIDDEN_ROLE",
        "شما به این بخش دسترسی ندارید (نقش کاربری ناکافی)",
        403
      );
    }

    next();
  };
}

export function requirePermission(action: string, resource: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "UNAUTHORIZED", "کاربر احراز هویت نشده است", 401);
    }

    // SUPER_ADMIN bypass
    if (req.user.roles.includes("SUPER_ADMIN")) {
      return next();
    }

    const hasPermission = req.user.permissions?.some(
      (p) => (p.action === action || p.action === "MANAGE") && (p.resource === resource || p.resource === "*")
    );

    if (!hasPermission) {
      return sendError(
        res,
        "FORBIDDEN_PERMISSION",
        `شما دسترسی انجام عملیات ${action} بر روی ${resource} را ندارید`,
        403
      );
    }

    next();
  };
}
