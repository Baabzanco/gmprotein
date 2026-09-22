import { Router } from "express";
import { contactController } from "../../controllers/contact.controller";
import { validateBody } from "../../middleware/validate";
import { createContactRequestSchema } from "../../validators";
import { requireAuth, requireRole } from "../../middleware/auth";
import { sensitiveActionLimiter } from "../../middleware/rateLimiter";

const router = Router();

// Public: Submit contact message
router.post("/", sensitiveActionLimiter, validateBody(createContactRequestSchema), (req, res, next) => {
  contactController.submit(req, res, next);
});

// Admin: View all contact messages
router.get(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "SUPPORT", "SALES_MANAGER"),
  (req, res, next) => {
    contactController.getAll(req, res, next);
  }
);

// Admin: Update contact status
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "SUPPORT"),
  (req, res, next) => {
    contactController.updateStatus(req, res, next);
  }
);

export default router;
