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
      const product = await productService.getProductById(id);
      if (!product) {
        return sendError(res, "PRODUCT_NOT_FOUND", "محصول مورد نظر یافت نشد", 404);
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
      const { productIds, percentageChange } = req.body;
      if (!Array.isArray(productIds) || typeof percentageChange !== "number") {
        return sendError(res, "INVALID_INPUT", "شناسه‌های محصول و درصد تغییر قیمت معتبر نیست", 400);
      }
      const affected = await productService.bulkUpdatePrices(productIds, percentageChange, req.user?.id);
      return sendSuccess(res, { affectedCount: affected, percentageChange }, 200);
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
}

export const productController = new ProductController();
