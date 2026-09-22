import React, { useState, useEffect } from "react";
import { Product } from "../../types";
import { productService } from "../../services";
import { ProductDetailModal } from "../products/ProductDetailModal";
import { ShoppingBag, Filter, FileText, Tag } from "lucide-react";

export const StoreSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("همه محصولات");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([productService.getProducts(), productService.getCategories()]).then(
      ([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
        setLoading(false);
      }
    );
  }, []);

  const filteredProducts =
    activeCategory === "همه محصولات"
      ? products
      : activeCategory === "تخفیفدار"
      ? products.filter((p) => p.discount && p.discount > 0)
      : products.filter((p) => p.category === activeCategory);

  return (
    <section
      id="store-section"
      className="py-24 sm:py-32 bg-[var(--bg-primary)] text-[var(--text-primary)] border-t border-[var(--border)] relative"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs text-[#CD78B3] mb-4">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>سامانه تأمین مستقیم گوشت ممتاز</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              فروشگاه اینترنتی
            </h2>

            <p className="text-[var(--text-secondary)] text-sm sm:text-base font-light max-w-xl mt-3">
              انتخاب آنلاین برش‌های خاص، تعیین وزن دلخواه و دریافت پیش‌فاکتور رسمی تجاری یا خانگی
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--surface-card)] px-4 py-2 rounded-2xl border border-[var(--border)] shadow-sm">
            <Filter className="w-4 h-4 text-[#CD78B3]" />
            <span>دسته‌بندی‌های تخصصی:</span>
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#CD78B3] text-white shadow-lg shadow-[#CD78B3]/25"
                  : "bg-[var(--surface-card)] hover:bg-[var(--surface-card-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] shadow-xs"
              }`}
            >
              {cat === "تخفیفدار" && <Tag className="w-3.5 h-3.5 text-amber-300" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <div className="w-10 h-10 border-2 border-[#124A57] border-t-[#CD78B3] rounded-full animate-spin mb-4" />
            <span className="text-xs">در حال بارگذاری کاتالوگ محصولات...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail & Quotation Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div
      id={`product-card-${product.id}`}
      className="group rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#CD78B3]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[var(--card-shadow)] hover:shadow-2xl"
    >
      <div>
        {/* Media Frame */}
        <div className="relative aspect-[4/3] overflow-hidden bg-black/10">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-80" />

          {product.discount && (
            <span className="absolute top-3 right-3 bg-[#CD78B3] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
              {product.discount}٪ تخفیف
            </span>
          )}

          <span className="absolute bottom-3 right-3 text-[10px] font-mono text-[#CD78B3] bg-[var(--surface-card)]/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-[var(--border)] uppercase shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Details */}
        <div className="p-5">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#CD78B3] transition-colors leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed line-clamp-2 mb-4">
            {product.description}
          </p>

          {product.pricePerKg ? (
            <div className="flex items-baseline justify-between pt-3 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--text-muted)] font-light">قیمت هر کیلوگرم:</span>
              <div className="text-left font-mono">
                {product.discount && (
                  <span className="text-[11px] text-[var(--text-muted)] line-through block">
                    {product.pricePerKg.toLocaleString("fa-IR")}
                  </span>
                )}
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {(
                    product.pricePerKg * (1 - (product.discount || 0) / 100)
                  ).toLocaleString("fa-IR")}{" "}
                  <span className="text-[10px] text-[var(--text-muted)] font-sans">تومان</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              قیمت طبق استعلام روز
            </div>
          )}
        </div>
      </div>

      {/* Card Action CTA */}
      <div className="p-5 pt-0">
        <button
          onClick={() => onSelect(product)}
          className="w-full py-2.5 rounded-2xl bg-[#124A57] hover:bg-[#CD78B3] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>درخواست پیش‌فاکتور</span>
        </button>
      </div>
    </div>
  );
};
