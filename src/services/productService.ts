import { Product } from "../types";
import { productsData } from "../data/landingData";

function mapProductDTO(p: any): Product {
  const primaryImage = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url || p.image || "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80";

  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    category: p.category?.name || p.category || "گوشت قرمز",
    categoryId: p.categoryId,
    sku: p.sku,
    image: primaryImage,
    description: p.description || "",
    shortDescription: p.shortDescription || "",
    pricePerKg: p.effectivePrice || p.basePrice || 0,
    basePrice: p.basePrice || 0,
    effectivePrice: p.effectivePrice || p.basePrice || 0,
    discount: p.discountPercentage || undefined,
    available: p.isAvailable ?? true,
    isAvailable: p.isAvailable ?? true,
    isFeatured: p.isFeatured ?? false,
    unit: p.unit || "کیلوگرم",
    minimumOrder: p.minimumOrder || 1,
    allowCustomWeight: p.allowCustomWeight ?? true,
    features: Array.isArray(p.features) ? p.features : [],
    images: Array.isArray(p.images) ? p.images : [{ url: primaryImage, isPrimary: true, sortOrder: 0 }],
    packageOptions: Array.isArray(p.packageOptions) ? p.packageOptions : [],
    cutType: p.unit || "کیلوگرم",
    origin: "کشتارگاه صنعتی تهران",
    recommendedFor: "رستوران‌ها، هتل‌ها و مصارف ممتاز خانگی",
  };
}

export const productService = {
  async getProducts(params?: { category?: string; search?: string; featured?: boolean }): Promise<Product[]> {
    try {
      const q = new URLSearchParams();
      if (params?.category && params.category !== "همه محصولات") q.set("category", params.category);
      if (params?.search) q.set("search", params.search);
      if (params?.featured !== undefined) q.set("featured", String(params.featured));
      const qs = q.toString() ? `?${q.toString()}` : "";

      const res = await fetch(`/api/v1/products${qs}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.map(mapProductDTO);
      }
    } catch (err) {
      console.warn("Product API unavailable, using fallback catalog:", err);
    }
    return productsData.map(mapProductDTO);
  },

  async getCategories(): Promise<string[]> {
    try {
      const res = await fetch("/api/v1/categories");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const names = json.data.map((c: any) => c.name);
          return ["همه محصولات", ...names];
        }
      }
    } catch {
      // Fallback
    }
    return ["همه محصولات", "گوشت گوساله", "گوشت گوسفندی", "محصولات ویژه", "تخفیفدار"];
  },

  async getProductById(idOrSlug: string): Promise<Product | undefined> {
    try {
      const res = await fetch(`/api/v1/products/${encodeURIComponent(idOrSlug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return mapProductDTO(json.data);
        }
      }
    } catch {
      // Fallback
    }
    const fallback = productsData.find((p) => p.id === idOrSlug || (p as any).slug === idOrSlug);
    return fallback ? mapProductDTO(fallback) : undefined;
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const res = await fetch(`/api/v1/products/slug/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return mapProductDTO(json.data);
        }
      }
    } catch {
      // Fallback
    }
    return this.getProductById(slug);
  },
};
