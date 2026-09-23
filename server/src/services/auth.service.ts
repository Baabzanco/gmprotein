import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { userRepository } from "../repositories/user.repository";
import { auditRepository } from "../repositories/audit.repository";

export class AuthService {
  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      await auditRepository.log({
        action: "LOGIN_FAILED",
        entity: "User",
        metadata: { email, reason: "USER_NOT_FOUND" },
        ipAddress,
        userAgent,
      });
      throw new Error("ایمیل یا رمز عبور اشتباه است");
    }

    if (!user.isActive) {
      await auditRepository.log({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "User",
        metadata: { reason: "ACCOUNT_INACTIVE" },
        ipAddress,
        userAgent,
      });
      throw new Error("حساب کاربری شما غیرفعال شده است. لطفاً با پشتیبانی تماس بگیرید.");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await auditRepository.log({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "User",
        metadata: { reason: "INVALID_PASSWORD" },
        ipAddress,
        userAgent,
      });
      throw new Error("ایمیل یا رمز عبور اشتباه است");
    }

    await userRepository.updateLastLogin(user.id);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      permissions: user.permissions,
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    await auditRepository.log({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        status: user.isActive ? "ACTIVE" : "SUSPENDED",
        roles: user.roles,
        permissions: user.permissions,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("کاربر یافت نشد");
    }
    return user;
  }
}

export const authService = new AuthService();
