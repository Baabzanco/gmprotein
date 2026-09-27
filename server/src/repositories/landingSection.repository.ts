import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { AppError } from "../middleware/errorHandler";

export interface CreateLandingSectionInput {
  key: string;
  type?: string;
  status?: string;
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  contentJson?: any;
  settingsJson?: any;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface UpdateLandingSectionInput {
  key?: string;
  type?: string;
  status?: string;
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  contentJson?: any;
  settingsJson?: any;
  sortOrder?: number;
  isPublished?: boolean;
}

// In-memory backing store for test environments when PostgreSQL daemon is offline
let inMemorySections: any[] = [];
let inMemoryRevisions: any[] = [];

export class LandingSectionRepository {
  /**
   * Public: Retrieve all published, active landing sections in order.
   */
  async getPublishedSections() {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.landingSection.findMany({
          where: {
            isPublished: true,
            status: "PUBLISHED",
            deletedAt: null,
          },
          orderBy: {
            sortOrder: "asc",
          },
        });
      } catch (err: any) {
        if (err.name === "PrismaClientKnownRequestError" || (err as any).statusCode) {
          throw err;
        }
      }
    }

    return inMemorySections
      .filter((s) => s.isPublished === true && s.status === "PUBLISHED" && s.deletedAt === null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Public: Retrieve a specific published landing section by unique key.
   */
  async getPublishedSectionByKey(key: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.landingSection.findFirst({
          where: {
            key,
            isPublished: true,
            status: "PUBLISHED",
            deletedAt: null,
          },
        });
      } catch (err: any) {
        if (err.name === "PrismaClientKnownRequestError" || (err as any).statusCode) {
          throw err;
        }
      }
    }

