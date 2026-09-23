import { Router } from "express";
import { blogController } from "../../controllers/blog.controller";

const router = Router();

// Public Blog Endpoints
router.get("/posts", (req, res, next) => {
  blogController.getPublishedPosts(req, res, next);
});

router.get("/latest", (req, res, next) => {
  blogController.getLatestPosts(req, res, next);
});

router.get("/posts/:slug", (req, res, next) => {
  blogController.getPostBySlug(req, res, next);
});

router.get("/categories", (req, res, next) => {
  blogController.getPublicCategories(req, res, next);
});

router.get("/tags", (req, res, next) => {
  blogController.getPublicTags(req, res, next);
});

export default router;
