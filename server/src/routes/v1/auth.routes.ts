import { Router } from "express";
import { authController } from "../../controllers/auth.controller";
import { validateBody } from "../../middleware/validate";
import { loginSchema } from "../../validators";
import { requireAuth } from "../../middleware/auth";
import { sensitiveActionLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post("/login", sensitiveActionLimiter, validateBody(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

router.get("/me", requireAuth, (req, res, next) => {
  authController.getMe(req, res, next);
});

router.post("/logout", requireAuth, (req, res, next) => {
  authController.logout(req, res, next);
});

export default router;
