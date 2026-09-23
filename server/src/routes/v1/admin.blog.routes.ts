import { Router } from "express";
import { blogController } from "../../controllers/blog.controller";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  createBlogCategorySchema,
  updateBlogCategorySchema,
  createBlogTagSchema,
} from "../../validators";

const router = Router();

// Protected: requires authentication
router.use(requireAuth);

// -------------------------------------------------------------
// Blog Posts Management
// -------------------------------------------------------------

router.get("/posts", (req, res, next) => {
  blogController.getAdminPosts(req, res, next);
});

router.get("/posts/:id", (req, res, next) => {
  blogController.getAdminPostById(req, res, next);
});

router.post(
  "/posts",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(createBlogPostSchema),
  (req, res, next) => {
    blogController.createPost(req, res, next);
  }
);

router.put(
  "/posts/:id",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(updateBlogPostSchema),
  (req, res, next) => {
    blogController.updatePost(req, res, next);
  }
);

router.patch(
  "/posts/:id/status",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  (req, res, next) => {
    blogController.updatePostStatus(req, res, next);
  }
);

router.delete(
  "/posts/:id",
  requireRole("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => {
    blogController.deletePost(req, res, next);
  }
);

router.post(
  "/upload-image",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  (req, res, next) => {
    blogController.uploadBlogImage(req, res, next);
  }
);

// -------------------------------------------------------------
// Categories Management
// -------------------------------------------------------------

router.get("/categories", (req, res, next) => {
  blogController.getCategories(req, res, next);
});

router.post(
  "/categories",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(createBlogCategorySchema),
  (req, res, next) => {
    blogController.createCategory(req, res, next);
  }
);

router.put(
  "/categories/:id",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(updateBlogCategorySchema),
  (req, res, next) => {
    blogController.updateCategory(req, res, next);
  }
);

router.delete(
  "/categories/:id",
  requireRole("SUPER_ADMIN", "ADMIN"),
  (req, res, next) => {
    blogController.deleteCategory(req, res, next);
  }
);

// -------------------------------------------------------------
// Tags Management
// -------------------------------------------------------------

router.get("/tags", (req, res, next) => {
  blogController.getTags(req, res, next);
});

router.post(
  "/tags",
  requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"),
  validateBody(createBlogTagSchema),
  (req, res, next) => {
    blogController.createTag(req, res, next);
  }
);

export default router;
