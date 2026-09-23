import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { sendError } from "../utils/response";
import { RoleName } from "../../../shared/types";
import { userRepository } from "../repositories/user.repository";

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[];
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "UNAUTHORIZED", "توکن احراز هویت ارائه نشده است", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    // Authoritative real-time check against repository
    const dbUser = await userRepository.findById(decoded.id);

    if (!dbUser) {
      return sendError(res, "USER_NOT_FOUND", "حساب کاربری یافت نشد یا حذف شده است", 401);
    }

    if (!dbUser.isActive || dbUser.status === "SUSPENDED") {
      return sendError(
        res,
        "ACCOUNT_SUSPENDED",
        "حساب کاربری شما معلق یا غیرفعال شده است. لطفاً با پشتیبانی تماس بگیرید.",
        403
      );
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      isActive: dbUser.isActive,
      status: dbUser.status,
      roles: dbUser.roles,
      permissions: dbUser.permissions,
    };

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

export function requirePermission(permissionOrAction: string, resourceParam?: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "UNAUTHORIZED", "کاربر احراز هویت نشده است", 401);
    }

    // SUPER_ADMIN bypasses all permission checks
    if (req.user.roles.includes("SUPER_ADMIN")) {
      return next();
    }

    let requiredCode = permissionOrAction;
    if (resourceParam) {
      requiredCode = `${resourceParam}.${permissionOrAction.toLowerCase()}`;
    }

    const userPerms = req.user.permissions || [];

    const hasPermission = userPerms.some((p) => {
      if (p === "*" || p === "MANAGE:*" || p === "*.*") return true;
      if (p === requiredCode) return true;

      // Match wildcard resource (e.g., 'products.*' matching 'products.create')
      const [reqRes] = requiredCode.split(".");
      if (p === `${reqRes}.*` || p === `MANAGE:${reqRes}`) return true;

      return false;
    });

    if (!hasPermission) {
      return sendError(
        res,
        "FORBIDDEN_PERMISSION",
        `شما دسترسی لازم برای انجام عملیات (${requiredCode}) را ندارید`,
        403
      );
    }

    next();
  };
}
