const API_BASE = "/api/v1";

function getHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const activeToken = token || localStorage.getItem("pg_admin_token");
  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }
  return headers;
}

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: any;

  constructor(message: string, code = "API_ERROR", statusCode = 500, details?: any) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("pg_admin_token");
  const headers = {
    ...getHeaders(token),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.success === false) {
      const errMessage = json.error?.message || `خطای سرور (${res.status})`;
      const errCode = json.error?.code || "HTTP_ERROR";
      throw new ApiError(errMessage, errCode, res.status, json.error?.details);
    }

    return json.data as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || "خطا در برقراری ارتباط با سرور", "NETWORK_ERROR", 0);
  }
}

export const adminService = {
  // 1. Dashboard & Metrics
  async getDashboardStats() {
    return request<any>("/admin/dashboard-stats");
  },

  // 2. Products
  async getProducts(params?: { category?: string; search?: string; featured?: boolean }) {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    if (params?.featured !== undefined) q.set("featured", String(params.featured));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<any[]>(`/products${qs}`);
  },

  async getProductById(id: string) {
    return request<any>(`/products/${id}`);
  },

  async createProduct(data: any) {
    return request<any>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: any) {
    return request<any>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return request<any>(`/products/${id}`, {
      method: "DELETE",
    });
  },

  async bulkUpdatePrices(productIds: string[], percentageChange: number) {
    return request<any>("/products/bulk-price-update", {
      method: "POST",
      body: JSON.stringify({ productIds, percentageChange }),
    });
  },

  // 3. Categories
  async getCategories() {
    return request<any[]>("/categories");
  },

  async createCategory(data: any) {
    return request<any>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 4. Quotations
  async getQuotations() {
    return request<any[]>("/quotations");
  },

  async updateQuotationStatus(id: string, status: string, notes?: string) {
    return request<any>(`/quotations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  },

  // 5. Contact Inquiries
  async getContacts(params?: { status?: string }) {
    const qs = params?.status ? `?status=${params.status}` : "";
    return request<any[]>(`/contact-requests${qs}`);
  },

  async updateContactStatus(id: string, status: string) {
    return request<any>(`/contact-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // 6. Users & Roles
  async getUsers() {
    return request<any[]>("/admin/users");
  },

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    roles: string[];
  }) {
    return request<any>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateUserStatus(id: string, isActive: boolean) {
    return request<any>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  async deleteUser(id: string) {
    return request<any>(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },

  async getRoles() {
    return request<any[]>("/admin/roles");
  },

  async getPermissions() {
    return request<any[]>("/admin/permissions");
  },

  // 7. Discounts & Campaigns
  async getDiscounts() {
    return request<any[]>("/admin/discounts");
  },

  async createDiscount(data: any) {
    return request<any>("/admin/discounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getCampaigns() {
    return request<any[]>("/admin/campaigns");
  },

  async createCampaign(data: any) {
    return request<any>("/admin/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 8. Logs
  async getAuditLogs(params?: { entity?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.entity) q.set("entity", params.entity);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<any[]>(`/admin/audit-logs${qs}`);
  },

  async getSystemLogs() {
    return request<any[]>("/admin/system-logs");
  },

  // 9. Site Settings
  async getSettings() {
    return request<any>("/admin/settings");
  },

  async updateSettings(data: any) {
    return request<any>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
