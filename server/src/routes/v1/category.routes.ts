import { Router } from "express";
import { productController } from "../../controllers/product.controller";
import { validateBody } from "../../middleware/validate";
import { createCategorySchema } from "../../validators";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

// Public Categories
router.get("/", (req, res, next) => {
  productController.getCategories(req, res, next);
});

// Admin Create Category
router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  validateBody(createCategorySchema),
  async (req, res, next) => {
    try {
      const { productService } = await import("../../services/product.service");
      const { sendSuccess } = await import("../../utils/response");
      const cat = await productService.createCategory(req.body, (req as any).user?.id);
      return sendSuccess(res, cat, 201);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
