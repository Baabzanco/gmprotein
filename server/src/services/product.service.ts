import { productRepository } from "../repositories/product.repository";
import { categoryRepository } from "../repositories/category.repository";
import { auditRepository } from "../repositories/audit.repository";
import { ProductDTO, CategoryDTO } from "../../../shared/types";

export class ProductService {
  async getProducts(params?: { category?: string; search?: string; featured?: boolean }): Promise<ProductDTO[]> {
    return productRepository.findAll(params);
  }

  async getProductById(id: string): Promise<ProductDTO | null> {
    return productRepository.findById(id);
  }

  async getProductBySlug(slug: string): Promise<ProductDTO | null> {
    return productRepository.findBySlug(slug);
  }

  async createProduct(data: any, userId?: string): Promise<ProductDTO> {
    const product = await productRepository.create(data);
    await auditRepository.log({
      userId,
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: product.id,
      metadata: { name: product.name, sku: product.sku, basePrice: product.basePrice },
    });
    return product;
  }

  async updateProduct(id: string, data: any, userId?: string): Promise<ProductDTO | null> {
    const updated = await productRepository.update(id, data);
    if (updated) {
      await auditRepository.log({
        userId,
        action: "PRODUCT_UPDATED",
        entity: "Product",
        entityId: id,
        metadata: { ...data },
      });
    }
    return updated;
  }

  async bulkUpdatePrices(
    options: {
      type?: "PERCENTAGE" | "FIXED_AMOUNT";
      value: number;
      percentageChange?: number;
      productIds?: string[];
      categoryId?: string;
      roundToNearest?: number;
    },
    userId?: string
  ): Promise<{ affectedCount: number; updatedProducts: { id: string; name: string; oldPrice: number; newPrice: number }[] }> {
    const result = await productRepository.bulkUpdatePrices(options);
    await auditRepository.log({
      userId,
      action: "PRICES_BULK_UPDATED",
      entity: "Product",
      entityId: "bulk",
      metadata: {
        count: result.affectedCount,
        type: options.type || "PERCENTAGE",
        value: options.value !== undefined ? options.value : options.percentageChange,
        roundToNearest: options.roundToNearest,
        targetCategory: options.categoryId,
      },
    });
    return result;
  }

  async deleteProduct(id: string, userId?: string): Promise<boolean> {
    const success = await productRepository.softDelete(id);
    if (success) {
      await auditRepository.log({
        userId,
        action: "PRODUCT_DELETED",
        entity: "Product",
        entityId: id,
      });
    }
    return success;
  }

  async getCategories(): Promise<CategoryDTO[]> {
    return categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<CategoryDTO | null> {
    return categoryRepository.findById(id);
  }

  async createCategory(data: any, userId?: string): Promise<CategoryDTO> {
    const cat = await categoryRepository.create(data);
    await auditRepository.log({
      userId,
      action: "CATEGORY_CREATED",
      entity: "Category",
      entityId: cat.id,
      metadata: { name: cat.name, slug: cat.slug },
    });
    return cat;
  }

  async updateCategory(id: string, data: any, userId?: string): Promise<CategoryDTO | null> {
    const updated = await categoryRepository.update(id, data);
    if (updated) {
      await auditRepository.log({
        userId,
        action: "CATEGORY_UPDATED",
        entity: "Category",
        entityId: id,
        metadata: { name: updated.name, slug: updated.slug },
      });
    }
    return updated;
  }

  async deleteCategory(id: string, userId?: string): Promise<{ success: boolean; error?: string }> {
    const result = await categoryRepository.delete(id);
    if (result.success) {
      await auditRepository.log({
        userId,
        action: "CATEGORY_DELETED",
        entity: "Category",
        entityId: id,
      });
    }
    return result;
  }
}

export const productService = new ProductService();
