import { blogRepository } from "../repositories/blog.repository";
import {
  BlogPostDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogPostStatus,
  BlogPostQueryOptions,
} from "../../../shared/types";
import { AppError } from "../middleware/errorHandler";

/**
 * Server-side HTML sanitizer for blog article content to eliminate XSS risks
 */
export function sanitizeArticleContent(html: string): string {
  if (!html) return "";
  let sanitized = html;
  // Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove dangerous tags: iframe, embed, object, frame
  sanitized = sanitized.replace(/<\/?(iframe|embed|object|frameset|frame|base)\b[^>]*>/gi, "");
  // Remove inline on* handlers like onerror, onclick, onload, etc.
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");
  // Remove javascript: pseudo protocol in href or src
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*javascript:[^"'>\s]+/gi, '$1="#"');
  return sanitized;
}

/**
 * Convert string to clean URL-safe slug
 */
export function generateUrlSafeSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .replace(/^-+|-+$/g, "");
}

/**
 * Strip HTML tags to extract raw text summary for SEO descriptions
 */
export function stripHtmlToText(html: string, maxLength: number = 160): string {
  if (!html) return "";
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + "...";
}

export class BlogService {
  // -------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------

  async getPublishedPosts(options: BlogPostQueryOptions = {}) {
    return blogRepository.findAllPublished(options);
  }

  async getLatestPosts(limit: number = 3) {
    const safeLimit = Math.min(Math.max(1, limit), 12);
    return blogRepository.getLatestPublished(safeLimit);
  }

  async getPostBySlug(slug: string) {
    if (!slug) {
      throw new AppError("اسلاگ مقاله الزامی است", 400);
    }
    const cleanSlug = slug.trim();
    const result = await blogRepository.getPublishedBySlug(cleanSlug);
    if (!result.post) {
      throw new AppError("مقاله مورد نظر یافت نشد یا هنوز منتشر نشده است", 404);
    }
    return result;
  }

  async getPublicCategories() {
    const all = await blogRepository.findAllCategories();
    return all.filter((c) => c.isActive);
  }

  async getPublicTags() {
    return blogRepository.findAllTags();
  }

  // -------------------------------------------------------------
  // Admin Methods
  // -------------------------------------------------------------

  async getAdminPosts(options: BlogPostQueryOptions = {}) {
    return blogRepository.findAllAdmin(options);
  }

  async getAdminPostById(id: string) {
    const post = await blogRepository.findById(id);
    if (!post) {
      throw new AppError("مقاله یافت نشد", 404);
    }
    return post;
  }

