import {
  landingSectionRepository,
  CreateLandingSectionInput,
  UpdateLandingSectionInput,
} from "../repositories/landingSection.repository";
import { auditRepository } from "../repositories/audit.repository";
import {
  LandingSectionDTO,
  LandingSectionPublicDTO,
  LandingSectionRevisionDTO,
} from "../../../shared/types";

export class LandingSectionService {
  /**
   * Normalize database record into Public DTO.
   */
  private toPublicDTO(section: any): LandingSectionPublicDTO {
    return {
      id: section.id,
      key: section.key,
      type: section.type,
      title: section.title ?? null,
      subtitle: section.subtitle ?? null,
      badge: section.badge ?? null,
      content: section.contentJson ?? null,
      settings: section.settingsJson ?? null,
      sortOrder: section.sortOrder,
    };
  }

  /**
   * Normalize database record into Admin DTO.
   */
  private toAdminDTO(section: any): LandingSectionDTO {
    return {
      id: section.id,
      key: section.key,
      type: section.type,
      status: section.status,
      version: section.version,
      title: section.title ?? null,
      subtitle: section.subtitle ?? null,
      badge: section.badge ?? null,
      contentJson: section.contentJson ?? null,
      settingsJson: section.settingsJson ?? null,
      sortOrder: section.sortOrder,
      isPublished: section.isPublished,
      deletedAt: section.deletedAt ? new Date(section.deletedAt).toISOString() : null,
      createdAt: new Date(section.createdAt).toISOString(),
      updatedAt: new Date(section.updatedAt).toISOString(),
      revisionsCount: section._count?.revisions ?? undefined,
    };
  }

  /**
   * Normalize database record into Revision DTO.
   */
  private toRevisionDTO(rev: any): LandingSectionRevisionDTO {
    return {
      id: rev.id,
      sectionId: rev.sectionId,
      version: rev.version,
      status: rev.status,
      title: rev.title ?? null,
      subtitle: rev.subtitle ?? null,
      badge: rev.badge ?? null,
      contentJson: rev.contentJson ?? null,
      settingsJson: rev.settingsJson ?? null,
      createdById: rev.createdById ?? null,
      createdBy: rev.createdBy
        ? {
            id: rev.createdBy.id,
            firstName: rev.createdBy.firstName,
            lastName: rev.createdBy.lastName,
            email: rev.createdBy.email,
          }
        : null,
      createdAt: new Date(rev.createdAt).toISOString(),
    };
  }

  /**
   * Public: List all published sections.
   */
  async getPublicSections(): Promise<LandingSectionPublicDTO[]> {
    const sections = await landingSectionRepository.getPublishedSections();
    return sections.map((s: any) => this.toPublicDTO(s));
  }

  /**
   * Public: Get published section by key.
   */
  async getPublicSectionByKey(key: string): Promise<LandingSectionPublicDTO | null> {
    const section = await landingSectionRepository.getPublishedSectionByKey(key);
    if (!section) return null;
    return this.toPublicDTO(section);
  }

  /**
   * Admin: List all sections.
   */
  async getAdminSections(includeDeleted = false): Promise<LandingSectionDTO[]> {
    const sections = await landingSectionRepository.getAllSections(includeDeleted);
    return sections.map((s: any) => this.toAdminDTO(s));
  }

  /**
   * Admin: Get section by ID.
   */
  async getAdminSectionById(id: string, includeDeleted = false): Promise<LandingSectionDTO | null> {
    const section = await landingSectionRepository.getSectionById(id, includeDeleted);
    if (!section) return null;
    return this.toAdminDTO(section);
  }

  /**
   * Admin: Create a new section.
   */
  async createSection(data: CreateLandingSectionInput, userId?: string): Promise<LandingSectionDTO> {
    const section = await landingSectionRepository.createSection(data, userId);

    await auditRepository.log({
      action: "LANDING_SECTION_CREATED",
      entity: "LandingSection",
      entityId: section.id,
      userId,
      metadata: { key: section.key, type: section.type, version: 1 },
    });

    return this.toAdminDTO(section);
  }

