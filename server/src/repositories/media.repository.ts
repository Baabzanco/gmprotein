import fs from "fs";
import path from "path";
import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { MediaDTO } from "../../../shared/types";
import { loadPersistentSettings } from "../utils/persistentSettings";
import { productRepository } from "./product.repository";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

let inMemoryMedia: MediaDTO[] = [];

export class MediaRepository {
  constructor() {
    this.syncFilesystem();
  }

  /**
   * Scans physical uploads directories and populates media registry for any untracked files
   */
  async syncFilesystem(): Promise<void> {
    try {
      if (!fs.existsSync(UPLOADS_ROOT)) {
        fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
      }

      const scanDirectory = (dirPath: string, subUrl: string) => {
        if (!fs.existsSync(dirPath)) return;
        const files = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const file of files) {
          if (file.isDirectory()) {
            scanDirectory(path.join(dirPath, file.name), `${subUrl}/${file.name}`);
          } else if (file.isFile()) {
            const ext = path.extname(file.name).toLowerCase();
            if (file.name.endsWith(".json") || file.name.startsWith(".")) continue;

            const fullPath = path.join(dirPath, file.name);
            const stats = fs.statSync(fullPath);
            const fileUrl = `/uploads${subUrl ? "/" + subUrl : ""}/${file.name}`;

            let mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER" = "OTHER";
            let mimeType = "application/octet-stream";

            if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(ext)) {
              mediaType = "IMAGE";
              mimeType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/*";
            } else if ([".mp4", ".webm", ".mov", ".m4v"].includes(ext)) {
              mediaType = "VIDEO";
              mimeType = ext === ".mp4" ? "video/mp4" : ext === ".webm" ? "video/webm" : "video/quicktime";
            } else if ([".pdf", ".doc", ".docx"].includes(ext)) {
              mediaType = "DOCUMENT";
              mimeType = "application/pdf";
            }

            const existing = inMemoryMedia.find((m) => m.url === fileUrl || m.filename === file.name);
            if (!existing) {
              inMemoryMedia.push({
                id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                filename: file.name,
                originalName: file.name,
                mimeType,
                extension: ext,
                size: stats.size,
                url: fileUrl,
                mediaType,
                alt: file.name.replace(/[-_]/g, " ").replace(ext, ""),
                createdAt: stats.birthtime ? stats.birthtime.toISOString() : new Date().toISOString(),
                updatedAt: stats.mtime ? stats.mtime.toISOString() : new Date().toISOString(),
              });
            }
          }
        }
      };

      scanDirectory(UPLOADS_ROOT, "");
    } catch (err) {
      console.warn("[MediaRepository] Filesystem scan error:", err);
    }
  }

  async findAll(params?: {
    search?: string;
    mediaType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: MediaDTO[]; total: number; page: number; totalPages: number }> {
    await this.syncFilesystem();

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = {};
        if (params?.mediaType && params.mediaType !== "ALL") {
          where.mediaType = params.mediaType;
        }
        if (params?.search) {
          where.OR = [
            { filename: { contains: params.search, mode: "insensitive" } },
            { originalName: { contains: params.search, mode: "insensitive" } },
            { alt: { contains: params.search, mode: "insensitive" } },
          ];
        }

        const page = params?.page || 1;
        const limit = params?.limit || 24;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
          (prisma as any).media.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          (prisma as any).media.count({ where }),
        ]);

        if (total > 0) {
          return {
            items: items.map((m: any) => ({
              id: m.id,
              filename: m.filename,
              originalName: m.originalName,
              mimeType: m.mimeType,
              extension: m.extension,
              size: m.size,
              url: m.url,
              mediaType: m.mediaType,
              width: m.width,
              height: m.height,
              duration: m.duration ? Number(m.duration) : null,
              alt: m.alt,
              caption: m.caption,
              createdAt: m.createdAt.toISOString(),
              updatedAt: m.updatedAt.toISOString(),
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
          };
        }
      } catch {}
    }

    let list = [...inMemoryMedia];
    if (params?.mediaType && params.mediaType !== "ALL") {
      list = list.filter((m) => m.mediaType === params.mediaType);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          m.originalName.toLowerCase().includes(q) ||
          (m.alt && m.alt.toLowerCase().includes(q))
      );
    }

    // Sort descending by createdAt
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params?.page || 1;
    const limit = params?.limit || 24;
    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<MediaDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const m = await (prisma as any).media.findUnique({ where: { id } });
        if (m) {
          return {
            id: m.id,
            filename: m.filename,
            originalName: m.originalName,
            mimeType: m.mimeType,
            extension: m.extension,
            size: m.size,
            url: m.url,
            mediaType: m.mediaType,
            width: m.width,
            height: m.height,
            duration: m.duration ? Number(m.duration) : null,
            alt: m.alt,
            caption: m.caption,
            createdAt: m.createdAt.toISOString(),
            updatedAt: m.updatedAt.toISOString(),
          };
        }
      } catch {}
    }
    return inMemoryMedia.find((m) => m.id === id || m.url === id) || null;
  }

  async create(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    extension: string;
    size: number;
    url: string;
    mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";
    width?: number;
    height?: number;
    duration?: number;
    alt?: string;
    caption?: string;
  }): Promise<MediaDTO> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await (prisma as any).media.create({
          data: {
            filename: data.filename,
            originalName: data.originalName,
            mimeType: data.mimeType,
            extension: data.extension,
            size: data.size,
            url: data.url,
            mediaType: data.mediaType,
            width: data.width,
            height: data.height,
            duration: data.duration,
            alt: data.alt,
            caption: data.caption,
          },
        });
        const dto: MediaDTO = {
          id: created.id,
          filename: created.filename,
          originalName: created.originalName,
          mimeType: created.mimeType,
          extension: created.extension,
          size: created.size,
          url: created.url,
          mediaType: created.mediaType,
          width: created.width,
          height: created.height,
          duration: created.duration ? Number(created.duration) : null,
          alt: created.alt,
          caption: created.caption,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
        inMemoryMedia.unshift(dto);
        return dto;
      } catch {}
    }

    const newMedia: MediaDTO = {
      id: `med-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryMedia.unshift(newMedia);
    return newMedia;
  }

  async update(id: string, data: Partial<MediaDTO>): Promise<MediaDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updated = await (prisma as any).media.update({
          where: { id },
          data: {
            alt: data.alt,
            caption: data.caption,
          },
        });
        return {
          id: updated.id,
          filename: updated.filename,
          originalName: updated.originalName,
          mimeType: updated.mimeType,
          extension: updated.extension,
          size: updated.size,
          url: updated.url,
          mediaType: updated.mediaType,
          alt: updated.alt,
          caption: updated.caption,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch {}
    }

    const idx = inMemoryMedia.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    inMemoryMedia[idx] = {
      ...inMemoryMedia[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryMedia[idx];
  }

  /**
   * Safe reference check: Scans whether a media item's URL is currently in use across the application
   */
  async checkMediaReferences(urlOrFilename: string): Promise<string[]> {
    const references: string[] = [];
    const targetUrl = urlOrFilename.startsWith("/") ? urlOrFilename : `/uploads/${urlOrFilename}`;

    // 1. Check Hero Video & Site Settings
    const settings = loadPersistentSettings();
    if (settings.heroVideoUrl && settings.heroVideoUrl.includes(urlOrFilename)) {
      references.push("ویدیوی هیرو سکشن صفحه نخست (Hero Video)");
    }

    // 2. Check Products
    const allProducts = await productRepository.findAll();
    for (const p of allProducts) {
      if (p.images && p.images.some((img) => img.url && img.url.includes(urlOrFilename))) {
        references.push(`محصول «${p.name}» (گالری تصاویر)`);
      }
    }

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();

        // 3. Check Campaigns
        const campaigns = await prisma.campaign.findMany();
        for (const c of campaigns) {
          if (c.image && c.image.includes(urlOrFilename)) {
            references.push(`کمپین فصلی «${c.title}»`);
          }
        }

        // 4. Check Blog Posts
        const posts = await prisma.blogPost.findMany();
        for (const post of posts) {
          if (
            (post.featuredImage && post.featuredImage.includes(urlOrFilename)) ||
            (post.content && post.content.includes(urlOrFilename))
          ) {
            references.push(`مقاله وبلاگ «${post.title}»`);
          }
        }

        // 5. Check Customer Partners
        const partners = await prisma.customerPartner.findMany();
        for (const part of partners) {
          if (part.logo && part.logo.includes(urlOrFilename)) {
            references.push(`لوگوی شریک تجاری «${part.name}»`);
          }
        }
      } catch {}
    }

    return references;
  }

  async delete(id: string, force = false): Promise<{ success: boolean; inUse?: boolean; references?: string[] }> {
    const mediaItem = await this.findById(id);
    if (!mediaItem) return { success: false };

    // Check usage
    const references = await this.checkMediaReferences(mediaItem.url);
    if (references.length > 0 && !force) {
      return {
        success: false,
        inUse: true,
        references,
      };
    }

    // Remove from DB
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await (prisma as any).media.delete({ where: { id } });
      } catch {}
    }

    // Remove from in-memory
    const idx = inMemoryMedia.findIndex((m) => m.id === id);
    if (idx !== -1) {
      inMemoryMedia.splice(idx, 1);
    }

    // Remove physical file safely if exists inside uploads
    try {
      const cleanPath = mediaItem.url.replace(/^\/uploads\/?/, "");
      const fullPath = path.resolve(UPLOADS_ROOT, cleanPath);
      if (fullPath.startsWith(UPLOADS_ROOT) && fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn("[MediaRepository] Failed to delete file on disk:", err);
    }

    return { success: true };
  }
}

export const mediaRepository = new MediaRepository();
