import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding for Protein Golmohammadi...");

  // 1. Seed Roles
  const roles = [
    { name: "SUPER_ADMIN", description: "دسترسی کامل و نامحدود به تمامی بخش‌ها و تنظیمات سیستم", isSystem: true },
    { name: "ADMIN", description: "مدیریت ارشد عملیات، محتوا و کاتالوگ", isSystem: true },
    { name: "CONTENT_MANAGER", description: "مدیریت محتوای سایت، بلاگ، سوالات متداول و بخش‌های صفحه فرود", isSystem: false },
    { name: "PRODUCT_MANAGER", description: "مدیریت محصولات، قیمت‌گذاری و دسته‌بندی‌ها", isSystem: false },
    { name: "SALES_MANAGER", description: "بررسی و پردازش پیش‌فاکتورها و استعلام‌های مشتریان", isSystem: false },
    { name: "SUPPORT", description: "پاسخگویی به درخواست‌های تماس و تیکت‌ها", isSystem: false },
    { name: "VIEWER", description: "مشاهده گزارش‌ها و آمار به صورت فقط-خواندنی", isSystem: false },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }
  console.log("✓ Roles seeded.");

  // 2. Seed Permissions
  const permissions = [
    { action: "MANAGE", resource: "*", description: "دسترسی کامل سیستمی" },
    { action: "READ", resource: "products", description: "مشاهده محصولات" },
    { action: "CREATE", resource: "products", description: "ایجاد محصول" },
    { action: "UPDATE", resource: "products", description: "ویرایش محصول" },
    { action: "DELETE", resource: "products", description: "حذف محصول" },
    { action: "READ", resource: "quotations", description: "مشاهده پیش‌فاکتورها" },
    { action: "UPDATE", resource: "quotations", description: "تغییر وضعیت پیش‌فاکتورها" },
    { action: "READ", resource: "contact_requests", description: "مشاهده پیام‌های تماس" },
    { action: "READ", resource: "audit_logs", description: "مشاهده گزارش‌های امنیتی" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { action_resource: { action: p.action, resource: p.resource } },
      update: { description: p.description },
      create: p,
    });
  }
  console.log("✓ Permissions seeded.");

  // 3. Seed Super Admin User
  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  const adminEmail = process.env.ADMIN_EMAIL || "admin@golmohamadi.com";
  const passwordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "Admin@PG2026!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, isActive: true },
    create: {
      firstName: "مدیر",
      lastName: "کل سیستم",
      email: adminEmail,
      phone: "09120000000",
      passwordHash,
      isActive: true,
    },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: superAdminRole.id },
    });
  }
  console.log(`✓ Super Admin user ensured (${adminEmail}).`);

  // 4. Seed Categories
  const categories = [
    { id: "cat-beef", name: "گوشت گوساله و استیک", slug: "beef-steak", sortOrder: 1 },
    { id: "cat-lamb", name: "گوشت گوسفندی شاندیزی", slug: "lamb-shandiz", sortOrder: 2 },
    { id: "cat-special", name: "برش‌های خاص و باربیکیو", slug: "special-cuts", sortOrder: 3 },
    { id: "cat-sale", name: "تخفیفدار", slug: "discounted", sortOrder: 4 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
  }
  console.log("✓ Categories seeded.");

  // 5. Seed Products
  const products = [
    {
      id: "prod-ribeye",
      name: "استیک ریب‌آی گوساله ممتاز (Ribeye Steak)",
      slug: "ribeye-steak",
      description: "برش خورده از راسته با ماربلینگ فوق‌العاده درجه A+، مناسب گریل حرفه‌ای و رستوران‌های لوکس با بافت لطیف و طعم عمیق.",
      sku: "PG-RIB-01",
      categoryId: "cat-beef",
      basePrice: 1250000,
      unit: "کیلوگرم",
      minimumOrder: 1,
      isAvailable: true,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "prod-lamb",
      name: "راسته گوسفندی شاندیزی دستچین (Rack of Lamb)",
      slug: "rack-of-lamb",
      description: "برش شاندیزی بدون چربی اضافه، گوشت بره نرینه جوان پرواری با استخوان تراشیده شده، ترد و بی‌نظیر.",
      sku: "PG-LAMB-02",
      categoryId: "cat-lamb",
      basePrice: 1480000,
      unit: "کیلوگرم",
      minimumOrder: 1,
      isAvailable: true,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "prod-tenderloin",
      name: "فیله گوساله تمیزشده بدون چربی (Tenderloin)",
      slug: "beef-tenderloin",
      description: "خالص‌ترین و نرم‌ترین بخش گوشت گوساله، ایده‌آل برای بیف استروگانف، فیله مینیون و منوهای پرطرفدار هتل‌های پنج‌ستاره.",
      sku: "PG-FIL-03",
      categoryId: "cat-beef",
      basePrice: 1650000,
      unit: "کیلوگرم",
      minimumOrder: 1,
      isAvailable: true,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "prod-tomahawk",
      name: "دنده گوساله تاماهاوک (Tomahawk Steak)",
      slug: "tomahawk-steak",
      description: "برش باشکوه با استخوان دنده کامل، درای‌ایج شده در دمای استاندارد رطوبتی، مخصوص منوهای پرمیوم باربیکیو.",
      sku: "PG-TOM-04",
      categoryId: "cat-special",
      basePrice: 1850000,
      unit: "کیلوگرم",
      minimumOrder: 2,
      isAvailable: true,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80",
    },
  ];

  for (const p of products) {
    const { imageUrl, ...prodData } = p;
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { basePrice: prodData.basePrice, description: prodData.description },
      create: prodData,
    });

    if (imageUrl) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: imageUrl,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
  }
  console.log("✓ Products seeded.");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
