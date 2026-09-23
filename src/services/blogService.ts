import {
  BlogPostDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogPostStatus,
  BlogPostQueryOptions,
  ApiResponse,
} from "../../shared/types";

const API_BASE = "/api/v1";

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("pg_admin_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const blogService = {
  // -------------------------------------------------------------
  // Public Client APIs
  // -------------------------------------------------------------

  async getPublishedPosts(options: BlogPostQueryOptions = {}): Promise<{
    posts: BlogPostDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.categorySlug) params.append("category", options.categorySlug);
    if (options.tagSlug) params.append("tag", options.tagSlug);
    if (options.search) params.append("search", options.search);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/blog/posts${query}`);
    const json: ApiResponse<BlogPostDTO[]> = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "خطا در دریافت مقالات وبلاگ");
    }

    return {
      posts: json.data || [],
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      totalPages: json.meta?.totalPages || 1,
    };
  },

  async getLatestPosts(limit: number = 3): Promise<BlogPostDTO[]> {
    try {
      const res = await fetch(`${API_BASE}/blog/latest?limit=${limit}`);
      const json: ApiResponse<BlogPostDTO[]> = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      // Fallback
    }
    return [];
  },

  async getPostBySlug(slug: string): Promise<{ post: BlogPostDTO; redirectedTo?: string }> {
    const res = await fetch(`${API_BASE}/blog/posts/${encodeURIComponent(slug)}`);
    const json: ApiResponse<{ post: BlogPostDTO; redirectedTo?: string }> = await res.json();

    if (!res.ok || !json.success || !json.data?.post) {
      throw new Error(json.error?.message || "مقاله مورد نظر یافت نشد");
    }

    return json.data;
  },

  async getCategories(): Promise<BlogCategoryDTO[]> {
    try {
      const res = await fetch(`${API_BASE}/blog/categories`);
      const json: ApiResponse<BlogCategoryDTO[]> = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {}
    return [];
  },

  async getTags(): Promise<BlogTagDTO[]> {
    try {
      const res = await fetch(`${API_BASE}/blog/tags`);
      const json: ApiResponse<BlogTagDTO[]> = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {}
    return [];
  },

  // -------------------------------------------------------------
  // Admin APIs
  // -------------------------------------------------------------

  async getAdminPosts(options: BlogPostQueryOptions = {}): Promise<{
    posts: BlogPostDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.status) params.append("status", options.status);
    if (options.categorySlug) params.append("category", options.categorySlug);
    if (options.search) params.append("search", options.search);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/admin/blog/posts${query}`, {
      headers: getHeaders(),
    });
    const json: ApiResponse<BlogPostDTO[]> = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "خطا در دریافت مقالات پنل مدیریت");
    }

    return {
      posts: json.data || [],
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      totalPages: json.meta?.totalPages || 1,
    };
  },

  async getAdminPostById(id: string): Promise<BlogPostDTO> {
    const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, {
      headers: getHeaders(),
    });
    const json: ApiResponse<BlogPostDTO> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || "خطا در دریافت جزییات مقاله");
    }
    return json.data;
  },

  async createPost(data: any): Promise<BlogPostDTO> {
    const res = await fetch(`${API_BASE}/admin/blog/posts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json: ApiResponse<BlogPostDTO> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || "خطا در ایجاد مقاله");
    }
    return json.data;
  },

  async updatePost(id: string, data: any): Promise<BlogPostDTO> {
    const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json: ApiResponse<BlogPostDTO> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || "خطا در ویرایش مقاله");
    }
    return json.data;
  },

  async updatePostStatus(id: string, status: BlogPostStatus): Promise<BlogPostDTO> {
    const res = await fetch(`${API_BASE}/admin/blog/posts/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const json: ApiResponse<BlogPostDTO> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || "خطا در تغییر وضعیت مقاله");
    }
    return json.data;
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const json: ApiResponse = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "خطا در حذف مقاله");
    }
  },

  async uploadImage(file: File): Promise<{ url: string; fileName: string; size: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileBase64 = reader.result as string;
          const res = await fetch(`${API_BASE}/admin/blog/upload-image`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              fileBase64,
              fileName: file.name,
              fileType: file.type,
            }),
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error?.message || "خطا در بارگذاری تصویر");
          }
          resolve(json.data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("خطا در خواندن فایل تصویر"));
      reader.readAsDataURL(file);
    });
  },

  // Category Admin Methods
  async getAdminCategories(): Promise<BlogCategoryDTO[]> {
    const res = await fetch(`${API_BASE}/admin/blog/categories`, {
      headers: getHeaders(),
    });
    const json: ApiResponse<BlogCategoryDTO[]> = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "خطا در دریافت دسته‌بندی‌ها");
    }
    return json.data || [];
  },

  async createCategory(data: { name: string; slug: string; description?: string }): Promise<BlogCategoryDTO> {
    const res = await fetch(`${API_BASE}/admin/blog/categories`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json: ApiResponse<BlogCategoryDTO> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || "خطا در ایجاد دسته‌بندی");
    }
    return json.data;
  },

  async updateCategory(id: string, data: any): Promise<BlogCategoryDTO> {
    const res = await fetch(`${API_BASE}/admin/blog/categories/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json: ApiResponse<BlogCategoryDTO> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || "خطا در ویرایش دسته‌بندی");
    }
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/blog/categories/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const json: ApiResponse = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "خطا در حذف دسته‌بندی");
    }
  },

  // Tag Admin Methods
  async getAdminTags(): Promise<BlogTagDTO[]> {
    const res = await fetch(`${API_BASE}/admin/blog/tags`, {
      headers: getHeaders(),
    });
    const json: ApiResponse<BlogTagDTO[]> = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "خطا در دریافت برچسب‌ها");
    }
    return json.data || [];
  },

  async createTag(name: string): Promise<BlogTagDTO> {
    const res = await fetch(`${API_BASE}/admin/blog/tags`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    const json: ApiResponse<BlogTagDTO> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || "خطا در ایجاد برچسب");
    }
    return json.data;
  },
};
