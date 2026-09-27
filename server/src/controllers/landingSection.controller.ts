import { Request, Response, NextFunction } from "express";
import { landingSectionService } from "../services/landingSection.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class LandingSectionController {
  /**
   * GET /api/v1/landing/sections
   * Public: List all published sections in order.
   */
  async publicGetSections(req: Request, res: Response, next: NextFunction) {
    try {
      const sections = await landingSectionService.getPublicSections();
      return sendSuccess(res, sections, 200, { total: sections.length });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/landing/sections/:key
   * Public: Get single published section by key.
   */
  async publicGetSectionByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const section = await landingSectionService.getPublicSectionByKey(key);
      if (!section) {
        return sendError(res, "SECTION_NOT_FOUND", "سکشن مورد نظر یافت نشد یا منتشر نشده است.", 404);
      }
      return sendSuccess(res, section, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/landing-sections
   * Admin: List all sections.
   */
  async adminGetAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const includeDeleted = req.query.includeDeleted === "true";
      const sections = await landingSectionService.getAdminSections(includeDeleted);
      return sendSuccess(res, sections, 200, { total: sections.length });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/landing-sections/:id
   * Admin: Get single section by ID.
   */
  async adminGetById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const section = await landingSectionService.getAdminSectionById(id, true);
      if (!section) {
        return sendError(res, "SECTION_NOT_FOUND", "سکشن مورد نظر یافت نشد.", 404);
      }
      return sendSuccess(res, section, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/landing-sections
   * Admin: Create a new section.
   */
  async adminCreate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const section = await landingSectionService.createSection(req.body, req.user?.id);
      return sendSuccess(res, section, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/landing-sections/:id
   * Admin: Update section content.
   */
  async adminUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await landingSectionService.updateSection(id, req.body, req.user?.id);
      return sendSuccess(res, updated, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/admin/landing-sections/:id
   * Admin: Soft-delete section.
   */
  async adminDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await landingSectionService.softDeleteSection(id, req.user?.id);
      return sendSuccess(res, deleted, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/landing-sections/:id/restore
   * Admin: Restore soft-deleted section.
   */
  async adminRestore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restored = await landingSectionService.restoreSection(id, req.user?.id);
      return sendSuccess(res, restored, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/landing-sections/:id/duplicate
   * Admin: Duplicate section.
   */
  async adminDuplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newKey, title } = req.body;
      const duplicated = await landingSectionService.duplicateSection(
        id,
        newKey,
        title,
        req.user?.id
      );
      return sendSuccess(res, duplicated, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/landing-sections/:id/publish
   * Admin: Publish section.
   */
  async adminPublish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const published = await landingSectionService.publishSection(id, req.user?.id);
      return sendSuccess(res, published, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/landing-sections/:id/unpublish
   * Admin: Unpublish section.
   */
  async adminUnpublish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unpublished = await landingSectionService.unpublishSection(id, req.user?.id);
      return sendSuccess(res, unpublished, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/landing-sections/:id/revisions
   * Admin: List revisions of section.
   */
  async adminGetRevisions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const revisions = await landingSectionService.getSectionRevisions(id);
      return sendSuccess(res, revisions, 200, { total: revisions.length });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/landing-sections/:id/revisions/:version
   * Admin: Get revision by version.
   */
  async adminGetRevisionByVersion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id, version: versionStr } = req.params;
      const version = parseInt(versionStr, 10);
      if (isNaN(version) || version < 1) {
        return sendError(res, "INVALID_VERSION", "شماره نسخه نامعتبر است.", 400);
      }

      const revision = await landingSectionService.getRevisionByVersion(id, version);
      if (!revision) {
        return sendError(res, "REVISION_NOT_FOUND", "نسخه مورد نظر برای این سکشن یافت نشد.", 404);
      }
      return sendSuccess(res, revision, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/landing-sections/reorder
   * Admin: Reorder sections.
   */
  async adminReorder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      const reordered = await landingSectionService.reorderSections(items, req.user?.id);
      return sendSuccess(res, reordered, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const landingSectionController = new LandingSectionController();
