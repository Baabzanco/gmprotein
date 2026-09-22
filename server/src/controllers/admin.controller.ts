import { Response, NextFunction } from "express";
import { auditRepository } from "../repositories/audit.repository";
import { quotationRepository } from "../repositories/quotation.repository";
import { contactRepository } from "../repositories/contact.repository";
import { productRepository } from "../repositories/product.repository";
import { userRepository } from "../repositories/user.repository";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { isDatabaseConnected, getPrismaClient } from "../config/prisma";

// Safe editable system settings store
let currentSettings = {
  siteName: "پروتئین گلمحمدی",
  brandTagline: "برش‌های تخصصی، طعم اصیل و زنجیره سرد استاندارد",
  phone: "۰۲۱-۲۲۰۰۳۳۴۴",
  mobile: "۰۹۱۲۰۰۰۰۰۰۰",
  email: "info@golmohamadi.com",
  address: "تهران، خیابان شریعتی، بالاتر از پل رومی، مجتمع پروتئین گلمحمدی",
  primaryColor: "#124A57",
  accentColor: "#CD78B3",
  defaultMetaTitle: "پروتئین گلمحمدی | تجربه گوشت لوکس و استیک‌های تخصصی",
  defaultMetaDescription: "تأمین‌کننده مستقیم برش‌های استیک گوساله، دنده شاندیزی و گوشت پرواری دستچین.",
  orderNotice: "کلیه سفارش‌های رسمی تهران ظرف کمتر از ۴ ساعت با خودروهای یخچال‌دار اختصاصی تحویل می‌گردند.",
  enablePublicQuotations: true,
  enableSmsNotifications: true,
  updatedAt: new Date().toISOString(),
};

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
      const [products, quotations, contacts, users] = await Promise.all([
        productRepository.findAll(),
        quotationRepository.findAll(),
        contactRepository.findAll(),
        userRepository.findAll(),
      ]);

      const pendingQuotations = quotations.filter((q) => q.status === "PENDING").length;
      const newContacts = contacts.filter((c) => c.status === "NEW").length;
      const activeProducts = products.filter((p) => p.isAvailable).length;
      const activeCampaigns = inMemoryCampaigns.filter((c) => c.isActive).length;

      return sendSuccess(res, {
        totalProducts: products.length,
        activeProducts,
        totalQuotations: quotations.length,
        pendingQuotations,
        totalContacts: contacts.length,
        newContacts,
        totalUsers: users.length,
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

  // --- Users & Roles ---
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.findAll();
      return sendSuccess(res, users, 200, { total: users.length });
    } catch (err: any) {
      next(err);
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, phone, password, roles } = req.body;
      if (!firstName || !lastName || !email || !password || !Array.isArray(roles)) {
        return sendError(res, "VALIDATION_ERROR", "تمام فیلدهای اجباری را وارد کنید", 400);
      }
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        return sendError(res, "CONFLICT", "کاربری با این ایمیل قبلاً ثبت شده است", 409);
      }
      const created = await userRepository.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        roles,
      });

      await auditRepository.log({
        userId: req.user?.id,
        action: "USER_CREATED",
        entity: "User",
        entityId: created.id,
        metadata: { email, roles },
      });

      return sendSuccess(res, created, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const success = await userRepository.updateStatus(id, Boolean(isActive));
      if (!success) {
        return sendError(res, "USER_NOT_FOUND", "کاربر مورد نظر یافت نشد", 404);
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "USER_STATUS_UPDATED",
        entity: "User",
        entityId: id,
        metadata: { isActive },
      });

      return sendSuccess(res, { success: true, isActive }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await userRepository.delete(id);
      if (!success) {
        return sendError(res, "USER_NOT_FOUND", "کاربر برای حذف یافت نشد", 404);
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "USER_DELETED",
        entity: "User",
        entityId: id,
      });

      return sendSuccess(res, { deleted: true }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const roles = [
        {
          id: "role-super-admin",
          name: "SUPER_ADMIN",
          title: "مدیر ارشد سیستم",
          description: "دسترسی کامل و نامحدود به تمامی بخش‌ها و داده‌های سیستم",
          usersCount: 1,
          permissions: ["MANAGE:*"],
        },
        {
          id: "role-admin",
          name: "ADMIN",
          title: "مدیر عملیات",
          description: "مدیریت عمومی پلتفرم، کاتالوگ و مشتریان",
          usersCount: 2,
          permissions: ["READ:*", "CREATE:*", "UPDATE:*"],
        },
        {
          id: "role-product-manager",
          name: "PRODUCT_MANAGER",
          title: "مدیر محصولات",
          description: "مدیریت قیمت‌ها، محصولات، دسته‌بندی‌ها و موجودی",
          usersCount: 3,
          permissions: ["MANAGE:products", "MANAGE:categories", "MANAGE:prices"],
        },
        {
          id: "role-sales-manager",
          name: "SALES_MANAGER",
          title: "مدیر فروش و پیش‌فاکتور",
          description: "بررسی و صدور پیش‌فاکتورهای رسمی و ارتباط با مشتریان",
          usersCount: 4,
          permissions: ["MANAGE:quotations", "READ:products", "READ:contacts"],
        },
        {
          id: "role-content-manager",
          name: "CONTENT_MANAGER",
          title: "مدیر محتوا",
          description: "ویرایش متن‌های صفحه فرود، مقالات بلاگ، سوالات متداول و کمپین‌ها",
          usersCount: 2,
          permissions: ["MANAGE:content", "MANAGE:landing", "MANAGE:faq"],
        },
        {
          id: "role-support",
          name: "SUPPORT",
          title: "کارشناس پشتیبانی",
          description: "پاسخگویی به پیام‌های تماس و درخواست‌های همکاری",
          usersCount: 2,
          permissions: ["READ:contacts", "UPDATE:contacts"],
        },
        {
          id: "role-viewer",
          name: "VIEWER",
          title: "بیننده (فقط خواندنی)",
          description: "مشاهده گزارش‌ها و آمار به صورت فقط-خواندنی بدون امکان تغییر",
          usersCount: 1,
          permissions: ["READ:reports", "READ:products", "READ:quotations"],
        },
      ];
      return sendSuccess(res, roles, 200, { total: roles.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const matrix = [
        { resource: "محصولات (Products)", read: true, create: true, update: true, delete: true, manage: true },
        { resource: "دسته‌بندی‌ها (Categories)", read: true, create: true, update: true, delete: true, manage: true },
        { resource: "پیش‌فاکتورها (Quotations)", read: true, create: false, update: true, delete: false, manage: true },
        { resource: "پیام‌های تماس (Contacts)", read: true, create: false, update: true, delete: true, manage: true },
        { resource: "محتوا و لندینگ (Content)", read: true, create: true, update: true, delete: true, manage: true },
        { resource: "کاربران و نقش‌ها (Users)", read: true, create: true, update: true, delete: true, manage: true },
        { resource: "گزارش‌ها (Reports)", read: true, create: false, update: false, delete: false, manage: true },
        { resource: "تنظیمات سیستمی (Settings)", read: true, create: false, update: true, delete: false, manage: true },
      ];
      return sendSuccess(res, matrix, 200);
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

  // --- Settings ---
  async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, currentSettings, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      currentSettings = {
        ...currentSettings,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

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
}

export const adminController = new AdminController();
