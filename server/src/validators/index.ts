import { z } from "zod";

// Auth Validators
export const loginSchema = z.object({
  email: z.string().email("فرمت ایمیل نامعتبر است"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

// Quotation Request Validators
export const quotationItemSchema = z.object({
  productId: z.string().min(1, "شناسه محصول الزامی است"),
  requestedWeight: z.number().positive("وزن درخواستی باید عددی مثبت باشد"),
  quantity: z.number().int().positive("تعداد بسته‌ها باید حداقل ۱ باشد").default(1),
  unit: z.string().default("kg"),
  notes: z.string().optional(),
});

export const createQuotationRequestSchema = z.object({
  customerName: z.string().min(2, "نام مشتری الزامی است"),
  companyName: z.string().optional().nullable(),
  phone: z.string().min(10, "شماره تماس الزامی است"),
  email: z.string().email("فرمت ایمیل نامعتبر است").optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, "حداقل یک قلم کالا در پیش‌فاکتور الزامی است"),
});

// Contact Request Validators
export const createContactRequestSchema = z.object({
  name: z.string().min(2, "نام متقاضی الزامی است"),
  phone: z.string().min(10, "شماره تماس الزامی است"),
  company: z.string().optional().nullable(),
  email: z.string().email("فرمت ایمیل نامعتبر است").optional().nullable(),
  subject: z.string().min(2, "موضوع پیام الزامی است"),
  message: z.string().min(5, "متن پیام الزامی است"),
});

// Product Package Option Validator
export const packageOptionSchema = z.object({
  id: z.string().optional(),
  weightKg: z.number().positive("وزن بسته باید بیشتر از صفر باشد"),
  label: z.string().min(1, "عنوان بسته الزامی است"),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Product Feature Validator
export const productFeatureSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "عنوان ویژگی الزامی است"),
  value: z.string().min(1, "مقدار ویژگی الزامی است"),
  sortOrder: z.number().int().default(0).optional(),
});

// Product Validators
export const createProductSchema = z.object({
  name: z.string().min(2, "نام محصول باید حداقل ۲ کاراکتر باشد"),
  slug: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().min(1, "توضیحات محصول الزامی است"),
  sku: z.string().optional(), // Auto-generated deterministically if omitted
  categoryId: z.string().min(1, "انتخاب دسته‌بندی الزامی است"),
  basePrice: z.number().positive("قیمت پایه باید بیشتر از صفر باشد"),
  unit: z.string().default("kg"),
  minimumOrder: z.number().positive().default(1),
  allowCustomWeight: z.boolean().default(true),
  packageOptions: z.array(packageOptionSchema).optional(),
  features: z.array(productFeatureSchema).optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().min(1, "آدرس تصویر الزامی است"),
    alt: z.string().optional().nullable(),
    sortOrder: z.number().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Product Query Validator
export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "شماره صفحه نامعتبر است")
    .default(1 as any),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "تعداد در صفحه باید بین ۱ تا ۱۰۰ باشد")
    .default(20 as any),
});

