import { Express } from "express";
import swaggerUi from "swagger-ui-express";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Protein Golmohammadi REST API",
    version: "1.0.0",
    description: "مستندات تعاملی API پلتفرم تأمین و فرآوری گوشت لوکس پروتئین گلمحمدی",
    contact: {
      name: "تیم فنی پروتئین گلمحمدی",
      email: "info@golmohamadi.com",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1 Endpoint",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "توکن دسترسی JWT دریافت شده از /auth/login",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "object" },
          meta: { type: "object" },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object" },
            },
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          sku: { type: "string" },
          basePrice: { type: "number" },
          effectivePrice: { type: "number" },
          discountPercentage: { type: "number", nullable: true },
          unit: { type: "string" },
          isAvailable: { type: "boolean" },
          isFeatured: { type: "boolean" },
        },
      },
      QuotationRequest: {
        type: "object",
        required: ["customerName", "phone", "items"],
        properties: {
          customerName: { type: "string" },
          companyName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          notes: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "requestedWeight"],
              properties: {
                productId: { type: "string" },
                requestedWeight: { type: "number" },
                quantity: { type: "integer", default: 1 },
                unit: { type: "string", default: "kg" },
              },
            },
          },
        },
      },
      ContactRequest: {
        type: "object",
        required: ["name", "phone", "subject", "message"],
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          company: { type: "string" },
          email: { type: "string" },
          subject: { type: "string" },
          message: { type: "string" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@golmohamadi.com" },
          password: { type: "string", example: "Admin@PG2026!" },
        },
      },
    },
  },
  paths: {
    "/products": {
      get: {
        summary: "دریافت کاتالوگ محصولات",
        tags: ["Products"],
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "featured", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          200: {
            description: "لیست محصولات با موفقیت دریافت شد",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
        },
      },
      post: {
        summary: "ایجاد محصول جدید (نیازمند نقش مدیر یا مدیر محصول)",
        tags: ["Products"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } },
        },
        responses: {
          201: { description: "محصول با موفقیت ایجاد شد" },
          401: { description: "احراز هویت نشده" },
          403: { description: "دسترسی ناکافی" },
        },
      },
    },
    "/products/{id}": {
      get: {
        summary: "مشاهده جزئیات یک محصول",
        tags: ["Products"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "جزئیات محصول" },
          404: { description: "محصول یافت نشد" },
        },
      },
    },
    "/categories": {
      get: {
        summary: "دریافت دسته‌بندی‌های فعال کاتالوگ",
        tags: ["Categories"],
        responses: { 200: { description: "لیست دسته‌ها" } },
      },
    },
    "/quotations": {
      post: {
        summary: "ثبت استعلام پیش‌فاکتور رسمی",
        tags: ["Quotations"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/QuotationRequest" } } },
        },
        responses: {
          201: { description: "پیش‌فاکتور با موفقیت ثبت شد" },
          400: { description: "خطای اعتبارسنجی ورودی" },
        },
      },
      get: {
        summary: "مشاهده تمام پیش‌فاکتورها (مدیران)",
        tags: ["Quotations"],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "لیست استعلام‌ها" } },
      },
    },
    "/contact-requests": {
      post: {
        summary: "ارسال فرم تماس و درخواست همکاری",
        tags: ["Contact"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ContactRequest" } } },
        },
        responses: { 201: { description: "پیام با موفقیت ثبت شد" } },
      },
    },
    "/auth/login": {
      post: {
        summary: "ورود به سیستم و دریافت توکن JWT",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: { description: "ورود موفقیت‌آمیز" },
          401: { description: "ایمیل یا رمز عبور اشتباه" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "مشاهده پروفایل کاربر جاری",
        tags: ["Auth"],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "اطلاعات کاربر" } },
      },
    },
    "/landing/all": {
      get: {
        summary: "دریافت یکپارچه تمام داده‌های صفحه فرود (کمپین، سوالات متداول، همکاران، دستاوردها)",
        tags: ["Landing"],
        responses: { 200: { description: "محتوای صفحه اصلی" } },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openApiSpec);
  });
}
