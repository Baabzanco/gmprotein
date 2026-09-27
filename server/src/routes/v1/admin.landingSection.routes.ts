import { Router } from "express";
import { landingSectionController } from "../../controllers/landingSection.controller";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import {
  createLandingSectionSchema,
  updateLandingSectionSchema,
  reorderLandingSectionsSchema,
  duplicateLandingSectionSchema,
} from "../../validators";

const router = Router();

// Protected admin routes: requires authenticated staff
router.use(requireAuth);

// 1. Reorder sections (must be before /:id routes)
router.post(
  "/reorder",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(reorderLandingSectionsSchema),
  (req, res, next) => {
    landingSectionController.adminReorder(req, res, next);
  }
);

// 2. List and Detail
router.get("/", (req, res, next) => {
  landingSectionController.adminGetAll(req, res, next);
});

router.get("/:id", (req, res, next) => {
  landingSectionController.adminGetById(req, res, next);
});

// 3. Create
router.post(
  "/",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(createLandingSectionSchema),
  (req, res, next) => {
    landingSectionController.adminCreate(req, res, next);
  }
);

// 4. Update
router.put(
  "/:id",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(updateLandingSectionSchema),
  (req, res, next) => {
    landingSectionController.adminUpdate(req, res, next);
  }
);

// 5. Delete (Soft Delete)
router.delete(
  "/:id",
  requireRole("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => {
    landingSectionController.adminDelete(req, res, next);
  }
);

// 6. Restore
router.post(
  "/:id/restore",
  requireRole("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => {
    landingSectionController.adminRestore(req, res, next);
  }
);

// 7. Duplicate
router.post(
  "/:id/duplicate",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(duplicateLandingSectionSchema),
  (req, res, next) => {
    landingSectionController.adminDuplicate(req, res, next);
  }
);

// 8. Publish & Unpublish
router.post(
  "/:id/publish",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  (req, res, next) => {
    landingSectionController.adminPublish(req, res, next);
  }
);

router.post(
  "/:id/unpublish",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  (req, res, next) => {
    landingSectionController.adminUnpublish(req, res, next);
  }
);

// 9. Revisions
router.get("/:id/revisions", (req, res, next) => {
  landingSectionController.adminGetRevisions(req, res, next);
});

router.get("/:id/revisions/:version", (req, res, next) => {
  landingSectionController.adminGetRevisionByVersion(req, res, next);
});

export default router;
