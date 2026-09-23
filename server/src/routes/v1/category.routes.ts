import { Router } from "express";
import { productController } from "../../controllers/product.controller";
import { validateBody } from "../../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../../validators";
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
  (req, res, next) => {
    productController.createCategory(req as any, res, next);
  }
);

// Admin Update Category
router.put(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  validateBody(updateCategorySchema),
  (req, res, next) => {
    productController.updateCategory(req as any, res, next);
  }
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  validateBody(updateCategorySchema),
  (req, res, next) => {
    productController.updateCategory(req as any, res, next);
  }
);

// Admin Delete Category (with safeguard check)
router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  (req, res, next) => {
    productController.deleteCategory(req as any, res, next);
  }
);

export default router;
