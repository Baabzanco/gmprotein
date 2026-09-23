import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { mediaRepository } from "../repositories/media.repository";
import { auditRepository } from "../repositories/audit.repository";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../middleware/auth";

export class MediaController {
  async getMediaList(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, mediaType, page, limit } = req.query as any;
      const result = await mediaRepository.findAll({
        search: search ? String(search) : undefined,
        mediaType: mediaType ? String(mediaType) : undefined,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 24,
      });

      return sendSuccess(res, result.items, 200, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      next(err);
    }
  }

  async getMediaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const media = await mediaRepository.findById(id);
      if (!media) {
        return sendError(res, "NOT_FOUND", "فایل رسانه‌ای یافت نشد", 404);
      }
      const references = await mediaRepository.checkMediaReferences(media.url);
      return sendSuccess(res, { ...media, referencedBy: references }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async uploadMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { fileBase64, fileName, fileType, alt, caption } = req.body;
      if (!fileBase64 || !fileName) {
        return sendError(res, "VALIDATION_ERROR", "ارسال محتوای فایل و نام فایل الزامی است", 400);
      }

      // Extract raw base64 data
      const base64Data = fileBase64.replace(/^data:[a-zA-Z0-9\/-]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const ext = path.extname(fileName).toLowerCase() || ".jpg";
      const isVideo = [".mp4", ".webm", ".mov", ".m4v"].includes(ext);
      const isImage = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(ext);

      // Validation limit
      const maxLimit = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
      if (buffer.length > maxLimit) {
        return sendError(
          res,
          "FILE_TOO_LARGE",
          `حجم فایل نمی‌تواند بیشتر از ${isVideo ? "۱۰۰" : "۱۵"} مگابایت باشد`,
          400
        );
      }

      // Generate clean unique filename
      const sanitizedBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_").slice(0, 40);
      const safeFilename = `${sanitizedBase}-${Date.now()}${ext}`;

      const subDir = isVideo ? "videos" : "images";
      const uploadsDir = path.resolve(process.cwd(), "uploads", subDir);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${subDir}/${safeFilename}`;
      const mediaType = isVideo ? "VIDEO" : isImage ? "IMAGE" : "OTHER";

      const created = await mediaRepository.create({
        filename: safeFilename,
        originalName: fileName,
        mimeType: fileType || (isVideo ? "video/mp4" : "image/jpeg"),
        extension: ext,
        size: buffer.length,
        url: fileUrl,
        mediaType,
        alt: alt || fileName.replace(ext, ""),
        caption,
      });

      await auditRepository.log({
        userId: req.user?.id,
        action: "MEDIA_UPLOADED",
        entity: "Media",
        entityId: created.id,
        metadata: { fileName: safeFilename, size: buffer.length, url: fileUrl },
      });

      return sendSuccess(res, created, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await mediaRepository.update(id, req.body);
      if (!updated) {
        return sendError(res, "NOT_FOUND", "فایل برای ویرایش یافت نشد", 404);
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "MEDIA_UPDATED",
        entity: "Media",
        entityId: id,
        metadata: { ...req.body },
      });

      return sendSuccess(res, updated, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async checkUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const media = await mediaRepository.findById(id);
      if (!media) {
        return sendError(res, "NOT_FOUND", "فایل رسانه‌ای یافت نشد", 404);
      }
      const references = await mediaRepository.checkMediaReferences(media.url);
      return sendSuccess(res, { inUse: references.length > 0, references }, 200);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const force = req.query.force === "true";
      const result = await mediaRepository.delete(id, force);

      if (!result.success) {
        if (result.inUse) {
          return sendError(
            res,
            "MEDIA_IN_USE",
            "این فایل در بخش‌های دیگر سامانه در حال استفاده است و امکان حذف مستقیم آن وجود ندارد.",
            400,
            { references: result.references }
          );
        }
        return sendError(res, "NOT_FOUND", "فایل برای حذف یافت نشد", 404);
      }

      await auditRepository.log({
        userId: req.user?.id,
        action: "MEDIA_DELETED",
        entity: "Media",
        entityId: id,
      });

      return sendSuccess(res, { deleted: true }, 200);
    } catch (err: any) {
      next(err);
    }
  }
}

export const mediaController = new MediaController();
