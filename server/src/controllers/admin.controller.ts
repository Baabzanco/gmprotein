import fs from "fs";
import path from "path";
import { Response, NextFunction } from "express";
import { auditRepository } from "../repositories/audit.repository";
import { contactRepository } from "../repositories/contact.repository";
import { productRepository } from "../repositories/product.repository";
import { userRepository } from "../repositories/user.repository";
import { landingRepository } from "../repositories/landing.repository";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { isDatabaseConnected, getPrismaClient } from "../config/prisma";
import { loadPersistentSettings, savePersistentSettings } from "../utils/persistentSettings";

import { userService } from "../services/user.service";
import { roleRepository } from "../repositories/role.repository";

// Safe editable system settings store with filesystem persistence
let currentSettings = loadPersistentSettings();

// Discounts store
let inMemoryDiscounts: any[] = [
  {
    id: "disc-1",
    name: "تخفیف سفارش اول رستوران‌ها",
    code: "WELCOME-REST",
    type: "PERCENTAGE",
    value: 15,
    maxDiscount: 5000000,
    minOrderAmount: 20000000,
    isActive: true,
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2026-12-31T23:59:59Z",
    usageCount: 24,
  },
  {
    id: "disc-2",
    name: "جشنواره استیک ریب‌آی",
    code: "RIBEYE-PRO",
    type: "FIXED_AMOUNT",
    value: 200000,
    maxDiscount: null,
    minOrderAmount: 5000000,
    isActive: true,
    startsAt: "2026-03-01T00:00:00Z",
    endsAt: "2026-04-30T23:59:59Z",
    usageCount: 89,
  },
];

// Campaigns store
let inMemoryCampaigns: any[] = [
  {
    id: "camp-1",
    name: "جشنواره بهاره استیک و باربیکیو",
    slug: "spring-bbq-2026",
    description: "تخفیف ویژه برش‌های ریب‌آی، تاماهاوک و فیله برای تجهیز و منوی نوروزی هتل‌ها و رستوران‌های برتر.",
    isActive: true,
    startsAt: "2026-03-01T00:00:00Z",
    endsAt: "2026-04-15T23:59:59Z",
    bannerUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    badge: "فروش ویژه فصل",
    highlightDiscount: "۲۰٪ تخفیف",
  },
];

