import { Router } from "express";
import { productController } from "../../controllers/product.controller";
import { validateBody, validateQuery } from "../../middleware/validate";
import { createProductSchema, productQuerySchema, bulkPriceUpdateSchema } from "../../validators";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

// Public Product List & Details
router.get("/", validateQuery(productQuerySchema), (req, res, next) => {
  productController.getProducts(req, res, next);
});

router.get("/slug/:slug", (req, res, next) => {
  productController.getProductBySlug(req, res, next);
});

router.get("/:id", (req, res, next) => {
  productController.getProductById(req, res, next);
});

// Admin product creation & deletion
router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  validateBody(createProductSchema),
  (req, res, next) => {
    productController.createProduct(req, res, next);
  }
);

router.put(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  (req, res, next) => {
    productController.updateProduct(req, res, next);
  }
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  (req, res, next) => {
    productController.updateProduct(req, res, next);
  }
);

router.post(
  "/bulk-price-update",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  validateBody(bulkPriceUpdateSchema),
  (req, res, next) => {
    productController.bulkUpdatePrices(req, res, next);
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"),
  (req, res, next) => {
    productController.deleteProduct(req, res, next);
  }
);

export default router;