  /**
   * Admin: Update section content and record new revision.
   */
  async updateSection(id: string, data: UpdateLandingSectionInput, userId?: string): Promise<LandingSectionDTO> {
    const updated = await landingSectionRepository.updateSection(id, data, userId);

    await auditRepository.log({
      action: "LANDING_SECTION_UPDATED",
      entity: "LandingSection",
      entityId: updated.id,
      userId,
      metadata: { key: updated.key, version: updated.version, status: updated.status },
    });

    return this.toAdminDTO(updated);
  }

  /**
   * Admin: Soft-delete section.
   */
  async softDeleteSection(id: string, userId?: string): Promise<LandingSectionDTO> {
    const deleted = await landingSectionRepository.softDeleteSection(id);

    await auditRepository.log({
      action: "LANDING_SECTION_DELETED",
      entity: "LandingSection",
      entityId: id,
      userId,
      metadata: { key: deleted.key },
    });

    return this.toAdminDTO(deleted);
  }

  /**
   * Admin: Restore soft-deleted section.
   */
  async restoreSection(id: string, userId?: string): Promise<LandingSectionDTO> {
    const restored = await landingSectionRepository.restoreSection(id);

    await auditRepository.log({
      action: "LANDING_SECTION_RESTORED",
      entity: "LandingSection",
      entityId: id,
      userId,
      metadata: { key: restored.key },
    });

    return this.toAdminDTO(restored);
  }

  /**
   * Admin: Duplicate section with a new unique key.
   */
  async duplicateSection(
    id: string,
    newKey: string,
    titleOverride?: string | null,
    userId?: string
  ): Promise<LandingSectionDTO> {
    const duplicated = await landingSectionRepository.duplicateSection(
      id,
      newKey,
      titleOverride,
      userId
    );

    await auditRepository.log({
      action: "LANDING_SECTION_DUPLICATED",
      entity: "LandingSection",
      entityId: duplicated.id,
      userId,
      metadata: { sourceId: id, newKey: duplicated.key, version: 1 },
    });

    return this.toAdminDTO(duplicated);
  }

  /**
   * Admin: Reorder sections.
   */
  async reorderSections(items: { id: string; sortOrder: number }[], userId?: string): Promise<LandingSectionDTO[]> {
    const reordered = await landingSectionRepository.reorderSections(items);

    await auditRepository.log({
      action: "LANDING_SECTIONS_REORDERED",
      entity: "LandingSection",
      userId,
      metadata: { count: items.length },
    });

    return reordered.map((s: any) => this.toAdminDTO(s));
  }

  /**
   * Admin: Publish section.
   */
  async publishSection(id: string, userId?: string): Promise<LandingSectionDTO> {
    const published = await landingSectionRepository.publishSection(id);

    await auditRepository.log({
      action: "LANDING_SECTION_PUBLISHED",
      entity: "LandingSection",
      entityId: id,
      userId,
      metadata: { key: published.key },
    });

    return this.toAdminDTO(published);
  }

  /**
   * Admin: Unpublish section.
   */
  async unpublishSection(id: string, userId?: string): Promise<LandingSectionDTO> {
    const unpublished = await landingSectionRepository.unpublishSection(id);

    await auditRepository.log({
      action: "LANDING_SECTION_UNPUBLISHED",
      entity: "LandingSection",
      entityId: id,
      userId,
      metadata: { key: unpublished.key },
    });

    return this.toAdminDTO(unpublished);
  }

  /**
   * Admin: Get all revisions for a section.
   */
  async getSectionRevisions(sectionId: string): Promise<LandingSectionRevisionDTO[]> {
    const revisions = await landingSectionRepository.getSectionRevisions(sectionId);
    return revisions.map((r: any) => this.toRevisionDTO(r));
  }

  /**
   * Admin: Get a specific revision by version.
   */
  async getRevisionByVersion(sectionId: string, version: number): Promise<LandingSectionRevisionDTO | null> {
    const revision = await landingSectionRepository.getRevisionByVersion(sectionId, version);
    if (!revision) return null;
    return this.toRevisionDTO(revision);
  }
}

export const landingSectionService = new LandingSectionService();