    return (
      inMemorySections.find(
        (s) => s.key === key && s.isPublished === true && s.status === "PUBLISHED" && s.deletedAt === null
      ) || null
    );
  }

  /**
   * Admin: List all sections with optional inclusion of soft-deleted records.
   */
  async getAllSections(includeDeleted = false) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.landingSection.findMany({
          where: includeDeleted ? {} : { deletedAt: null },
          orderBy: {
            sortOrder: "asc",
          },
          include: {
            _count: {
              select: { revisions: true },
            },
          },
        });
      } catch (err: any) {
        if (err.name === "PrismaClientKnownRequestError" || (err as any).statusCode) {
          throw err;
        }
      }
    }

    return inMemorySections
      .filter((s) => includeDeleted || s.deletedAt === null)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        ...s,
        _count: {
          revisions: inMemoryRevisions.filter((r) => r.sectionId === s.id).length,
        },
      }));
  }

  /**
   * Admin: Find section by ID.
   */
  async getSectionById(id: string, includeDeleted = false) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.landingSection.findFirst({
          where: {
            id,
            ...(includeDeleted ? {} : { deletedAt: null }),
          },
          include: {
            _count: {
              select: { revisions: true },
            },
          },
        });
      } catch (err: any) {
        if (err.name === "PrismaClientKnownRequestError" || (err as any).statusCode) {
          throw err;
        }
      }
    }

    const section = inMemorySections.find((s) => s.id === id && (includeDeleted || s.deletedAt === null));
    if (!section) return null;
    return {
      ...section,
      _count: {
        revisions: inMemoryRevisions.filter((r) => r.sectionId === section.id).length,
      },
    };
  }

  /**
   * Admin: Find section by key.
   */
  async getSectionByKey(key: string, includeDeleted = false) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.landingSection.findFirst({
          where: {
            key,
            ...(includeDeleted ? {} : { deletedAt: null }),
          },
          include: {
            _count: {
              select: { revisions: true },
            },
          },
        });
      } catch (err: any) {
        if (err.name === "PrismaClientKnownRequestError" || (err as any).statusCode) {
          throw err;
        }
      }
    }

    const section = inMemorySections.find((s) => s.key === key && (includeDeleted || s.deletedAt === null));
    if (!section) return null;
    return {
      ...section,
      _count: {
        revisions: inMemoryRevisions.filter((r) => r.sectionId === section.id).length,
      },
    };
  }

  /**
   * Admin: Create a new landing section with initial version 1 and revision.
   */
  async createSection(data: CreateLandingSectionInput, userId?: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const existing = await tx.landingSection.findUnique({
            where: { key: data.key },
          });
          if (existing) {
            throw new AppError(
              `سکشنی با کلید یکتای '${data.key}' از قبل در سامانه وجود دارد.`,
              409,
              "KEY_ALREADY_EXISTS"
            );
          }

          let sortOrder = data.sortOrder;
          if (sortOrder === undefined || sortOrder === null) {
            const lastSection = await tx.landingSection.findFirst({
              orderBy: { sortOrder: "desc" },
              select: { sortOrder: true },
            });
            sortOrder = (lastSection?.sortOrder ?? 0) + 1;
          }

          const status = data.status || (data.isPublished ? "PUBLISHED" : "DRAFT");
          const isPublished =
            data.isPublished !== undefined ? data.isPublished : status === "PUBLISHED";

          const section = await tx.landingSection.create({
            data: {
              key: data.key,
              type: data.type || "CUSTOM",
              status,
              version: 1,
              title: data.title ?? null,
              subtitle: data.subtitle ?? null,
              badge: data.badge ?? null,
              contentJson: data.contentJson ?? undefined,
              settingsJson: data.settingsJson ?? undefined,
              sortOrder,
              isPublished,
            },
          });

          await tx.landingSectionRevision.create({
            data: {
              sectionId: section.id,
              version: 1,
              status: section.status,
              title: section.title,
              subtitle: section.subtitle,
              badge: section.badge,
              contentJson: section.contentJson ?? undefined,
              settingsJson: section.settingsJson ?? undefined,
              createdById: userId || null,
            },
          });

          return section;
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    // In-memory logic
    const existing = inMemorySections.find((s) => s.key === data.key);
    if (existing) {
      throw new AppError(
        `سکشنی با کلید یکتای '${data.key}' از قبل در سامانه وجود دارد.`,
        409,
        "KEY_ALREADY_EXISTS"
      );
    }

    let sortOrder = data.sortOrder;
    if (sortOrder === undefined || sortOrder === null) {
      const maxOrder = inMemorySections.reduce((max, s) => Math.max(max, s.sortOrder || 0), 0);
      sortOrder = maxOrder + 1;
    }

    const status = data.status || (data.isPublished ? "PUBLISHED" : "DRAFT");
    const isPublished =
      data.isPublished !== undefined ? data.isPublished : status === "PUBLISHED";

    const sectionId = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const newSection = {
      id: sectionId,
      key: data.key,
      type: data.type || "CUSTOM",
      status,
      version: 1,
      title: data.title ?? null,
      subtitle: data.subtitle ?? null,
      badge: data.badge ?? null,
      contentJson: data.contentJson ?? null,
      settingsJson: data.settingsJson ?? null,
      sortOrder,
      isPublished,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    inMemorySections.push(newSection);

    inMemoryRevisions.unshift({
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sectionId,
      version: 1,
      status,
      title: newSection.title,
      subtitle: newSection.subtitle,
      badge: newSection.badge,
      contentJson: newSection.contentJson,
      settingsJson: newSection.settingsJson,
      createdById: userId || null,
      createdBy: userId ? { id: userId, firstName: "مدیر", lastName: "سیستم", email: "admin@golmohamadi.com" } : null,
      createdAt: now,
    });

    return newSection;
  }

  /**
   * Admin: Update section content, increment version, and record a new revision atomically.
   */
  async updateSection(id: string, data: UpdateLandingSectionInput, userId?: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const current = await tx.landingSection.findFirst({
            where: { id, deletedAt: null },
          });
          if (!current) {
            throw new AppError("سکشن مورد نظر یافت نشد یا قبلاً حذف شده است.", 404, "SECTION_NOT_FOUND");
          }

          if (data.key && data.key !== current.key) {
            const existingKey = await tx.landingSection.findUnique({
              where: { key: data.key },
            });
            if (existingKey && existingKey.id !== id) {
              throw new AppError(
                `کلید یکتای '${data.key}' قبلاً توسط سکشن دیگری استفاده شده است.`,
                409,
                "KEY_ALREADY_EXISTS"
              );
            }
          }

          const newVersion = current.version + 1;

          let status = data.status ?? current.status;
          let isPublished = data.isPublished ?? current.isPublished;
          if (data.status !== undefined && data.isPublished === undefined) {
            isPublished = data.status === "PUBLISHED";
          } else if (data.isPublished !== undefined && data.status === undefined) {
            status = data.isPublished ? "PUBLISHED" : "DRAFT";
          }

          const updated = await tx.landingSection.update({
            where: { id },
            data: {
              ...(data.key !== undefined ? { key: data.key } : {}),
              ...(data.type !== undefined ? { type: data.type } : {}),
              status,
              version: newVersion,
              ...(data.title !== undefined ? { title: data.title } : {}),
              ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
              ...(data.badge !== undefined ? { badge: data.badge } : {}),
              ...(data.contentJson !== undefined ? { contentJson: data.contentJson ?? undefined } : {}),
              ...(data.settingsJson !== undefined ? { settingsJson: data.settingsJson ?? undefined } : {}),
              ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
              isPublished,
            },
          });

          await tx.landingSectionRevision.create({
            data: {
              sectionId: updated.id,
              version: newVersion,
              status: updated.status,
              title: updated.title,
              subtitle: updated.subtitle,
              badge: updated.badge,
              contentJson: updated.contentJson ?? undefined,
              settingsJson: updated.settingsJson ?? undefined,
              createdById: userId || null,
            },
          });

          return updated;
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    // In-memory logic
    const idx = inMemorySections.findIndex((s) => s.id === id && s.deletedAt === null);
    if (idx === -1) {
      throw new AppError("سکشن مورد نظر یافت نشد یا قبلاً حذف شده است.", 404, "SECTION_NOT_FOUND");
    }

    const current = inMemorySections[idx];

    if (data.key && data.key !== current.key) {
      const conflict = inMemorySections.find((s) => s.key === data.key && s.id !== id);
      if (conflict) {
        throw new AppError(
          `کلید یکتای '${data.key}' قبلاً توسط سکشن دیگری استفاده شده است.`,
          409,
          "KEY_ALREADY_EXISTS"
        );
      }
    }

    const newVersion = current.version + 1;
    let status = data.status ?? current.status;
    let isPublished = data.isPublished ?? current.isPublished;
    if (data.status !== undefined && data.isPublished === undefined) {
      isPublished = data.status === "PUBLISHED";
    } else if (data.isPublished !== undefined && data.status === undefined) {
      status = data.isPublished ? "PUBLISHED" : "DRAFT";
    }

    const updated = {
      ...current,
      ...(data.key !== undefined ? { key: data.key } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      status,
      version: newVersion,
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
      ...(data.badge !== undefined ? { badge: data.badge } : {}),
      ...(data.contentJson !== undefined ? { contentJson: data.contentJson } : {}),
      ...(data.settingsJson !== undefined ? { settingsJson: data.settingsJson } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      isPublished,
      updatedAt: new Date(),
    };

    inMemorySections[idx] = updated;

    inMemoryRevisions.unshift({
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sectionId: updated.id,
      version: newVersion,
      status: updated.status,
      title: updated.title,
      subtitle: updated.subtitle,
      badge: updated.badge,
      contentJson: updated.contentJson,
      settingsJson: updated.settingsJson,
      createdById: userId || null,
      createdBy: userId ? { id: userId, firstName: "مدیر", lastName: "سیستم", email: "admin@golmohamadi.com" } : null,
      createdAt: new Date(),
    });

    return updated;
  }

  /**
   * Admin: Soft-delete section (preserves revisions, sets deletedAt, status=ARCHIVED, isPublished=false).
   */
  async softDeleteSection(id: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const current = await tx.landingSection.findFirst({
            where: { id, deletedAt: null },
          });
          if (!current) {
            throw new AppError("سکشن مورد نظر یافت نشد یا قبلاً حذف شده است.", 404, "SECTION_NOT_FOUND");
          }

          const updated = await tx.landingSection.update({
            where: { id },
            data: {
              deletedAt: new Date(),
              isPublished: false,
              status: "ARCHIVED",
            },
          });

          return updated;
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    const idx = inMemorySections.findIndex((s) => s.id === id && s.deletedAt === null);
    if (idx === -1) {
      throw new AppError("سکشن مورد نظر یافت نشد یا قبلاً حذف شده است.", 404, "SECTION_NOT_FOUND");
    }

    inMemorySections[idx] = {
      ...inMemorySections[idx],
      deletedAt: new Date(),
      isPublished: false,
      status: "ARCHIVED",
      updatedAt: new Date(),
    };

    return inMemorySections[idx];
  }

  /**
   * Admin: Restore soft-deleted section.
   */
  async restoreSection(id: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const current = await tx.landingSection.findFirst({
            where: { id, deletedAt: { not: null } },
          });
          if (!current) {
            throw new AppError("سکشن حذف‌شده‌ای با این شناسه یافت نشد.", 404, "SECTION_NOT_FOUND");
          }

          const restored = await tx.landingSection.update({
            where: { id },
            data: {
              deletedAt: null,
              isPublished: false,
              status: "DRAFT",
            },
          });

          return restored;
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    const idx = inMemorySections.findIndex((s) => s.id === id && s.deletedAt !== null);
    if (idx === -1) {
      throw new AppError("سکشن حذف‌شده‌ای با این شناسه یافت نشد.", 404, "SECTION_NOT_FOUND");
    }

    inMemorySections[idx] = {
      ...inMemorySections[idx],
      deletedAt: null,
      isPublished: false,
      status: "DRAFT",
      updatedAt: new Date(),
    };

    return inMemorySections[idx];
  }

  /**
   * Admin: Duplicate an existing section with a new unique key, creating version 1 and initial revision.
   */
  async duplicateSection(id: string, newKey: string, titleOverride?: string | null, userId?: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const source = await tx.landingSection.findFirst({
            where: { id, deletedAt: null },
          });
          if (!source) {
            throw new AppError("سکشن منبع برای تکثیر یافت نشد.", 404, "SECTION_NOT_FOUND");
          }

          const existingKey = await tx.landingSection.findUnique({
            where: { key: newKey },
          });
          if (existingKey) {
            throw new AppError(
              `کلید یکتای '${newKey}' از قبل در سامانه وجود دارد.`,
              409,
              "KEY_ALREADY_EXISTS"
            );
          }

          const maxOrder = await tx.landingSection.findFirst({
            orderBy: { sortOrder: "desc" },
            select: { sortOrder: true },
          });
          const nextSortOrder = (maxOrder?.sortOrder ?? 0) + 1;

          const title =
            titleOverride !== undefined && titleOverride !== null
              ? titleOverride
              : source.title
              ? `${source.title} (کپی)`
              : "سکشن کپی‌شده";

          const duplicated = await tx.landingSection.create({
            data: {
              key: newKey,
              type: source.type,
              status: "DRAFT",
              version: 1,
              title,
              subtitle: source.subtitle,
              badge: source.badge,
              contentJson: source.contentJson ?? undefined,
              settingsJson: source.settingsJson ?? undefined,
              sortOrder: nextSortOrder,
              isPublished: false,
            },
          });

          await tx.landingSectionRevision.create({
            data: {
              sectionId: duplicated.id,
              version: 1,
              status: duplicated.status,
              title: duplicated.title,
              subtitle: duplicated.subtitle,
              badge: duplicated.badge,
              contentJson: duplicated.contentJson ?? undefined,
              settingsJson: duplicated.settingsJson ?? undefined,
              createdById: userId || null,
            },
          });

          return duplicated;
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    // In-memory logic
    const source = inMemorySections.find((s) => s.id === id && s.deletedAt === null);
    if (!source) {
      throw new AppError("سکشن منبع برای تکثیر یافت نشد.", 404, "SECTION_NOT_FOUND");
    }

    const existingKey = inMemorySections.find((s) => s.key === newKey);
    if (existingKey) {
      throw new AppError(
        `کلید یکتای '${newKey}' از قبل در سامانه وجود دارد.`,
        409,
        "KEY_ALREADY_EXISTS"
      );
    }

    const maxOrder = inMemorySections.reduce((max, s) => Math.max(max, s.sortOrder || 0), 0);
    const nextSortOrder = maxOrder + 1;

    const title =
      titleOverride !== undefined && titleOverride !== null
        ? titleOverride
        : source.title
        ? `${source.title} (کپی)`
        : "سکشن کپی‌شده";

    const newId = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const duplicated = {
      id: newId,
      key: newKey,
      type: source.type,
      status: "DRAFT",
      version: 1,
      title,
      subtitle: source.subtitle,
      badge: source.badge,
      contentJson: source.contentJson,
      settingsJson: source.settingsJson,
      sortOrder: nextSortOrder,
      isPublished: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    inMemorySections.push(duplicated);

    inMemoryRevisions.unshift({
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sectionId: newId,
      version: 1,
      status: "DRAFT",
      title: duplicated.title,
      subtitle: duplicated.subtitle,
      badge: duplicated.badge,
      contentJson: duplicated.contentJson,
      settingsJson: duplicated.settingsJson,
      createdById: userId || null,
      createdBy: userId ? { id: userId, firstName: "مدیر", lastName: "سیستم", email: "admin@golmohamadi.com" } : null,
      createdAt: now,
    });

    return duplicated;
  }

  /**
   * Admin: Reorder sections atomically.
   */
  async reorderSections(items: { id: string; sortOrder: number }[]) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const ids = items.map((i) => i.id);
          const existing = await tx.landingSection.findMany({
            where: {
              id: { in: ids },
              deletedAt: null,
            },
          });

          if (existing.length !== ids.length) {
            const foundIds = new Set(existing.map((e: any) => e.id));
            const missingIds = ids.filter((id) => !foundIds.has(id));
            throw new AppError(
              `برخی از سکشن‌های درخواستی وجود ندارند یا حذف شده‌اند: ${missingIds.join(", ")}`,
              400,
              "INVALID_SECTION_IDS"
            );
          }

          for (const item of items) {
            await tx.landingSection.update({
              where: { id: item.id },
              data: { sortOrder: item.sortOrder },
            });
          }

          return tx.landingSection.findMany({
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" },
          });
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    // In-memory logic
    const ids = items.map((i) => i.id);
    const validSections = inMemorySections.filter((s) => ids.includes(s.id) && s.deletedAt === null);

    if (validSections.length !== ids.length) {
      const foundIds = new Set(validSections.map((s) => s.id));
      const missingIds = ids.filter((id) => !foundIds.has(id));
      throw new AppError(
        `برخی از سکشن‌های درخواستی وجود ندارند یا حذف شده‌اند: ${missingIds.join(", ")}`,
        400,
        "INVALID_SECTION_IDS"
      );
    }

    for (const item of items) {
      const sec = inMemorySections.find((s) => s.id === item.id);
      if (sec) {
        sec.sortOrder = item.sortOrder;
        sec.updatedAt = new Date();
      }
    }

    return inMemorySections.filter((s) => s.deletedAt === null).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Admin: Publish section.
   */
  async publishSection(id: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const current = await tx.landingSection.findFirst({
            where: { id, deletedAt: null },
          });
          if (!current) {
            throw new AppError("سکشن مورد نظر یافت نشد.", 404, "SECTION_NOT_FOUND");
          }

          const updated = await tx.landingSection.update({
            where: { id },
            data: {
              status: "PUBLISHED",
              isPublished: true,
            },
          });

          return updated;
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    const idx = inMemorySections.findIndex((s) => s.id === id && s.deletedAt === null);
    if (idx === -1) {
      throw new AppError("سکشن مورد نظر یافت نشد.", 404, "SECTION_NOT_FOUND");
    }

    inMemorySections[idx] = {
      ...inMemorySections[idx],
      status: "PUBLISHED",
      isPublished: true,
      updatedAt: new Date(),
    };

    return inMemorySections[idx];
  }

  /**
   * Admin: Unpublish section.
   */
  async unpublishSection(id: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await (prisma as any).$transaction(async (tx: any) => {
          const current = await tx.landingSection.findFirst({
            where: { id, deletedAt: null },
          });
          if (!current) {
            throw new AppError("سکشن مورد نظر یافت نشد.", 404, "SECTION_NOT_FOUND");
          }

          const updated = await tx.landingSection.update({
            where: { id },
            data: {
              status: "DRAFT",
              isPublished: false,
            },
          });

          return updated;
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    const idx = inMemorySections.findIndex((s) => s.id === id && s.deletedAt === null);
    if (idx === -1) {
      throw new AppError("سکشن مورد نظر یافت نشد.", 404, "SECTION_NOT_FOUND");
    }

    inMemorySections[idx] = {
      ...inMemorySections[idx],
      status: "DRAFT",
      isPublished: false,
      updatedAt: new Date(),
    };

    return inMemorySections[idx];
  }

  /**
   * Admin: Get all revisions of a section ordered by version descending.
   */
  async getSectionRevisions(sectionId: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.landingSectionRevision.findMany({
          where: { sectionId },
          orderBy: { version: "desc" },
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    return inMemoryRevisions
      .filter((r) => r.sectionId === sectionId)
      .sort((a, b) => b.version - a.version);
  }

  /**
   * Admin: Get specific revision by version number.
   */
  async getRevisionByVersion(sectionId: string, version: number) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        return await prisma.landingSectionRevision.findUnique({
          where: {
            sectionId_version: {
              sectionId,
              version,
            },
          },
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    return (
      inMemoryRevisions.find((r) => r.sectionId === sectionId && r.version === version) || null
    );
  }
}

export const landingSectionRepository = new LandingSectionRepository();