  async createPost(
    data: {
      title: string;
      slug?: string;
      excerpt?: string | null;
      content: string;
      featuredImage?: string | null;
      status?: BlogPostStatus;
      publishedAt?: string | null;
      categoryIds?: string[];
      tagNames?: string[];
      seoTitle?: string | null;
      seoDescription?: string | null;
      seoKeywords?: string | null;
      canonicalUrl?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
    },
    author?: { id: string; name: string }
  ): Promise<BlogPostDTO> {
    if (!data.title || data.title.trim().length < 3) {
      throw new AppError("عنوان مقاله باید حداقل ۳ کاراکتر باشد", 400);
    }
    if (!data.content || data.content.trim().length < 10) {
      throw new AppError("محتوای مقاله باید حداقل ۱۰ کاراکتر باشد", 400);
    }

    // Determine slug
    let rawSlug = data.slug ? generateUrlSafeSlug(data.slug) : generateUrlSafeSlug(data.title);
    if (!rawSlug) rawSlug = `post-${Date.now()}`;

    // Ensure unique slug
    let finalSlug = rawSlug;
    let counter = 1;
    while (await blogRepository.findBySlug(finalSlug)) {
      counter++;
      finalSlug = `${rawSlug}-${counter}`;
    }

    // Sanitize content
    const sanitizedContent = sanitizeArticleContent(data.content);

    // Determine status & publishedAt
    const status = data.status || "DRAFT";
    let publishedAt = data.publishedAt || null;
    if (status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    // Excerpt fallback
    const excerpt = data.excerpt || stripHtmlToText(sanitizedContent, 160);

    // SEO Automatic Fallbacks (Part B2 Requirement)
    const seoTitle = data.seoTitle?.trim() || `${data.title} | پروتئین گلمحمدی`;
    const seoDescription = data.seoDescription?.trim() || excerpt;
    const ogTitle = data.ogTitle?.trim() || seoTitle;
    const ogDescription = data.ogDescription?.trim() || seoDescription;
    const ogImage = data.ogImage?.trim() || data.featuredImage || null;
    const canonicalUrl = data.canonicalUrl?.trim() || `https://golmohamadi.com/blog/${finalSlug}`;

    return blogRepository.create({
      title: data.title.trim(),
      slug: finalSlug,
      excerpt,
      content: sanitizedContent,
      featuredImage: data.featuredImage || null,
      status,
      publishedAt,
      authorId: author?.id || null,
      authorName: author?.name || "مدیر محتوا",
      categoryIds: data.categoryIds || [],
      tagNames: data.tagNames || [],
      seoTitle,
      seoDescription,
      seoKeywords: data.seoKeywords || null,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
    });
  }

  async updatePost(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      excerpt?: string | null;
      content: string;
      featuredImage?: string | null;
      status: BlogPostStatus;
      publishedAt?: string | null;
      categoryIds?: string[];
      tagNames?: string[];
      seoTitle?: string | null;
      seoDescription?: string | null;
      seoKeywords?: string | null;
      canonicalUrl?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
    }>
  ): Promise<BlogPostDTO> {
    const existing = await blogRepository.findById(id);
    if (!existing) {
      throw new AppError("مقاله مورد نظر یافت نشد", 404);
    }

    let finalSlug = existing.slug;
    if (data.slug && data.slug.trim() !== existing.slug) {
      const candidate = generateUrlSafeSlug(data.slug);
      const conflict = await blogRepository.findBySlug(candidate);
      if (conflict && conflict.id !== id) {
        throw new AppError("این اسلاگ قبلاً توسط مقاله دیگری استفاده شده است", 400);
      }
      finalSlug = candidate;
    }

    let sanitizedContent = data.content !== undefined ? sanitizeArticleContent(data.content) : undefined;

    // Status / publishedAt logic
    let status = data.status !== undefined ? data.status : existing.status;
    let publishedAt = data.publishedAt !== undefined ? data.publishedAt : existing.publishedAt;

    if (status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    // SEO Fallbacks if title or excerpt changed
    const currentTitle = data.title || existing.title;
    const currentExcerpt = data.excerpt !== undefined ? data.excerpt : existing.excerpt;
    const currentFeaturedImage = data.featuredImage !== undefined ? data.featuredImage : existing.featuredImage;

    const seoTitle = data.seoTitle !== undefined ? data.seoTitle : existing.seoTitle || `${currentTitle} | پروتئین گلمحمدی`;
    const seoDescription = data.seoDescription !== undefined ? data.seoDescription : existing.seoDescription || currentExcerpt;
    const ogTitle = data.ogTitle !== undefined ? data.ogTitle : existing.ogTitle || seoTitle;
    const ogDescription = data.ogDescription !== undefined ? data.ogDescription : existing.ogDescription || seoDescription;
    const ogImage = data.ogImage !== undefined ? data.ogImage : existing.ogImage || currentFeaturedImage;
    const canonicalUrl = data.canonicalUrl !== undefined ? data.canonicalUrl : existing.canonicalUrl || `https://golmohamadi.com/blog/${finalSlug}`;

    const updated = await blogRepository.update(id, {
      ...data,
      slug: finalSlug,
      content: sanitizedContent,
      status,
      publishedAt,
      seoTitle,
      seoDescription,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
    });

    if (!updated) {
      throw new AppError("خطا در بروزرسانی مقاله", 500);
    }
    return updated;
  }

  async updatePostStatus(id: string, status: BlogPostStatus): Promise<BlogPostDTO> {
    const existing = await blogRepository.findById(id);
    if (!existing) {
      throw new AppError("مقاله یافت نشد", 404);
    }

    let publishedAt = existing.publishedAt;
    if (status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    const updated = await blogRepository.update(id, { status, publishedAt });
    if (!updated) {
      throw new AppError("خطا در تغییر وضعیت مقاله", 500);
    }
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    const existing = await blogRepository.findById(id);
    if (!existing) {
      throw new AppError("مقاله یافت نشد", 404);
    }
    return blogRepository.delete(id);
  }

  // -------------------------------------------------------------
  // Category Management
  // -------------------------------------------------------------

  async getCategories() {
    return blogRepository.findAllCategories();
  }

  async createCategory(data: { name: string; slug: string; description?: string | null; isActive?: boolean }) {
    if (!data.name || data.name.trim().length < 2) {
      throw new AppError("نام دسته‌بندی باید حداقل ۲ کاراکتر باشد", 400);
    }
    const slug = generateUrlSafeSlug(data.slug || data.name);
    const existing = await blogRepository.findCategoryBySlug(slug);
    if (existing) {
      throw new AppError("دسته‌بندی با این اسلاگ قبلاً ثبت شده است", 400);
    }
    return blogRepository.createCategory({ ...data, slug });
  }

  async updateCategory(id: string, data: Partial<{ name: string; slug: string; description?: string | null; isActive?: boolean }>) {
    const existing = await blogRepository.findCategoryById(id);
    if (!existing) {
      throw new AppError("دسته‌بندی یافت نشد", 404);
    }
    if (data.slug && data.slug !== existing.slug) {
      const slug = generateUrlSafeSlug(data.slug);
      const conflict = await blogRepository.findCategoryBySlug(slug);
      if (conflict && conflict.id !== id) {
        throw new AppError("این اسلاگ در دسته‌بندی دیگری استفاده شده است", 400);
      }
      data.slug = slug;
    }
    return blogRepository.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    const res = await blogRepository.deleteCategory(id);
    if (!res.success) {
      throw new AppError(res.error || "خطا در حذف دسته‌بندی", 400);
    }
    return { message: "دسته‌بندی با موفقیت حذف گردید" };
  }

  // -------------------------------------------------------------
  // Tags Management
  // -------------------------------------------------------------

  async getTags() {
    return blogRepository.findAllTags();
  }

  async createTag(name: string) {
    if (!name || name.trim().length < 2) {
      throw new AppError("نام برچسب باید حداقل ۲ کاراکتر باشد", 400);
    }
    return blogRepository.findOrCreateTag(name.trim());
  }
}

export const blogService = new BlogService();
