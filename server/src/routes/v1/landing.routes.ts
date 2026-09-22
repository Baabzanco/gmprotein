import { Router } from "express";
import { landingController } from "../../controllers/landing.controller";

const router = Router();

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
