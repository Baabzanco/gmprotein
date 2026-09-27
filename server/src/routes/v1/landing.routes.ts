import { Router } from "express";
import { landingController } from "../../controllers/landing.controller";
import { landingSectionController } from "../../controllers/landingSection.controller";

const router = Router();

// -------------------------------------------------------------
// New Landing Section CMS Endpoints (Phase 6)
// -------------------------------------------------------------

router.get("/sections", (req, res, next) => {
  landingSectionController.publicGetSections(req, res, next);
});

router.get("/sections/:key", (req, res, next) => {
  landingSectionController.publicGetSectionByKey(req, res, next);
});

// -------------------------------------------------------------
// Legacy Landing Endpoints (Preserved for compatibility)
// -------------------------------------------------------------

router.get("/all", (req, res, next) => {
  landingController.getAll(req, res, next);
});

router.get("/campaign", (req, res, next) => {
  landingController.getCampaign(req, res, next);
});

router.get("/faqs", (req, res, next) => {
  landingController.getFaqs(req, res, next);
});

router.get("/customers", (req, res, next) => {
  landingController.getCustomers(req, res, next);
});

router.get("/achievements", (req, res, next) => {
  landingController.getAchievements(req, res, next);
});

router.get("/cooperation-steps", (req, res, next) => {
  landingController.getCooperationSteps(req, res, next);
});

router.get("/settings", (req, res, next) => {
  landingController.getSettings(req, res, next);
});

export default router;