export class AdminController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const [products, contacts, users] = await Promise.all([
        productRepository.findAll(),
        contactRepository.findAll(),
        userRepository.findAll(),
      ]);

      const newContacts = contacts.filter((c) => c.status === "NEW").length;
      const activeProducts = products.filter((p) => p.isAvailable).length;
      const activeCampaigns = inMemoryCampaigns.filter((c) => c.isActive).length;

      return sendSuccess(res, {
        totalProducts: products.length,
        activeProducts,
        totalContacts: contacts.length,
        newContacts,
        totalUsers: users.total || users.users.length,
        activeCampaigns,
        databaseConnected: isDatabaseConnected(),
        systemTime: new Date().toISOString(),
      });
    } catch (err: any) {
      next(err);
    }
  }

  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entity, limit } = req.query as any;
      const logs = await auditRepository.findAll({
        entity,
        limit: limit ? parseInt(limit, 10) : 50,
      });
      return sendSuccess(res, logs, 200, { total: logs.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getSystemLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = [
        {
          id: "syslog-1",
          level: "INFO",
          module: "API Gateway",
          message: "درخواست‌های HTTP با موفقیت پردازش شدند.",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          ip: "127.0.0.1",
          statusCode: 200,
        },
        {
          id: "syslog-2",
          level: "INFO",
          module: "Prisma ORM",
          message: "استعلام سلامت اتصالات دیتابیس با موفقیت ثبت شد.",
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          ip: "internal",
          statusCode: 200,
        },
        {
          id: "syslog-3",
          level: "WARN",
          module: "Security RateLimiter",
          message: "نرخ درخواست IP محدودساز برای مسیرهای حساس بهینه‌سازی شد.",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          ip: "192.168.1.1",
          statusCode: 429,
        },
      ];
      return sendSuccess(res, logs, 200, { total: logs.length });
    } catch (err: any) {
      next(err);
    }
  }

  // --- Users & Roles Management (Phase 5) ---
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, role, status, page, limit } = req.query as any;
      const result = await userService.getUsers({
        search,
        role,
        status,
        page,
        limit,
      });
      return sendSuccess(res, result.users, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      next(err);
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return sendSuccess(res, user, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, phone, password, roles } = req.body;
      const created = await userService.createUser(req.user?.id, {
        firstName,
        lastName,
        email,
        phone,
        password,
        roles,
      });
      return sendSuccess(res, created, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await userService.updateUser(req.user?.id, id, req.body);
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : req.body.status === "ACTIVE";
      const success = await userService.updateUserStatus(req.user?.id, id, isActive);
      return sendSuccess(res, { success, isActive, status: isActive ? "ACTIVE" : "SUSPENDED" }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const success = await userService.resetPassword(req.user?.id, id, password);
      return sendSuccess(res, { success, message: "رمز عبور با موفقیت بازنشانی شد." }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await userService.deleteUser(req.user?.id, id);
      return sendSuccess(res, { deleted: success }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const roles = await userService.getRoles();
      return sendSuccess(res, roles, 200, { total: roles.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getRoleById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role = await userService.getRoleById(id);
      return sendSuccess(res, role, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async createRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, title, description, permissions } = req.body;
      const created = await userService.createRole(req.user?.id, {
        name,
        title,
        description,
        permissions: permissions || [],
      });
      return sendSuccess(res, created, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await userService.updateRole(req.user?.id, id, req.body);
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async updateRolePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const updated = await userService.updateRolePermissions(req.user?.id, id, permissions);
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteRole(req.user?.id, id);
      return sendSuccess(res, { deleted }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await userService.getPermissions();
      return sendSuccess(res, permissions, 200, { total: permissions.length });
    } catch (err: any) {
      next(err);
    }
  }

  // --- Discounts & Campaigns ---
  async getDiscounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, inMemoryDiscounts, 200, { total: inMemoryDiscounts.length });
    } catch (err: any) {
      next(err);
    }
  }

  async createDiscount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const newDiscount = {
        id: `disc-${Date.now()}`,
        ...req.body,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };
      inMemoryDiscounts.unshift(newDiscount);

      await auditRepository.log({
        userId: req.user?.id,
        action: "DISCOUNT_CREATED",
        entity: "Discount",
        entityId: newDiscount.id,
        metadata: { code: newDiscount.code, value: newDiscount.value },
      });

      return sendSuccess(res, newDiscount, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async getCampaigns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, inMemoryCampaigns, 200, { total: inMemoryCampaigns.length });
    } catch (err: any) {
      next(err);
    }
  }

  async createCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const newCampaign = {
        id: `camp-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      inMemoryCampaigns.unshift(newCampaign);

      await auditRepository.log({
        userId: req.user?.id,
        action: "CAMPAIGN_CREATED",
        entity: "Campaign",
        entityId: newCampaign.id,
        metadata: { name: newCampaign.name },
      });

      return sendSuccess(res, newCampaign, 201);
    } catch (err: any) {
      next(err);
    }
  }

  // --- Settings & Hero Video Upload ---
  async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      currentSettings = loadPersistentSettings();
      return sendSuccess(res, currentSettings, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      currentSettings = savePersistentSettings(req.body);

      if (req.body.heroVideoUrl) {
        landingRepository.updateSetting("heroVideoUrl", req.body.heroVideoUrl);
      }

      if (req.body.heroVideoUrl && isDatabaseConnected()) {
        try {
          const prisma = getPrismaClient();
          await prisma.siteSetting.upsert({
            where: { key: "heroVideoUrl" },
            update: { value: req.body.heroVideoUrl, updatedAt: new Date() },
            create: {
              id: `set-hero-${Date.now()}`,
              key: "heroVideoUrl",
              value: req.body.heroVideoUrl,
              type: "string",
              isPublic: true,
            },
          });
        } catch (e) {}
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "SETTINGS_UPDATED",
        entity: "SiteSetting",
        entityId: "global",
        metadata: { keys: Object.keys(req.body) },
      });

      return sendSuccess(res, currentSettings, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async uploadHeroVideo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { fileBase64, fileName, fileType } = req.body;
      if (!fileBase64) {
        return sendError(res, "VALIDATION_ERROR", "فایل ویدیو برای بارگذاری ارسال نشده است", 400);
      }

      // Strip data URL header if present
      const base64Data = fileBase64.replace(/^data:video\/[a-zA-Z0-9.-]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Validate size (max 100MB)
      if (buffer.length > 100 * 1024 * 1024) {
        return sendError(res, "FILE_TOO_LARGE", "حجم ویدیو نمی‌تواند بیشتر از ۱۰۰ مگابایت باشد", 400);
      }

      let ext = ".mp4";
      if (fileName && path.extname(fileName)) {
        ext = path.extname(fileName).toLowerCase();
      } else if (fileType === "video/webm") {
        ext = ".webm";
      } else if (fileType === "video/quicktime" || fileType === "video/mov") {
        ext = ".mov";
      }

      const safeFilename = `hero-video-${Date.now()}${ext}`;
      const uploadsDir = path.resolve(process.cwd(), "uploads", "videos");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      const videoUrl = `/uploads/videos/${safeFilename}`;
      currentSettings = savePersistentSettings({
        heroVideoUrl: videoUrl,
        heroVideoMetadata: {
          originalName: fileName || safeFilename,
          fileName: safeFilename,
          size: buffer.length,
          mimeType: fileType || "video/mp4",
          uploadedAt: new Date().toISOString(),
        },
      });

      landingRepository.updateSetting("heroVideoUrl", videoUrl);

      if (isDatabaseConnected()) {
        try {
          const prisma = getPrismaClient();
          await prisma.siteSetting.upsert({
            where: { key: "heroVideoUrl" },
            update: { value: videoUrl, updatedAt: new Date() },
            create: {
              id: `set-hero-${Date.now()}`,
              key: "heroVideoUrl",
              value: videoUrl,
              type: "string",
              isPublic: true,
            },
          });
        } catch (dbErr) {}
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "HERO_VIDEO_UPLOADED",
        entity: "SiteSetting",
        entityId: "heroVideoUrl",
        metadata: { fileName, size: buffer.length, url: videoUrl },
      });

      return sendSuccess(
        res,
        {
          url: videoUrl,
          fileName: safeFilename,
          size: buffer.length,
          settings: currentSettings,
          message: "ویدیوی هیروسکشن با موفقیت بارگذاری و بر روی سرور مستقر شد.",
        },
        200
      );
    } catch (err: any) {
      next(err);
    }
  }

  // --- FAQs Management ---
  async getFaqs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const faqs = await landingRepository.getAllFaqsAdmin();
      return sendSuccess(res, faqs, 200, { total: faqs.length });
    } catch (err: any) {
      next(err);
    }
  }

  async createFaq(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { question, answer, category, sortOrder, isPublished } = req.body;
      if (!question || !answer) {
        return sendError(res, "VALIDATION_ERROR", "پرسش و پاسخ هر دو الزامی هستند", 400);
      }
      const created = await landingRepository.createFaq({
        question,
        answer,
        category,
        sortOrder,
        isPublished,
      });

      await auditRepository.log({
        userId: req.user?.id,
        action: "FAQ_CREATED",
        entity: "FAQ",
        entityId: created.id,
        metadata: { question: created.question },
      });

      return sendSuccess(res, created, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateFaq(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await landingRepository.updateFaq(id, req.body);
      if (!updated) {
        return sendError(res, "NOT_FOUND", "سوال متداول مورد نظر یافت نشد", 404);
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "FAQ_UPDATED",
        entity: "FAQ",
        entityId: id,
        metadata: { ...req.body },
      });

      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteFaq(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await landingRepository.deleteFaq(id);
      if (!success) {
        return sendError(res, "NOT_FOUND", "سوال متداول مورد نظر یافت نشد", 404);
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "FAQ_DELETED",
        entity: "FAQ",
        entityId: id,
      });

      return sendSuccess(res, { deleted: true }, 200);
    } catch (err: any) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
