import { Router } from "express";
import { mediaController } from "../../controllers/media.controller";
import { requireAuth, requirePermission } from "../../middleware/auth";

const router = Router();

// Public / Authenticated Media queries
router.get("/", requireAuth, requirePermission("media.view"), (req, res, next) => {
  mediaController.getMediaList(req, res, next);
});

router.get("/:id", requireAuth, requirePermission("media.view"), (req, res, next) => {
  mediaController.getMediaById(req, res, next);
});

router.get("/:id/usage", requireAuth, requirePermission("media.view"), (req, res, next) => {
  mediaController.checkUsage(req, res, next);
});

// Upload & Modifications
router.post("/upload", requireAuth, requirePermission("media.create"), (req, res, next) => {
  mediaController.uploadMedia(req, res, next);
});

router.put("/:id", requireAuth, requirePermission("media.create"), (req, res, next) => {
  mediaController.updateMedia(req, res, next);
});

router.delete("/:id", requireAuth, requirePermission("media.delete"), (req, res, next) => {
  mediaController.deleteMedia(req, res, next);
});

export default router;
