import { Router } from "express";
import { campaignController } from "../../controllers/campaign.controller";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

// Public: Get active seasonal campaigns
router.get("/active", (req, res, next) => {
  campaignController.getActive(req, res, next);
});

// Admin: Get all campaigns
router.get(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "PRODUCT_MANAGER"),
  (req, res, next) => {
    campaignController.adminList(req, res, next);
  }
);

// Admin: Create campaign
router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "PRODUCT_MANAGER"),
  (req, res, next) => {
    campaignController.create(req, res, next);
  }
);

// Admin: Update campaign
router.put(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "PRODUCT_MANAGER"),
  (req, res, next) => {
    campaignController.update(req, res, next);
  }
);

// Admin: Toggle campaign active status
router.patch(
  "/:id/toggle",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "PRODUCT_MANAGER"),
  (req, res, next) => {
    campaignController.toggleStatus(req, res, next);
  }
);

// Admin: Delete campaign
router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  (req, res, next) => {
    campaignController.remove(req, res, next);
  }
);

export default router;
