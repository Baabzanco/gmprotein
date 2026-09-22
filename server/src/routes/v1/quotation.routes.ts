import { Router } from "express";
import { quotationController } from "../../controllers/quotation.controller";
import { validateBody } from "../../middleware/validate";
import { createQuotationRequestSchema } from "../../validators";
import { requireAuth, requireRole } from "../../middleware/auth";
import { sensitiveActionLimiter } from "../../middleware/rateLimiter";

const router = Router();

// Public: Submit quotation inquiry
router.post("/", sensitiveActionLimiter, validateBody(createQuotationRequestSchema), (req, res, next) => {
  quotationController.submit(req, res, next);
});

// Admin: View all quotations
router.get(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SUPPORT"),
  (req, res, next) => {
    quotationController.getAll(req, res, next);
  }
);

// Admin: Update quotation status
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "SALES_MANAGER"),
  (req, res, next) => {
    quotationController.updateStatus(req, res, next);
  }
);

export default router;
