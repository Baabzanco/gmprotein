import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { CategoryDTO } from "../../../shared/types";

const defaultCategories: CategoryDTO[] = [
  {
    id: "cat-beef",
    name: "گوشت گوساله و استیک",
    slug: "beef-steak",
    description: "انواع برش‌های فیله، راسته و استیک‌های ماربل گوساله",
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat-lamb",
    name: "گوشت گوسفندی شاندیزی",
    slug: "lamb-shandiz",
    description: "شیشلیک، ماهیچه و ران گوسفندی نرینه شاندیز",
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat-special",
    name: "برش‌های خاص و باربیکیو",
    slug: "special-cuts",
    description: "تاماهاوک، تی‌بن و برش‌های مرینیت شده اختصاصی",
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat-sale",
    name: "تخفیفدار",
    slug: "discounted",
    description: "محصولات دارای تخفیف جشنواره و فصلی",
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let inMemoryCategories: CategoryDTO[] = [...defaultCategories];

export class CategoryRepository {
  async findAll(): Promise<CategoryDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const cats = await prisma.category.findMany({
          where: { deletedAt: null, isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { children: true },
        });

        return cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          parentId: c.parentId,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
          children: c.children?.map((ch) => ({
            id: ch.id,
            name: ch.name,
            slug: ch.slug,
            description: ch.description,
            sortOrder: ch.sortOrder,
            isActive: ch.isActive,
            createdAt: ch.createdAt.toISOString(),
            updatedAt: ch.updatedAt.toISOString(),
          })),
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryCategories;
  }

  async findById(id: string): Promise<CategoryDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const c = await prisma.category.findUnique({
          where: { id },
          include: { children: true },
        });
        if (!c || c.deletedAt) return null;
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          parentId: c.parentId,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryCategories.find((c) => c.id === id) || null;
  }

  async create(data: any): Promise<CategoryDTO> {
    if (isDatabaseConnected()) {
      const prisma = getPrismaClient();
      const created = await prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          image: data.image,
          parentId: data.parentId,
          sortOrder: data.sortOrder || 0,
          isActive: data.isActive ?? true,
        },
      });
      return {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        sortOrder: created.sortOrder,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    }

    const newCat: CategoryDTO = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      parentId: data.parentId,
      sortOrder: data.sortOrder || 0,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryCategories.push(newCat);
    return newCat;
  }

  async update(id: string, data: any): Promise<CategoryDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.parentId !== undefined) updateData.parentId = data.parentId;
        if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const updated = await prisma.category.update({
          where: { id },
          data: updateData,
        });

        return {
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          description: updated.description,
          image: updated.image,
          parentId: updated.parentId,
          sortOrder: updated.sortOrder,
          isActive: updated.isActive,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }

    const idx = inMemoryCategories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const existing = inMemoryCategories[idx];
    const updated: CategoryDTO = {
      ...existing,
      ...data,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : existing.sortOrder,
      updatedAt: new Date().toISOString(),
    };
    inMemoryCategories[idx] = updated;
    return updated;
  }

  async countProducts(id: string): Promise<number> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.product.count({
          where: {
            categoryId: id,
            deletedAt: null,
          },
        });
      } catch {
        // Fallback
      }
    }

    const { productRepository } = await import("./product.repository");
    const prods = await productRepository.findAll();
    return prods.filter((p) => p.categoryId === id).length;
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const productCount = await this.countProducts(id);
    if (productCount > 0) {
      return {
        success: false,
        error: `امکان حذف این دسته‌بندی وجود ندارد زیرا دارای ${productCount} محصول فعال است. ابتدا محصولات را به دسته دیگری انتقال داده یا حذف کنید.`,
      };
    }

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.category.update({
          where: { id },
          data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "خطا در حذف دسته‌بندی از پایگاه داده" };
      }
    }

    const idx = inMemoryCategories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      inMemoryCategories.splice(idx, 1);
      return { success: true };
    }
    return { success: false, error: "دسته‌بندی یافت نشد." };
  }
}

export const categoryRepository = new CategoryRepository();
