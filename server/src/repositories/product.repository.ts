import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { ProductDTO } from "../../../shared/types";
import { Decimal } from "@prisma/client/runtime/library";

// Default initial catalog
const defaultProducts: ProductDTO[] = [
  {
    id: "prod-1",
    name: "استیک ریب‌آی گوساله ممتاز (Ribeye Steak)",
    slug: "ribeye-steak",
    description: "برش خورده از راسته با ماربلینگ فوق‌العاده درجه A+، مناسب گریل حرفه‌ای و رستوران‌های لوکس با بافت لطیف و طعم عمیق.",
    sku: "PG-RIB-01",
    categoryId: "cat-beef",
    basePrice: 1250000,
    effectivePrice: 1062500,
    discountPercentage: 15,
    unit: "کیلوگرم",
    minimumOrder: 1,
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
    sku: "PG-LAMB-02",
    categoryId: "cat-lamb",
    basePrice: 1480000,
    effectivePrice: 1332000,
    discountPercentage: 10,
    unit: "کیلوگرم",
    minimumOrder: 1,
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
    sku: "PG-FIL-03",
    categoryId: "cat-beef",
    basePrice: 1650000,
    effectivePrice: 1650000,
    discountPercentage: null,
    unit: "کیلوگرم",
    minimumOrder: 1,
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
    sku: "PG-TOM-04",
    categoryId: "cat-special",
    basePrice: 1850000,
    effectivePrice: 1480000,
    discountPercentage: 20,
    unit: "کیلوگرم",
    minimumOrder: 2,
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
          ];
        }

        const items = await prisma.product.findMany({
          where,
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
            prices: { where: { isActive: true }, take: 1, orderBy: { effectiveFrom: "desc" } },
            discountProducts: {
              include: { discount: true },
              where: { discount: { isActive: true } },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return items.map((p) => {
          const basePrice = Number(p.basePrice);
          let discountPercentage: number | null = null;
          let effectivePrice = basePrice;

          const activeDiscount = p.discountProducts[0]?.discount;
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
            category: p.category ? {
              id: p.category.id,
              name: p.category.name,
              slug: p.category.slug,
              description: p.category.description,
              sortOrder: p.category.sortOrder,
              isActive: p.category.isActive,
              createdAt: p.category.createdAt.toISOString(),
              updatedAt: p.category.updatedAt.toISOString(),
            } : undefined,
            basePrice,
            effectivePrice: Math.round(effectivePrice),
            discountPercentage,
            unit: p.unit,
            minimumOrder: Number(p.minimumOrder),
            isAvailable: p.isAvailable,
            isFeatured: p.isFeatured,
            seoTitle: p.seoTitle,
            seoDescription: p.seoDescription,
            images: p.images.map((img) => ({
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
      } catch (err) {
        // Fallback to in-memory on query failure
      }
    }

    let results = inMemoryProducts;
    if (params?.featured !== undefined) {
      results = results.filter((p) => p.isFeatured === params.featured);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
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
            images: true,
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
          basePrice,
          effectivePrice: basePrice,
          unit: p.unit,
          minimumOrder: Number(p.minimumOrder),
          isAvailable: p.isAvailable,
          isFeatured: p.isFeatured,
          images: p.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryProducts.find((p) => p.id === id) || null;
  }

  async create(data: any): Promise<ProductDTO> {
    if (isDatabaseConnected()) {
      const prisma = getPrismaClient();
      const created = await prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          sku: data.sku,
          categoryId: data.categoryId,
          basePrice: new Decimal(data.basePrice),
          unit: data.unit || "kg",
          minimumOrder: new Decimal(data.minimumOrder || 1),
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
        },
        include: { images: true },
      });

      return {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        sku: created.sku,
        categoryId: created.categoryId,
        basePrice: Number(created.basePrice),
        effectivePrice: Number(created.basePrice),
        unit: created.unit,
        minimumOrder: Number(created.minimumOrder),
        isAvailable: created.isAvailable,
        isFeatured: created.isFeatured,
        images: created.images.map((img) => ({
          id: img.id,
          url: img.url,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    }

    const newProd: ProductDTO = {
      id: `prod-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      sku: data.sku,
      categoryId: data.categoryId,
      basePrice: data.basePrice,
      effectivePrice: data.basePrice,
      unit: data.unit || "kg",
      minimumOrder: data.minimumOrder || 1,
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
      const prisma = getPrismaClient();
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.sku !== undefined) updateData.sku = data.sku;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.basePrice !== undefined) updateData.basePrice = new Decimal(data.basePrice);
      if (data.unit !== undefined) updateData.unit = data.unit;
      if (data.minimumOrder !== undefined) updateData.minimumOrder = new Decimal(data.minimumOrder);
      if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
      if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { images: true, category: true },
      });

      return {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        sku: updated.sku,
        categoryId: updated.categoryId,
        basePrice: Number(updated.basePrice),
        effectivePrice: Number(updated.basePrice),
        unit: updated.unit,
        minimumOrder: Number(updated.minimumOrder),
        isAvailable: updated.isAvailable,
        isFeatured: updated.isFeatured,
        images: updated.images.map((img) => ({
          id: img.id,
          url: img.url,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }

    const idx = inMemoryProducts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = inMemoryProducts[idx];
    const updated: ProductDTO = {
      ...existing,
      ...data,
      basePrice: data.basePrice !== undefined ? Number(data.basePrice) : existing.basePrice,
      effectivePrice: data.basePrice !== undefined ? Number(data.basePrice) : existing.effectivePrice,
      updatedAt: new Date().toISOString(),
    };
    inMemoryProducts[idx] = updated;
    return updated;
  }

  async bulkUpdatePrices(productIds: string[], percentageChange: number): Promise<number> {
    let affected = 0;
    for (const id of productIds) {
      const p = await this.findById(id);
      if (p) {
        const newPrice = Math.round(p.basePrice * (1 + percentageChange / 100));
        await this.update(id, { basePrice: newPrice });
        affected++;
      }
    }
    return affected;
  }

  async softDelete(id: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      const prisma = getPrismaClient();
      await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
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