// Category Validators
export const createCategorySchema = z.object({
  name: z.string().min(2, "نام دسته‌بندی الزامی است"),
  slug: z.string().min(2, "نام یکتا (slug) الزامی است"),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

// Campaign Validators
export const createCampaignSchema = z.object({
  title: z.string().min(2, "عنوان کمپین الزامی است"),
  slug: z.string().min(2, "اسلاگ کمپین الزامی است"),
  description: z.string().min(5, "توضیحات الزامی است"),
  image: z.string().min(1, "تصویر کمپین الزامی است"),
  badge: z.string().default("پیشنهاد ویژه"),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// FAQ Validator
export const createFaqSchema = z.object({
  question: z.string().min(5, "سوال الزامی است"),
  answer: z.string().min(5, "پاسخ الزامی است"),
  category: z.string().default("عمومی"),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

// System Permissions Definition (Phase 5)
export interface SystemPermissionDefinition {
  code: string;
  action: string;
  resource: string;
  category: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermissionDefinition[] = [
  // Users
  { code: "users.view", action: "view", resource: "users", category: "کاربران", description: "مشاهده لیست و مشخصات کاربران" },
  { code: "users.create", action: "create", resource: "users", category: "کاربران", description: "تعریف کاربر و مدیر جدید" },
  { code: "users.update", action: "update", resource: "users", category: "کاربران", description: "ویرایش مشخصات و تخصیص نقش‌ها" },
  { code: "users.suspend", action: "suspend", resource: "users", category: "کاربران", description: "تعلیق یا فعال‌سازی حساب کاربری" },
  { code: "users.delete", action: "delete", resource: "users", category: "کاربران", description: "حذف حساب کاربری پرسنل" },

  // Roles
  { code: "roles.view", action: "view", resource: "roles", category: "نقش‌ها و دسترسی‌ها", description: "مشاهده نقش‌ها و ماتریس دسترسی‌ها" },
  { code: "roles.create", action: "create", resource: "roles", category: "نقش‌ها و دسترسی‌ها", description: "ایجاد نقش کاربری جدید" },
  { code: "roles.update", action: "update", resource: "roles", category: "نقش‌ها و دسترسی‌ها", description: "ویرایش و تخصیص دسترسی‌های نقش" },
  { code: "roles.delete", action: "delete", resource: "roles", category: "نقش‌ها و دسترسی‌ها", description: "حذف نقش‌های غیرسیستمی" },

  // Products
  { code: "products.view", action: "view", resource: "products", category: "محصولات و کاتالوگ", description: "مشاهده کاتالوگ و برش‌های گوشت" },
  { code: "products.create", action: "create", resource: "products", category: "محصولات و کاتالوگ", description: "افزودن محصول جدید به کاتالوگ" },
  { code: "products.update", action: "update", resource: "products", category: "محصولات و کاتالوگ", description: "ویرایش مشخصات فنی و عکس محصولات" },
  { code: "products.delete", action: "delete", resource: "products", category: "محصولات و کاتالوگ", description: "حذف محصول از کاتالوگ" },

  // Categories
  { code: "categories.view", action: "view", resource: "categories", category: "دسته‌بندی‌ها", description: "مشاهده دسته‌بندی‌های گوشت" },
  { code: "categories.create", action: "create", resource: "categories", category: "دسته‌بندی‌ها", description: "ایجاد دسته‌بندی جدید" },
  { code: "categories.update", action: "update", resource: "categories", category: "دسته‌بندی‌ها", description: "ویرایش دسته‌بندی" },
  { code: "categories.delete", action: "delete", resource: "categories", category: "دسته‌بندی‌ها", description: "حذف دسته‌بندی" },

  // Pricing
  { code: "pricing.view", action: "view", resource: "pricing", category: "قیمت‌گذاری و تخفیفات", description: "مشاهده قیمت‌ها و کدهای تخفیف" },
  { code: "pricing.update", action: "update", resource: "pricing", category: "قیمت‌گذاری و تخفیفات", description: "تغییر درصدی قیمت‌ها (Bulk Price) و تخفیف‌ها" },

  // Campaigns
  { code: "campaigns.view", action: "view", resource: "campaigns", category: "کمپین‌ها", description: "مشاهده جشنواره‌ها و کمپین‌ها" },
  { code: "campaigns.create", action: "create", resource: "campaigns", category: "کمپین‌ها", description: "ایجاد کمپین فصلی جدید" },
  { code: "campaigns.update", action: "update", resource: "campaigns", category: "کمپین‌ها", description: "ویرایش کمپین" },
  { code: "campaigns.delete", action: "delete", resource: "campaigns", category: "کمپین‌ها", description: "حذف کمپین" },

  // Landing
  { code: "landing.view", action: "view", resource: "landing", category: "صفحه فرود (CMS)", description: "مشاهده محتوای صفحه فرود" },
  { code: "landing.update", action: "update", resource: "landing", category: "صفحه فرود (CMS)", description: "ویرایش اجزای صفحه فرود و بنرها" },

  // Blog
  { code: "blog.view", action: "view", resource: "blog", category: "وبلاگ و مقالات", description: "مشاهده مقالات و دسته‌بندی‌های بلاگ" },
  { code: "blog.create", action: "create", resource: "blog", category: "وبلاگ و مقالات", description: "نگارش و انتشار مقاله جدید" },
  { code: "blog.update", action: "update", resource: "blog", category: "وبلاگ و مقالات", description: "ویرایش مقاله و تنظیمات سئو" },
  { code: "blog.delete", action: "delete", resource: "blog", category: "وبلاگ و مقالات", description: "حذف مقاله" },

  // Media
  { code: "media.view", action: "view", resource: "media", category: "رسانه و فایل‌ها", description: "مشاهده گالری فایل‌ها" },
  { code: "media.create", action: "create", resource: "media", category: "رسانه و فایل‌ها", description: "آپلود تصاویر و ویدیوی اختصاصی" },
  { code: "media.delete", action: "delete", resource: "media", category: "رسانه و فایل‌ها", description: "حذف فایل‌های رسانه‌ای" },

  // Contacts
  { code: "contacts.view", action: "view", resource: "contacts", category: "پیام‌ها و پشتیبانی", description: "مشاهده پیام‌های تماس و همکاری" },
  { code: "contacts.update", action: "update", resource: "contacts", category: "پیام‌ها و پشتیبانی", description: "پاسخگویی و تغییر وضعیت پیام‌ها" },

  // Settings
  { code: "settings.view", action: "view", resource: "settings", category: "تنظیمات و نظارت", description: "مشاهده تنظیمات سامانه و لاگ‌ها" },
  { code: "settings.update", action: "update", resource: "settings", category: "تنظیمات و نظارت", description: "ویرایش تنظیمات اصلی سامانه" },
];

// Canonical RBAC Roles
export const canonicalRoles = [
  "SUPER_ADMIN",
  "ADMIN",
  "CONTENT_MANAGER",
  "PRODUCT_MANAGER",
  "SALES_MANAGER",
  "SUPPORT",
  "VIEWER",
] as const;

export type CanonicalRole = (typeof canonicalRoles)[number];

// User Management Validators
export const createUserSchema = z.object({
  firstName: z.string().min(2, "نام حداقل ۲ کاراکتر الزامی است"),
  lastName: z.string().min(2, "نام خانوادگی حداقل ۲ کاراکتر الزامی است"),
  email: z.string().email("فرمت ایمیل نامعتبر است"),
  phone: z.string().optional().nullable(),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  roles: z.array(z.string().min(1)).min(1, "حداقل یک نقش کاربری معتبر الزامی است"),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2, "نام حداقل ۲ کاراکتر الزامی است").optional(),
  lastName: z.string().min(2, "نام خانوادگی حداقل ۲ کاراکتر الزامی است").optional(),
  email: z.string().email("فرمت ایمیل نامعتبر است").optional(),
  phone: z.string().optional().nullable(),
  roles: z.array(z.string().min(1)).min(1, "حداقل یک نقش کاربری الزامی است").optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
});

export const userQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "شماره صفحه نامعتبر است")
    .optional()
    .default(1 as any),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "تعداد در صفحه باید بین ۱ تا ۱۰۰ باشد")
    .optional()
    .default(10 as any),
});

// Role Management Validators
export const createRoleSchema = z.object({
  name: z.string().min(2, "شناسه نقش (انگلیسی) الزامی است").regex(/^[A-Z0-9_]+$/, "شناسه نقش باید حروف بزرگ انگلیسی، عدد یا خط فاصله زیر (_) باشد"),
  title: z.string().min(2, "عنوان فارسی نقش الزامی است"),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, "شناسه نقش الزامی است").regex(/^[A-Z0-9_]+$/, "شناسه نقش باید حروف بزرگ انگلیسی باشد").optional(),
  title: z.string().min(2, "عنوان فارسی نقش الزامی است").optional(),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

export const updateRolePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

// Bulk Price Update Validator
export const bulkPriceUpdateSchema = z.object({
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("PERCENTAGE"),
  value: z.number().optional(),
  percentageChange: z.number().min(-90, "کاهش قیمت نمی‌تواند بیش از ۹۰٪ باشد").max(500, "افزایش قیمت نمی‌تواند بیش از ۵۰۰٪ باشد").optional(),
  productIds: z.array(z.string()).optional(),
  categoryId: z.string().optional().nullable(),
  roundToNearest: z.number().positive().default(1000),
}).refine((data) => {
  const val = data.percentageChange ?? data.value;
  if (data.type === "PERCENTAGE" && val !== undefined) {
    return val >= -90 && val <= 500;
  }
  return true;
}, {
  message: "تغییر درصدی قیمت باید بین ۹۰- درصد و ۵۰۰+ درصد باشد",
  path: ["percentageChange"],
});

// -------------------------------------------------------------
// Blog Domain Validators (Phase 4)
// -------------------------------------------------------------

export const createBlogCategorySchema = z.object({
  name: z.string().min(2, "نام دسته‌بندی وبلاگ الزامی است"),
  slug: z.string().min(2, "شناسه لاتین (slug) الزامی است"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateBlogCategorySchema = createBlogCategorySchema.partial();

export const createBlogTagSchema = z.object({
  name: z.string().min(2, "نام برچسب الزامی است"),
  slug: z.string().optional(),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(3, "عنوان مقاله الزامی است"),
  slug: z.string().min(2, "اسلاگ مقاله الزامی است").optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10, "محتوای مقاله الزامی است"),
  featuredImage: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).optional().default([]),
  tagNames: z.array(z.string()).optional().default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const blogPostQuerySchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "شماره صفحه نامعتبر است")
    .optional()
    .default(1 as any),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "تعداد در صفحه باید بین ۱ تا ۱۰۰ باشد")
    .optional()
    .default(10 as any),
});

