import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, featured } = req.query as any;
      const products = await productService.getProducts({
        category: category as string,
        search: search as string,
        featured: featured === undefined ? undefined : Boolean(featured),
      });
      return sendSuccess(res, products, 200, { total: products.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let product = await productService.getProductById(id);
      if (!product) {
        // Fallback to slug search
        product = await productService.getProductBySlug(id);
      }
      if (!product) {
        return sendError(res, "PRODUCT_NOT_FOUND", "محصول مورد نظر یافت نشد", 404);
      }
      return sendSuccess(res, product, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlug(slug);
      if (!product) {
        return sendError(res, "PRODUCT_NOT_FOUND", "محصول مورد نظر با این مشخصه یافت نشد", 404);
      }
      return sendSuccess(res, product, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productService.getCategories();
      return sendSuccess(res, categories, 200, { total: categories.length });
    } catch (err: any) {
      next(err);
    }
  }

  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body, req.user?.id);
      return sendSuccess(res, product, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body, req.user?.id);
      if (!product) {
        return sendError(res, "PRODUCT_NOT_FOUND", "محصول برای ویرایش یافت نشد", 404);
      }
      return sendSuccess(res, product, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async bulkUpdatePrices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { type, value, percentageChange, productIds, categoryId, roundToNearest } = req.body;
      const delta = value !== undefined ? value : percentageChange;

      if (typeof delta !== "number") {
        return sendError(res, "INVALID_INPUT", "مقدار تغییر قیمت نامعتبر است", 400);
      }

      const result = await productService.bulkUpdatePrices(
        {
          type: type || "PERCENTAGE",
          value: delta,
          percentageChange: delta,
          productIds,
          categoryId,
          roundToNearest: roundToNearest || 1000,
        },
        req.user?.id
      );

      return sendSuccess(
        res,
        {
          affectedCount: result.affectedCount,
          updatedProducts: result.updatedProducts,
          type: type || "PERCENTAGE",
          value: delta,
        },
        200
      );
    } catch (err: any) {
      next(err);
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await productService.deleteProduct(id, req.user?.id);
      if (!success) {
        return sendError(res, "PRODUCT_NOT_FOUND", "محصول برای حذف یافت نشد", 404);
      }
      return sendSuccess(res, { deleted: true }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cat = await productService.createCategory(req.body, req.user?.id);
      return sendSuccess(res, cat, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await productService.updateCategory(id, req.body, req.user?.id);
      if (!updated) {
        return sendError(res, "CATEGORY_NOT_FOUND", "دسته‌بندی مورد نظر یافت نشد", 404);
      }
      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productService.deleteCategory(id, req.user?.id);
      if (!result.success) {
        return sendError(res, "CATEGORY_DELETE_FAILED", result.error || "خطا در حذف دسته‌بندی", 400);
      }
      return sendSuccess(res, { deleted: true }, 200);
    } catch (err: any) {
      next(err);
    }
  }
}

export const productController = new ProductController();
