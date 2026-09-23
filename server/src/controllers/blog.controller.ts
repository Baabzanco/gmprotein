import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { blogService } from "../services/blog.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";
import { auditRepository } from "../repositories/audit.repository";
import { BlogPostStatus } from "../../../shared/types";

export class BlogController {
  // -------------------------------------------------------------
  // Public Endpoints
  // -------------------------------------------------------------

  async getPublishedPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, category, tag, search } = req.query as any;
      const result = await blogService.getPublishedPosts({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 9,
        categorySlug: category,
        tagSlug: tag,
        search,
      });

      return sendSuccess(res, result.posts, 200, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: limit ? parseInt(limit, 10) : 9,
      });
    } catch (err: any) {
      next(err);
    }
  }

  async getLatestPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;
      const posts = await blogService.getLatestPosts(limit);
      return sendSuccess(res, posts, 200, { total: posts.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const result = await blogService.getPostBySlug(slug);

      return sendSuccess(res, {
        post: result.post,
        redirectedTo: result.redirectedTo,
      }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await blogService.getPublicCategories();
      return sendSuccess(res, categories, 200, { total: categories.length });
    } catch (err: any) {
      next(err);
    }
  }

  async getPublicTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await blogService.getPublicTags();
      return sendSuccess(res, tags, 200, { total: tags.length });
    } catch (err: any) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // Admin Endpoints
  // -------------------------------------------------------------

  async getAdminPosts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, category, search } = req.query as any;
      const result = await blogService.getAdminPosts({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 15,
        status: status as BlogPostStatus,
        categorySlug: category,
        search,
      });

      return sendSuccess(res, result.posts, 200, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      next(err);
    }
  }

  async getAdminPostById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await blogService.getAdminPostById(id);
      return sendSuccess(res, post, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async createPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const author = req.user
        ? { id: req.user.id, name: `${req.user.firstName} ${req.user.lastName}` }
        : undefined;

      const post = await blogService.createPost(req.body, author);

      await auditRepository.log({
        userId: req.user?.id,
        action: "BLOG_POST_CREATED",
        entity: "BlogPost",
        entityId: post.id,
        metadata: { title: post.title, slug: post.slug, status: post.status },
      });

      return sendSuccess(res, post, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updatePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await blogService.updatePost(id, req.body);

      await auditRepository.log({
        userId: req.user?.id,
        action: "BLOG_POST_UPDATED",
        entity: "BlogPost",
        entityId: id,
        metadata: { title: updated.title, slug: updated.slug, status: updated.status },
      });

      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async updatePostStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
        return sendError(res, "VALIDATION_ERROR", "وضعیت انتخابی نامعتبر است", 400);
      }

      const updated = await blogService.updatePostStatus(id, status);

      await auditRepository.log({
        userId: req.user?.id,
        action: status === "PUBLISHED" ? "BLOG_POST_PUBLISHED" : "BLOG_POST_UNPUBLISHED",
        entity: "BlogPost",
        entityId: id,
        metadata: { status },
      });

      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deletePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await blogService.deletePost(id);

      await auditRepository.log({
        userId: req.user?.id,
        action: "BLOG_POST_DELETED",
        entity: "BlogPost",
        entityId: id,
      });

      return sendSuccess(res, { message: "مقاله با موفقیت حذف گردید" }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // Category Endpoints (Admin)
  // -------------------------------------------------------------

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await blogService.getCategories();
      return sendSuccess(res, categories, 200, { total: categories.length });
    } catch (err: any) {
      next(err);
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await blogService.createCategory(req.body);

      await auditRepository.log({
        userId: req.user?.id,
        action: "BLOG_CATEGORY_CREATED",
        entity: "BlogCategory",
        entityId: category.id,
        metadata: { name: category.name, slug: category.slug },
      });

      return sendSuccess(res, category, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await blogService.updateCategory(id, req.body);

      await auditRepository.log({
        userId: req.user?.id,
        action: "BLOG_CATEGORY_UPDATED",
        entity: "BlogCategory",
        entityId: id,
        metadata: { name: category?.name },
      });

      return sendSuccess(res, category, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await blogService.deleteCategory(id);

      await auditRepository.log({
        userId: req.user?.id,
        action: "BLOG_CATEGORY_DELETED",
        entity: "BlogCategory",
        entityId: id,
      });

      return sendSuccess(res, result, 200);
    } catch (err: any) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // Tag Endpoints (Admin)
  // -------------------------------------------------------------

  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await blogService.getTags();
      return sendSuccess(res, tags, 200, { total: tags.length });
    } catch (err: any) {
      next(err);
    }
  }

  async createTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const tag = await blogService.createTag(name);
      return sendSuccess(res, tag, 201);
    } catch (err: any) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // Image Upload Endpoint (Featured / Inline Content Images)
  // -------------------------------------------------------------

  async uploadBlogImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { fileBase64, fileName, fileType } = req.body;
      if (!fileBase64) {
        return sendError(res, "VALIDATION_ERROR", "فایل تصویر ارسال نشده است", 400);
      }

      // Check mime type
      const allowedMimes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      const mime = fileType?.toLowerCase() || "image/jpeg";
      if (!allowedMimes.includes(mime)) {
        return sendError(
          res,
          "INVALID_FILE_TYPE",
          "فرمت فایل مجاز نیست. لطفاً تصویر با فرمت JPG، PNG یا WebP ارسال فرمایید.",
          400
        );
      }

      // Strip data URI header
      const base64Data = fileBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Validate size (max 10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return sendError(res, "FILE_TOO_LARGE", "حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد", 400);
      }

      let ext = ".jpg";
      if (mime === "image/png") ext = ".png";
      else if (mime === "image/webp") ext = ".webp";
      else if (mime === "image/gif") ext = ".gif";
      else if (mime === "image/svg+xml") ext = ".svg";
      else if (fileName && path.extname(fileName)) {
        ext = path.extname(fileName).toLowerCase();
      }

      const safeFilename = `blog-${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
      const uploadsDir = path.resolve(process.cwd(), "uploads", "blog");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      const imageUrl = `/uploads/blog/${safeFilename}`;

      await auditRepository.log({
        userId: req.user?.id,
        action: "BLOG_IMAGE_UPLOADED",
        entity: "BlogPost",
        metadata: { fileName: safeFilename, size: buffer.length, url: imageUrl },
      });

      return sendSuccess(
        res,
        {
          url: imageUrl,
          fileName: safeFilename,
          size: buffer.length,
          mimeType: mime,
        },
        200
      );
    } catch (err: any) {
      next(err);
    }
  }
}

export const blogController = new BlogController();
