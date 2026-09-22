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

  async bulkUpdatePrices(productIds: string[], percentageChange: number, userId?: string): Promise<number> {
    const affected = await productRepository.bulkUpdatePrices(productIds, percentageChange);
    await auditRepository.log({
      userId,
      action: "PRICES_BULK_UPDATED",
      entity: "Product",
      entityId: "bulk",
      metadata: { count: affected, percentageChange, productIds },
    });
    return affected;
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
}

export const productService = new ProductService();
