import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { ProductDTO, ProductPackageOptionDTO, ProductFeatureDTO } from "../../../shared/types";
import { Decimal } from "@prisma/client/runtime/library";
import { generateProductSku } from "../utils/skuGenerator";
import { categoryRepository } from "./category.repository";

// Default initial catalog with predefined weight package variants and structured product features
const defaultProducts: ProductDTO[] = [
  {
    id: "prod-1",
    name: "استیک ریب‌آی گوساله ممتاز (Ribeye Steak)",
    slug: "ribeye-steak",
    description: "برش خورده از راسته با ماربلینگ فوق‌العاده درجه A+، مناسب گریل حرفه‌ای و رستوران‌های لوکس با بافت لطیف و طعم عمیق.",
    shortDescription: "ماربلینگ فوق‌العاده A+، بافت ترد و لطیف برای گریل حرفه‌ای",
    sku: "PG-RIB-01",
    categoryId: "cat-beef",
    basePrice: 1250000,
    effectivePrice: 1062500,
    discountPercentage: 15,
    unit: "کیلوگرم",
    minimumOrder: 1,
    allowCustomWeight: true,
    features: [
      { id: "feat-1-1", name: "نوع برش", value: "راسته گوساله برش ریب‌آی بدون استخوان", sortOrder: 1 },
      { id: "feat-1-2", name: "درجه ماربلینگ", value: "درجه A+ با رگه‌های چربی یکنواخت", sortOrder: 2 },
      { id: "feat-1-3", name: "شرایط نگهداری", value: "دمای ۰ الی ۴ درجه سانتی‌گراد در وکیوم استاندارد", sortOrder: 3 },
      { id: "feat-1-4", name: "پیشنهاد سرآشپز", value: "استیک مدیم-ریر، تابه چدنی با کره و رزماری", sortOrder: 4 },
      { id: "feat-1-5", name: "زنجیره تأمین", value: "کشتارگاه اختصاصی صنعتی با پایش هوشمند دما", sortOrder: 5 },
    ],
    packageOptions: [
      { id: "pkg-1-1", weightKg: 10, label: "بسته ۱۰ کیلوگرمی", isDefault: false, sortOrder: 1 },
      { id: "pkg-1-2", weightKg: 25, label: "کارتن ۲۵ کیلوگرمی عمده", isDefault: true, sortOrder: 2 },
      { id: "pkg-1-3", weightKg: 50, label: "پالت ۵۰ کیلوگرمی رستورانی", isDefault: false, sortOrder: 3 },
    ],
    isAvailable: true,
    isFeatured: true,
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80",
        sortOrder: 0,
        isPrimary: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "راسته گوسفندی شاندیزی دستچین (Rack of Lamb)",
    slug: "rack-of-lamb",
    description: "برش شاندیزی بدون چربی اضافه، گوشت بره نرینه جوان پرواری با استخوان تراشیده شده، ترد و بی‌نظیر.",
    shortDescription: "بره نرینه دستچین با استخوان تراشیده شاندیزی فرانسوی",
    sku: "PG-LAMB-02",
    categoryId: "cat-lamb",
    basePrice: 1480000,
    effectivePrice: 1332000,
    discountPercentage: 10,
    unit: "کیلوگرم",
    minimumOrder: 1,
    allowCustomWeight: true,
    features: [
      { id: "feat-2-1", name: "نوع برش", value: "شاندیزی با استخوان تمیز فرانسوی (French Trimmed)", sortOrder: 1 },
      { id: "feat-2-2", name: "سن و نژاد دام", value: "بره نرینه پرواری زیر ۶ ماه دشت مغان", sortOrder: 2 },
      { id: "feat-2-3", name: "شرایط نگهداری", value: "حفظ زنجیره سرد ۰ الی ۲ درجه سانتی‌گراد", sortOrder: 3 },
      { id: "feat-2-4", name: "کاربرد تخصصی", value: "کباب شاندیزی مجلسی، گریل و رستوران‌های هتلینگ", sortOrder: 4 },
    ],
    packageOptions: [
      { id: "pkg-2-1", weightKg: 5, label: "بسته ۵ کیلوگرمی دستچین", isDefault: false, sortOrder: 1 },
      { id: "pkg-2-2", weightKg: 15, label: "بسته ۱۵ کیلوگرمی شاندیزی", isDefault: true, sortOrder: 2 },
      { id: "pkg-2-3", weightKg: 30, label: "کارتن ۳۰ کیلوگرمی هتلینگ", isDefault: false, sortOrder: 3 },
    ],
    isAvailable: true,
    isFeatured: true,
    images: [
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        sortOrder: 0,
        isPrimary: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    name: "فیله گوساله تمیزشده بدون چربی (Tenderloin)",
    slug: "beef-tenderloin",
    description: "خالص‌ترین و نرم‌ترین بخش گوشت گوساله، ایده‌آل برای بیف استروگانف، فیله مینیون و منوهای پرطرفدار هتل‌های پنج‌ستاره.",
    shortDescription: "خالص‌ترین فیله بدون چربی، لطافت بی‌نظیر برای منوهای پرمیوم",
    sku: "PG-FIL-03",
    categoryId: "cat-beef",
    basePrice: 1650000,
    effectivePrice: 1650000,
    discountPercentage: null,
    unit: "کیلوگرم",
    minimumOrder: 1,
    allowCustomWeight: true,
    features: [
      { id: "feat-3-1", name: "نوع برش", value: "فیله کامل پاک‌شده بدون غشا و چربی اضافه", sortOrder: 1 },
      { id: "feat-3-2", name: "درصد چربی", value: "کمتر از ۲ درصد خالص پروتئین", sortOrder: 2 },
      { id: "feat-3-3", name: "بسته‌بندی", value: "وکیوم متالایز آنتی‌باکتریال با تزریق گاز نیتروژن", sortOrder: 3 },
      { id: "feat-3-4", name: "مناسب برای", value: "فیله مینیون، تاتاکی، بیف استروگانف و استیک آبدار", sortOrder: 4 },
    ],
    packageOptions: [
      { id: "pkg-3-1", weightKg: 10, label: "بسته ۱۰ کیلوگرمی وکیوم", isDefault: true, sortOrder: 1 },
      { id: "pkg-3-2", weightKg: 20, label: "کارتن ۲۰ کیلوگرمی فیله ممتاز", isDefault: false, sortOrder: 2 },
      { id: "pkg-3-3", weightKg: 40, label: "سفارش عمده ۴۰ کیلوگرمی", isDefault: false, sortOrder: 3 },
    ],
    isAvailable: true,
    isFeatured: true,
    images: [
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
        sortOrder: 0,
        isPrimary: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-4",
    name: "دنده گوساله تاماهاوک (Tomahawk Steak)",
    slug: "tomahawk-steak",
    description: "برش باشکوه با استخوان دنده کامل، درای‌ایج شده در دمای استاندارد رطوبتی، مخصوص منوهای پرمیوم باربیکیو.",
    shortDescription: "درای‌ایج شده ۲۱ روزه با استخوان بلند مخصوص کباب و گریل ویژه",
    sku: "PG-TOM-04",
    categoryId: "cat-special",
    basePrice: 1850000,
    effectivePrice: 1480000,
    discountPercentage: 20,
    unit: "کیلوگرم",
    minimumOrder: 2,
    allowCustomWeight: true,
    features: [
      { id: "feat-4-1", name: "نوع برش", value: "استیک تاماهاوک با استخوان کامل ۳۵ سانتی‌متری", sortOrder: 1 },
      { id: "feat-4-2", name: "فرآیند کهنگی", value: "۲۱ روز درای‌ایج (Dry Aged) در اتاقک نمک هیمالیا", sortOrder: 2 },
      { id: "feat-4-3", name: "بافت و طعم", value: "طعم غلیظ گوشت دودی با بافت استثنایی و ترد", sortOrder: 3 },
      { id: "feat-4-4", name: "پیشنهاد مصرف", value: "باربیکیو، گریل زغالی و مهمانی‌های VIP", sortOrder: 4 },
    ],
    packageOptions: [
      { id: "pkg-4-1", weightKg: 10, label: "کارتن ۱۰ کیلوگرمی تاماهاوک", isDefault: true, sortOrder: 1 },
      { id: "pkg-4-2", weightKg: 25, label: "کارتن ۲۵ کیلوگرمی رستورانی", isDefault: false, sortOrder: 2 },
      { id: "pkg-4-3", weightKg: 50, label: "پالت اختصاصی ۵۰ کیلوگرمی", isDefault: false, sortOrder: 3 },
    ],
    isAvailable: true,
    isFeatured: true,
    images: [
      {
        id: "img-4",
        url: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80",
        sortOrder: 0,
        isPrimary: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let inMemoryProducts: ProductDTO[] = [...defaultProducts];

export class ProductRepository {
  async findAll(params?: { category?: string; search?: string; featured?: boolean }): Promise<ProductDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = { deletedAt: null, isAvailable: true };

        if (params?.featured !== undefined) {
          where.isFeatured = params.featured;
        }

        if (params?.category && params.category !== "همه محصولات") {
          where.category = { name: params.category };
        }

        if (params?.search) {
          where.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
            { sku: { contains: params.search, mode: "insensitive" } },
          ];
        }

        const items = await prisma.product.findMany({
          where,
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
            features: { orderBy: { sortOrder: "asc" } },
            prices: { where: { isActive: true }, take: 1, orderBy: { effectiveFrom: "desc" } },
            packageOptions: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
            discountProducts: {
              include: { discount: true },
              where: { discount: { isActive: true } },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return items.map((p: any) => {
          const basePrice = Number(p.basePrice);
          let discountPercentage: number | null = null;
          let effectivePrice = basePrice;

          const activeDiscount = p.discountProducts?.[0]?.discount;
          if (activeDiscount) {
            if (activeDiscount.type === "PERCENTAGE") {
              discountPercentage = Number(activeDiscount.value);
              effectivePrice = basePrice * (1 - discountPercentage / 100);
            } else {
              effectivePrice = Math.max(0, basePrice - Number(activeDiscount.value));
              discountPercentage = Math.round(((basePrice - effectivePrice) / basePrice) * 100);
            }
          }

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            shortDescription: p.shortDescription,
            description: p.description,
            sku: p.sku,
            categoryId: p.categoryId,
            category: p.category
              ? {
                  id: p.category.id,
                  name: p.category.name,
                  slug: p.category.slug,
                  description: p.category.description,
                  sortOrder: p.category.sortOrder,
                  isActive: p.category.isActive,
                  createdAt: p.category.createdAt.toISOString(),
                  updatedAt: p.category.updatedAt.toISOString(),
                }
              : undefined,
            basePrice,
            effectivePrice: Math.round(effectivePrice),
            discountPercentage,
            unit: p.unit,
            minimumOrder: Number(p.minimumOrder),
            allowCustomWeight: p.allowCustomWeight ?? true,
            features: p.features?.map((f: any) => ({
              id: f.id,
              productId: f.productId,
              name: f.name,
              value: f.value,
              sortOrder: f.sortOrder,
            })) || [],
            packageOptions: p.packageOptions?.map((opt: any) => ({
              id: opt.id,
              weightKg: Number(opt.weightKg),
              label: opt.label,
              isDefault: opt.isDefault,
              sortOrder: opt.sortOrder,
              isActive: opt.isActive,
            })) || [],
            isAvailable: p.isAvailable,
            isFeatured: p.isFeatured,
            seoTitle: p.seoTitle,
            seoDescription: p.seoDescription,
            images: p.images.map((img: any) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
            })),
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        });
      } catch {
        // Fallback to in-memory on query failure
      }
    }

    let results = inMemoryProducts;
    if (params?.featured !== undefined) {
      results = results.filter((p) => p.isFeatured === params.featured);
    }
    if (params?.category && params.category !== "همه محصولات") {
      const cat = inMemoryProducts.find((p) => p.category?.name === params.category || p.categoryId === params.category);
      if (cat) {
        results = results.filter((p) => p.categoryId === cat.categoryId);
      }
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    return results;
  }

  async findById(id: string): Promise<ProductDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const p = await prisma.product.findUnique({
          where: { id },
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
            features: { orderBy: { sortOrder: "asc" } },
            packageOptions: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
            discountProducts: { include: { discount: true } },
          },
        });
        if (!p || p.deletedAt) return null;
        const basePrice = Number(p.basePrice);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          description: p.description,
          sku: p.sku,
          categoryId: p.categoryId,
          category: p.category
            ? {
                id: p.category.id,
                name: p.category.name,
                slug: p.category.slug,
                description: p.category.description,
                sortOrder: p.category.sortOrder,
                isActive: p.category.isActive,
                createdAt: p.category.createdAt.toISOString(),
                updatedAt: p.category.updatedAt.toISOString(),
              }
            : undefined,
          basePrice,
          effectivePrice: basePrice,
          unit: p.unit,
          minimumOrder: Number(p.minimumOrder),
          allowCustomWeight: (p as any).allowCustomWeight ?? true,
          features: (p as any).features?.map((f: any) => ({
            id: f.id,
            productId: f.productId,
            name: f.name,
            value: f.value,
            sortOrder: f.sortOrder,
          })) || [],
          packageOptions: (p as any).packageOptions?.map((opt: any) => ({
            id: opt.id,
            weightKg: Number(opt.weightKg),
            label: opt.label,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
            isActive: opt.isActive,
          })) || [],
          isAvailable: p.isAvailable,
          isFeatured: p.isFeatured,
          images: p.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      } catch {
        // Fallback
      }
    }
    return inMemoryProducts.find((p) => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<ProductDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const p = await prisma.product.findUnique({
          where: { slug },
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
            features: { orderBy: { sortOrder: "asc" } },
            packageOptions: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
            discountProducts: { include: { discount: true } },
          },
        });
        if (!p || p.deletedAt) return null;
        const basePrice = Number(p.basePrice);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          description: p.description,
          sku: p.sku,
          categoryId: p.categoryId,
          category: p.category
            ? {
                id: p.category.id,
                name: p.category.name,
                slug: p.category.slug,
                description: p.category.description,
                sortOrder: p.category.sortOrder,
                isActive: p.category.isActive,
                createdAt: p.category.createdAt.toISOString(),
                updatedAt: p.category.updatedAt.toISOString(),
              }
            : undefined,
          basePrice,
          effectivePrice: basePrice,
          unit: p.unit,
          minimumOrder: Number(p.minimumOrder),
          allowCustomWeight: (p as any).allowCustomWeight ?? true,
          features: (p as any).features?.map((f: any) => ({
            id: f.id,
            productId: f.productId,
            name: f.name,
            value: f.value,
            sortOrder: f.sortOrder,
          })) || [],
          packageOptions: (p as any).packageOptions?.map((opt: any) => ({
            id: opt.id,
            weightKg: Number(opt.weightKg),
            label: opt.label,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
            isActive: opt.isActive,
          })) || [],
          isAvailable: p.isAvailable,
          isFeatured: p.isFeatured,
          images: p.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      } catch {
        // Fallback
      }
    }
    return inMemoryProducts.find((p) => p.slug === slug || p.id === slug) || null;
  }

  async create(data: any): Promise<ProductDTO> {
    // 1. Deterministic SKU generation if not provided
    let finalSku = data.sku;
    if (!finalSku || finalSku.trim() === "") {
      const category = await categoryRepository.findById(data.categoryId);
      const existingSkus = inMemoryProducts.map((p) => p.sku);
      finalSku = await generateProductSku(data.categoryId, category?.slug || category?.name, existingSkus);
    }

    // Auto-derive slug if omitted
    const finalSlug = data.slug && data.slug.trim() !== ""
      ? data.slug.trim()
      : `${data.name.trim().toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const packageOptionsData = Array.isArray(data.packageOptions)
      ? data.packageOptions.map((opt: any, idx: number) => ({
          weightKg: new Decimal(opt.weightKg),
          label: opt.label || `بسته ${opt.weightKg} کیلوگرمی`,
          isDefault: Boolean(opt.isDefault),
          sortOrder: opt.sortOrder !== undefined ? Number(opt.sortOrder) : idx + 1,
          isActive: opt.isActive ?? true,
        }))
      : undefined;

    const featuresData = Array.isArray(data.features)
      ? data.features.filter((f: any) => f && f.name && f.value).map((f: any, idx: number) => ({
          name: String(f.name).trim(),
          value: String(f.value).trim(),
          sortOrder: f.sortOrder !== undefined ? Number(f.sortOrder) : idx + 1,
        }))
      : undefined;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.product.create({
          data: {
            name: data.name,
            slug: finalSlug,
            description: data.description || "",
            shortDescription: data.shortDescription,
            sku: finalSku,
            categoryId: data.categoryId,
            basePrice: new Decimal(data.basePrice),
            unit: data.unit || "kg",
            minimumOrder: new Decimal(data.minimumOrder || 1),
            allowCustomWeight: data.allowCustomWeight ?? true,
            isAvailable: data.isAvailable ?? true,
            isFeatured: data.isFeatured ?? false,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            images: data.imageUrl
              ? {
                  create: {
                    url: data.imageUrl,
                    isPrimary: true,
                  },
                }
              : undefined,
            features: featuresData && featuresData.length > 0
              ? {
                  create: featuresData,
                }
              : undefined,
            packageOptions: packageOptionsData
              ? {
                  create: packageOptionsData,
                }
              : undefined,
          },
          include: { images: true, packageOptions: true, features: true },
        });

        return {
          id: created.id,
          name: created.name,
          slug: created.slug,
          shortDescription: created.shortDescription,
          description: created.description,
          sku: created.sku,
          categoryId: created.categoryId,
          basePrice: Number(created.basePrice),
          effectivePrice: Number(created.basePrice),
          unit: created.unit,
          minimumOrder: Number(created.minimumOrder),
          allowCustomWeight: (created as any).allowCustomWeight ?? true,
          features: (created as any).features?.map((f: any) => ({
            id: f.id,
            productId: f.productId,
            name: f.name,
            value: f.value,
            sortOrder: f.sortOrder,
          })) || [],
          packageOptions: (created as any).packageOptions?.map((opt: any) => ({
            id: opt.id,
            weightKg: Number(opt.weightKg),
            label: opt.label,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
          })) || [],
          isAvailable: created.isAvailable,
          isFeatured: created.isFeatured,
          images: created.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("[ProductRepository] Database create failed, falling back to in-memory:", e);
      }
    }

    const newProd: ProductDTO = {
      id: `prod-${Date.now()}`,
      name: data.name,
      slug: finalSlug,
      description: data.description || "",
      shortDescription: data.shortDescription,
      sku: finalSku,
      categoryId: data.categoryId,
      basePrice: Number(data.basePrice),
      effectivePrice: Number(data.basePrice),
      unit: data.unit || "kg",
      minimumOrder: Number(data.minimumOrder || 1),
      allowCustomWeight: data.allowCustomWeight ?? true,
      features: Array.isArray(data.features)
        ? data.features.filter((f: any) => f && f.name && f.value).map((f: any, idx: number) => ({
            id: f.id || `feat-${Date.now()}-${idx}`,
            name: f.name.trim(),
            value: f.value.trim(),
            sortOrder: f.sortOrder !== undefined ? Number(f.sortOrder) : idx + 1,
          }))
        : [],
      packageOptions: Array.isArray(data.packageOptions)
        ? data.packageOptions.map((opt: any, idx: number) => ({
            id: opt.id || `pkg-${Date.now()}-${idx}`,
            weightKg: Number(opt.weightKg),
            label: opt.label || `بسته ${opt.weightKg} کیلوگرمی`,
            isDefault: Boolean(opt.isDefault),
            sortOrder: opt.sortOrder !== undefined ? Number(opt.sortOrder) : idx + 1,
            isActive: opt.isActive ?? true,
          }))
        : [
            { id: `pkg-${Date.now()}-1`, weightKg: 10, label: "بسته ۱۰ کیلوگرمی", isDefault: false, sortOrder: 1 },
            { id: `pkg-${Date.now()}-2`, weightKg: 25, label: "کارتن ۲۵ کیلوگرمی", isDefault: true, sortOrder: 2 },
          ],
      isAvailable: data.isAvailable ?? true,
      isFeatured: data.isFeatured ?? false,
      images: data.imageUrl
        ? [{ id: `img-${Date.now()}`, url: data.imageUrl, sortOrder: 0, isPrimary: true }]
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryProducts.push(newProd);
    return newProd;
  }

  async update(id: string, data: any): Promise<ProductDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
        if (data.slug !== undefined && data.slug.trim() !== "") updateData.slug = data.slug.trim();
        // SKU is immutable once created
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
        if (data.basePrice !== undefined) updateData.basePrice = new Decimal(data.basePrice);
        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.minimumOrder !== undefined) updateData.minimumOrder = new Decimal(data.minimumOrder);
        if (data.allowCustomWeight !== undefined) updateData.allowCustomWeight = Boolean(data.allowCustomWeight);
        if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
        if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
        if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;

        // Image update handling
        if (data.imageUrl !== undefined) {
          await prisma.productImage.deleteMany({ where: { productId: id } });
          if (data.imageUrl && data.imageUrl.trim() !== "") {
            await prisma.productImage.create({
              data: {
                productId: id,
                url: data.imageUrl.trim(),
                isPrimary: true,
                sortOrder: 0,
              },
            });
          }
        }

        // Package Options update
        if (Array.isArray(data.packageOptions)) {
          await (prisma as any).productPackageOption.deleteMany({ where: { productId: id } });
          updateData.packageOptions = {
            create: data.packageOptions.map((opt: any, idx: number) => ({
              weightKg: new Decimal(opt.weightKg),
              label: opt.label || `بسته ${opt.weightKg} کیلوگرمی`,
              isDefault: Boolean(opt.isDefault),
              sortOrder: opt.sortOrder !== undefined ? Number(opt.sortOrder) : idx + 1,
              isActive: opt.isActive ?? true,
            })),
          };
        }

        // Product Features update
        if (Array.isArray(data.features)) {
          await (prisma as any).productFeature.deleteMany({ where: { productId: id } });
          const validFeatures = data.features.filter((f: any) => f && f.name && f.value);
          if (validFeatures.length > 0) {
            updateData.features = {
              create: validFeatures.map((f: any, idx: number) => ({
                name: String(f.name).trim(),
                value: String(f.value).trim(),
                sortOrder: f.sortOrder !== undefined ? Number(f.sortOrder) : idx + 1,
              })),
            };
          }
        }

        const updated = await prisma.product.update({
          where: { id },
          data: updateData,
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            category: true,
            features: { orderBy: { sortOrder: "asc" } },
            packageOptions: { orderBy: { sortOrder: "asc" } },
          },
        });

        return {
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          shortDescription: updated.shortDescription,
          description: updated.description,
          sku: updated.sku,
          categoryId: updated.categoryId,
          basePrice: Number(updated.basePrice),
          effectivePrice: Number(updated.basePrice),
          unit: updated.unit,
          minimumOrder: Number(updated.minimumOrder),
          allowCustomWeight: (updated as any).allowCustomWeight ?? true,
          features: (updated as any).features?.map((f: any) => ({
            id: f.id,
            productId: f.productId,
            name: f.name,
            value: f.value,
            sortOrder: f.sortOrder,
          })) || [],
          packageOptions: (updated as any).packageOptions?.map((opt: any) => ({
            id: opt.id,
            weightKg: Number(opt.weightKg),
            label: opt.label,
            isDefault: opt.isDefault,
            sortOrder: opt.sortOrder,
          })) || [],
          isAvailable: updated.isAvailable,
          isFeatured: updated.isFeatured,
          images: updated.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("[ProductRepository] Database update failed, falling back to in-memory:", e);
      }
    }

    const idx = inMemoryProducts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = inMemoryProducts[idx];
    const updated: ProductDTO = {
      ...existing,
      ...data,
      sku: existing.sku,
      basePrice: data.basePrice !== undefined ? Number(data.basePrice) : existing.basePrice,
      effectivePrice: data.basePrice !== undefined ? Number(data.basePrice) : existing.effectivePrice,
      allowCustomWeight: data.allowCustomWeight !== undefined ? Boolean(data.allowCustomWeight) : existing.allowCustomWeight,
      images: data.imageUrl !== undefined
        ? data.imageUrl ? [{ id: `img-${Date.now()}`, url: data.imageUrl, sortOrder: 0, isPrimary: true }] : []
        : existing.images,
      features: Array.isArray(data.features)
        ? data.features.filter((f: any) => f && f.name && f.value).map((f: any, i: number) => ({
            id: f.id || `feat-${id}-${i}`,
            name: f.name.trim(),
            value: f.value.trim(),
            sortOrder: f.sortOrder !== undefined ? Number(f.sortOrder) : i + 1,
          }))
        : existing.features,
      packageOptions: Array.isArray(data.packageOptions)
        ? data.packageOptions.map((opt: any, i: number) => ({
            id: opt.id || `pkg-${id}-${i}`,
            weightKg: Number(opt.weightKg),
            label: opt.label || `بسته ${opt.weightKg} کیلوگرمی`,
            isDefault: Boolean(opt.isDefault),
            sortOrder: opt.sortOrder !== undefined ? Number(opt.sortOrder) : i + 1,
            isActive: opt.isActive ?? true,
          }))
        : existing.packageOptions,
      updatedAt: new Date().toISOString(),
    };
    inMemoryProducts[idx] = updated;
    return updated;
  }

  async bulkUpdatePrices(options: {
    type?: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    percentageChange?: number;
    productIds?: string[];
    categoryId?: string;
    roundToNearest?: number;
  }): Promise<{ affectedCount: number; updatedProducts: { id: string; name: string; oldPrice: number; newPrice: number }[] }> {
    const type = options.type || "PERCENTAGE";
    const delta = options.value !== undefined ? options.value : options.percentageChange || 0;
    const roundTo = options.roundToNearest || 1000;

    let targetProducts = inMemoryProducts;
    if (options.productIds && options.productIds.length > 0) {
      targetProducts = targetProducts.filter((p) => options.productIds!.includes(p.id));
    } else if (options.categoryId && options.categoryId !== "ALL") {
      targetProducts = targetProducts.filter((p) => p.categoryId === options.categoryId);
    }

    const updatedList: { id: string; name: string; oldPrice: number; newPrice: number }[] = [];

    for (const p of targetProducts) {
      const oldPrice = p.basePrice;
      let newPrice = oldPrice;

      if (type === "PERCENTAGE") {
        newPrice = oldPrice * (1 + delta / 100);
      } else {
        newPrice = oldPrice + delta;
      }

      newPrice = Math.max(1000, Math.round(newPrice / roundTo) * roundTo);
      p.basePrice = newPrice;
      p.effectivePrice = newPrice;
      p.updatedAt = new Date().toISOString();

      updatedList.push({
        id: p.id,
        name: p.name,
        oldPrice,
        newPrice,
      });
    }

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        for (const item of updatedList) {
          await prisma.product.update({
            where: { id: item.id },
            data: { basePrice: new Decimal(item.newPrice) },
          });
        }
      } catch (e) {
        console.warn("[ProductRepository] Prisma bulk price update fallback:", e);
      }
    }

    return {
      affectedCount: updatedList.length,
      updatedProducts: updatedList,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.product.update({
          where: { id },
          data: { deletedAt: new Date(), isAvailable: false },
        });
        return true;
      } catch {
        // Fallback
      }
    }

    const idx = inMemoryProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      inMemoryProducts.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const productRepository = new ProductRepository();
