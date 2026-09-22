import { Router } from "express";
import { adminController } from "../../controllers/admin.controller";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { createUserSchema } from "../../validators";

const router = Router();

// Protected admin routes: requires authenticated admin/staff
router.use(requireAuth);

// 1. Dashboard & Logs
router.get("/dashboard-stats", (req, res, next) => {
  adminController.getDashboardStats(req, res, next);
});

router.get("/audit-logs", requireRole("SUPER_ADMIN", "ADMIN"), (req, res, next) => {
  adminController.getAuditLogs(req, res, next);
});

router.get("/system-logs", requireRole("SUPER_ADMIN", "ADMIN"), (req, res, next) => {
  adminController.getSystemLogs(req, res, next);
});

// 2. Users & Roles Management
router.get("/users", requireRole("SUPER_ADMIN", "ADMIN"), (req, res, next) => {
  adminController.getUsers(req, res, next);
});

router.post(
  "/users",
  requireRole("SUPER_ADMIN", "ADMIN"),
  validateBody(createUserSchema),
  (req, res, next) => {
    adminController.createUser(req, res, next);
  }
);

router.patch("/users/:id/status", requireRole("SUPER_ADMIN", "ADMIN"), (req, res, next) => {
  adminController.updateUserStatus(req, res, next);
});

router.delete("/users/:id", requireRole("SUPER_ADMIN"), (req, res, next) => {
  adminController.deleteUser(req, res, next);
});

router.get("/roles", requireRole("SUPER_ADMIN", "ADMIN"), (req, res, next) => {
  adminController.getRoles(req, res, next);
});

router.get("/permissions", requireRole("SUPER_ADMIN", "ADMIN"), (req, res, next) => {
  adminController.getPermissions(req, res, next);
});

// 3. Discounts & Campaigns
router.get("/discounts", (req, res, next) => {
  adminController.getDiscounts(req, res, next);
});

router.post("/discounts", requireRole("SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"), (req, res, next) => {
  adminController.createDiscount(req, res, next);
});

router.get("/campaigns", (req, res, next) => {
  adminController.getCampaigns(req, res, next);
});

router.post("/campaigns", requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "PRODUCT_MANAGER"), (req, res, next) => {
  adminController.createCampaign(req, res, next);
});

// 4. Settings & Media
router.get("/settings", (req, res, next) => {
  adminController.getSettings(req, res, next);
});

router.put("/settings", requireRole("SUPER_ADMIN", "ADMIN"), (req, res, next) => {
  adminController.updateSettings(req, res, next);
});

router.post("/upload-hero-video", requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"), (req, res, next) => {
  adminController.uploadHeroVideo(req, res, next);
});

export default router;
