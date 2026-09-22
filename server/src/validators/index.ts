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

// Product Validators
export const createProductSchema = z.object({
  name: z.string().min(2, "نام محصول الزامی است"),
  slug: z.string().min(2, "نام یکتا (slug) الزامی است"),
  shortDescription: z.string().optional(),
  description: z.string().min(5, "توضیحات محصول الزامی است"),
  sku: z.string().min(2, "کد SKU الزامی است"),
  categoryId: z.string().min(1, "شناسه دسته‌بندی الزامی است"),
  basePrice: z.number().positive("قیمت پایه باید بیشتر از صفر باشد"),
  unit: z.string().default("kg"),
  minimumOrder: z.number().positive().default(1),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  imageUrl: z.string().url("آدرس تصویر معتبر نیست").optional(),
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
  roles: z.array(z.enum(canonicalRoles)).min(1, "حداقل یک نقش کاربری معتبر الزامی است"),
});

// Bulk Price Update Validator
export const bulkPriceUpdateSchema = z.object({
  percentageChange: z
    .number()
    .min(-90, "حداکثر درصد کاهش قیمت ۹۰٪ است")
    .max(500, "حداکثر درصد افزایش قیمت ۵۰۰٪ است"),
  productIds: z.array(z.string()).optional(),
  categoryId: z.string().optional().nullable(),
  roundToNearest: z.number().positive().default(1000),
});
