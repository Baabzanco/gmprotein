import { Router } from "express";
import { adminController } from "../../controllers/admin.controller";
import { requireAuth, requireRole, requirePermission } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  userQuerySchema,
  createRoleSchema,
  updateRoleSchema,
  updateRolePermissionsSchema,
} from "../../validators";
import adminBlogRoutes from "./admin.blog.routes";

const router = Router();

// Protected admin routes: requires authenticated admin/staff with active status
router.use(requireAuth);

// Blog Management Sub-router (Phase 4)
router.use("/blog", adminBlogRoutes);

// 1. Dashboard & Logs
router.get("/dashboard-stats", (req, res, next) => {
  adminController.getDashboardStats(req, res, next);
});

router.get("/audit-logs", requirePermission("settings.view"), (req, res, next) => {
  adminController.getAuditLogs(req, res, next);
});

router.get("/system-logs", requirePermission("settings.view"), (req, res, next) => {
  adminController.getSystemLogs(req, res, next);
});

// 2. Users Management (Phase 5)
router.get(
  "/users",
  requirePermission("users.view"),
  validateQuery(userQuerySchema),
  (req, res, next) => {
    adminController.getUsers(req, res, next);
  }
);

router.get("/users/:id", requirePermission("users.view"), (req, res, next) => {
  adminController.getUserById(req, res, next);
});

router.post(
  "/users",
  requirePermission("users.create"),
  validateBody(createUserSchema),
  (req, res, next) => {
    adminController.createUser(req, res, next);
  }
);

router.put(
  "/users/:id",
  requirePermission("users.update"),
  validateBody(updateUserSchema),
  (req, res, next) => {
    adminController.updateUser(req, res, next);
  }
);

router.patch(
  "/users/:id/status",
  requirePermission("users.suspend"),
  (req, res, next) => {
    adminController.updateUserStatus(req, res, next);
  }
);

router.post(
  "/users/:id/status",
  requirePermission("users.suspend"),
  (req, res, next) => {
    adminController.updateUserStatus(req, res, next);
  }
);

router.post(
  "/users/:id/reset-password",
  requirePermission("users.update"),
  validateBody(resetPasswordSchema),
  (req, res, next) => {
    adminController.resetUserPassword(req, res, next);
  }
);

router.delete("/users/:id", requirePermission("users.delete"), (req, res, next) => {
  adminController.deleteUser(req, res, next);
});

// 3. Roles & Permissions Management (Phase 5)
router.get("/roles", requirePermission("roles.view"), (req, res, next) => {
  adminController.getRoles(req, res, next);
});

router.get("/roles/:id", requirePermission("roles.view"), (req, res, next) => {
  adminController.getRoleById(req, res, next);
});

router.post(
  "/roles",
  requirePermission("roles.create"),
  validateBody(createRoleSchema),
  (req, res, next) => {
    adminController.createRole(req, res, next);
  }
);

router.put(
  "/roles/:id",
  requirePermission("roles.update"),
  validateBody(updateRoleSchema),
  (req, res, next) => {
    adminController.updateRole(req, res, next);
  }
);

router.put(
  "/roles/:id/permissions",
  requirePermission("roles.update"),
  validateBody(updateRolePermissionsSchema),
  (req, res, next) => {
    adminController.updateRolePermissions(req, res, next);
  }
);

router.delete("/roles/:id", requirePermission("roles.delete"), (req, res, next) => {
  adminController.deleteRole(req, res, next);
});

router.get("/permissions", requirePermission("roles.view"), (req, res, next) => {
  adminController.getPermissions(req, res, next);
});

// 4. Discounts & Campaigns
router.get("/discounts", requirePermission("pricing.view"), (req, res, next) => {
  adminController.getDiscounts(req, res, next);
});

router.post("/discounts", requirePermission("pricing.update"), (req, res, next) => {
  adminController.createDiscount(req, res, next);
});

router.get("/campaigns", requirePermission("campaigns.view"), (req, res, next) => {
  adminController.getCampaigns(req, res, next);
});

router.post("/campaigns", requirePermission("campaigns.create"), (req, res, next) => {
  adminController.createCampaign(req, res, next);
});

// 5. FAQs Management
router.get("/faqs", requirePermission("content.view"), (req, res, next) => {
  adminController.getFaqs(req, res, next);
});

router.post("/faqs", requirePermission("content.create"), (req, res, next) => {
  adminController.createFaq(req, res, next);
});

router.put("/faqs/:id", requirePermission("content.update"), (req, res, next) => {
  adminController.updateFaq(req, res, next);
});

router.delete("/faqs/:id", requirePermission("content.delete"), (req, res, next) => {
  adminController.deleteFaq(req, res, next);
});

// 6. Settings & Media
router.get("/settings", requirePermission("settings.view"), (req, res, next) => {
  adminController.getSettings(req, res, next);
});

router.put("/settings", requirePermission("settings.update"), (req, res, next) => {
  adminController.updateSettings(req, res, next);
});

router.post("/upload-hero-video", requirePermission("media.create"), (req, res, next) => {
  adminController.uploadHeroVideo(req, res, next);
});

export default router;
