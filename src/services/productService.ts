import { Product } from "../types";
import { productsData } from "../data/landingData";

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch("/api/v1/products");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category?.name || "گوشت قرمز",
          image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80",
          description: p.description,
          pricePerKg: p.effectivePrice || p.basePrice,
          discount: p.discountPercentage || undefined,
          available: p.isAvailable ?? true,
          cutType: p.unit || "کیلوگرم",
          origin: "کشتارگاه صنعتی تهران",
          recommendedFor: "رستوران‌ها و گریل حرفه‌ای",
        }));
      }
    } catch (err) {
      console.warn("Product API unavailable, using fallback catalog:", err);
    }
    return [...productsData];
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
    } catch (err) {
      // Fallback
    }
    return ["همه محصولات", "گوشت قرمز", "گوشت گوسفندی", "گوشت گوساله", "محصولات ویژه", "تخفیفدار"];
  },

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      const res = await fetch(`/api/v1/products/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          return {
            id: p.id,
            name: p.name,
            category: p.category?.name || "گوشت قرمز",
            image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80",
            description: p.description,
            pricePerKg: p.effectivePrice || p.basePrice,
            discount: p.discountPercentage || undefined,
            available: p.isAvailable ?? true,
          };
        }
      }
    } catch (err) {
      // Fallback
    }
    return productsData.find((p) => p.id === id);
  },
};
