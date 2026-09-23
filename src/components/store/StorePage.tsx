import React, { useState, useEffect, useMemo } from "react";
import { Product } from "../../types";
import { productService } from "../../services";
import { ProductDetailModal } from "../products/ProductDetailModal";
import { formatPersianNumber, toPersianDigits } from "../../utils/formatters";
import { useRouter } from "../../context/RouterContext";
import {
  ShoppingBag,
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Tag,
  Check,
  RotateCcw,
  ArrowUpDown,
  ShieldCheck,
  Truck,
  Package
} from "lucide-react";

export const StorePage: React.FC = () => {
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("همه محصولات");
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<"featured" | "priceAsc" | "priceDesc" | "newest">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Quick Modal
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);

  // Mobile filters open
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([productService.getProducts(), productService.getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter and Sort calculation
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory && selectedCategory !== "همه محصولات") {
      if (selectedCategory === "تخفیفدار") {
        list = list.filter((p) => p.discount && p.discount > 0);
      } else {
        list = list.filter((p) => p.category === selectedCategory);
      }
    }

    // Only Discounted
    if (onlyDiscounted) {
      list = list.filter((p) => p.discount && p.discount > 0);
    }

    // Only Featured
    if (onlyFeatured) {
      list = list.filter((p) => p.isFeatured);
    }

    // Only Available
    if (onlyAvailable) {
      list = list.filter((p) => p.available !== false && p.isAvailable !== false);
    }

    // Sort
    if (sortBy === "priceAsc") {
      list.sort(
        (a, b) =>
          (a.effectivePrice ?? a.pricePerKg ?? 0) -
          (b.effectivePrice ?? b.pricePerKg ?? 0)
      );
    } else if (sortBy === "priceDesc") {
      list.sort(
        (a, b) =>
          (b.effectivePrice ?? b.pricePerKg ?? 0) -
          (a.effectivePrice ?? a.pricePerKg ?? 0)
      );
    } else if (sortBy === "newest") {
      list.sort((a, b) => (b.id > a.id ? 1 : -1));
    } else {
      // featured
      list.sort((a, b) => ((b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)));
    }

    return list;
  }, [products, searchQuery, selectedCategory, onlyDiscounted, onlyFeatured, onlyAvailable, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("همه محصولات");
    setOnlyDiscounted(false);
    setOnlyFeatured(false);
    setOnlyAvailable(true);
    setSortBy("featured");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "همه محصولات" ||
    onlyDiscounted ||
    onlyFeatured ||
    !onlyAvailable ||
    sortBy !== "featured";

  return (
    <div className="py-10 bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Banner / Store Header */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 mb-10 bg-gradient-to-l from-[#124A57] via-[#103E49] to-[#0c2f37] text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              <ShoppingBag className="w-3.5 h-3.5 text-[#CD78B3]" />
              <span>فروشگاه تخصصی تأمین مستقیم پروتئین</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              کاتالوگ برش‌های لوکس و استیک‌های ممتاز
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-light leading-relaxed">
              ارائه مستقیم لاشه‌های دستچین کشتار روز و برش‌های تخصصی با بسته‌بندی تحت اتمسفر کنترل‌شده (MAP) و گواهی زنجیره سرد
            </p>

            <div className="flex items-center gap-6 pt-2 text-xs text-white/90">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#CD78B3]" />
                <span>ضمانت اصالت و سلامت</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#CD78B3]" />
                <span>تحویل با خودروی یخچال‌دار</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, Category Pills, View Mode */}
        <div className="space-y-6 mb-10">
          {/* Top Row: Search & Mobile Filter Button & Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="جستجو در میان استیک‌ها، نام یا کد کالا..."
                className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#CD78B3] transition-colors shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & View Mode Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#CD78B3]" />
                <span>فیلترها {hasActiveFilters && "•"}</span>
              </button>

              <div className="flex items-center gap-2 bg-[var(--surface-card)] px-3 py-1.5 rounded-2xl border border-[var(--border)] shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#CD78B3]" />
                <span className="text-xs text-[var(--text-secondary)]">مرتب‌سازی:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer pr-1"
                >
                  <option value="featured" className="bg-[var(--bg-primary)]">محصولات منتخب</option>
                  <option value="priceAsc" className="bg-[var(--bg-primary)]">ارزان‌ترین</option>
                  <option value="priceDesc" className="bg-[var(--bg-primary)]">گران‌ترین</option>
                  <option value="newest" className="bg-[var(--bg-primary)]">جدیدترین</option>
                </select>
              </div>

              {/* View mode toggle */}
              <div className="hidden sm:flex items-center bg-[var(--surface-card)] p-1 rounded-2xl border border-[var(--border)] shadow-xs">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                    viewMode === "grid" ? "bg-[#124A57] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  title="نمایش شبکه‌ای"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                    viewMode === "list" ? "bg-[#124A57] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  title="نمایش لیستی"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#CD78B3] text-white shadow-md shadow-[#CD78B3]/25"
                      : "bg-[var(--surface-card)] hover:bg-[var(--surface-card-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] shadow-xs"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout (Sidebar Filters on Desktop + Products Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filters Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-[var(--surface-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)]">
                <Filter className="w-4 h-4 text-[#CD78B3]" />
                <span>فیلترهای پیشرفته</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#CD78B3] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>حذف فیلترها</span>
                </button>
              )}
            </div>

            {/* Availability Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">وضعیت موجودی</label>
              <label className="flex items-center justify-between text-xs text-[var(--text-primary)] cursor-pointer select-none">
                <span>فقط کالاهای موجود</span>
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => {
                    setOnlyAvailable(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-[#CD78B3] cursor-pointer"
                />
              </label>
            </div>

            {/* Special Offers Filter */}
            <div className="space-y-3 pt-3 border-t border-[var(--border)]">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">پیشنهادهای ویژه</label>
              <label className="flex items-center justify-between text-xs text-[var(--text-primary)] cursor-pointer select-none">
                <span>فقط محصولات تخفیف‌دار</span>
                <input
                  type="checkbox"
                  checked={onlyDiscounted}
                  onChange={(e) => {
                    setOnlyDiscounted(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-[#CD78B3] cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-[var(--text-primary)] cursor-pointer select-none">
                <span>فقط محصولات منتخب سرآشپز</span>
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => {
                    setOnlyFeatured(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-[#CD78B3] cursor-pointer"
                />
              </label>
            </div>

            {/* Order Note */}
            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-2">
              <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#CD78B3]" />
                <span>حداقل حجم سفارش</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                تمام برش‌ها با استانداردهای وزن عمده و خرد قابل تأمین بوده و همراه با پیش‌فاکتور رسمی صادر می‌گردند.
              </p>
            </div>
          </aside>

          {/* Products Column (9 cols) */}
          <main className="lg:col-span-9 space-y-8">
            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-10 h-10 border-3 border-[#CD78B3]/20 border-t-[#CD78B3] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[var(--text-secondary)]">در حال بارگذاری کاتالوگ محصولات...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="py-20 text-center bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-8">
                <ShoppingBag className="w-12 h-12 text-[var(--text-secondary)]/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">محصولی با این مشخصات یافت نشد</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-6">
                  لطفاً عبارت جستجو را تغییر دهید یا فیلترهای انتخابی را پاک فرمایید.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-2xl bg-[#124A57] text-white text-xs font-semibold hover:bg-[#185e6f] transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>پاک کردن همه فیلترها</span>
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => {
                  const unitPrice = product.pricePerKg || 0;
                  const effectivePrice = product.effectivePrice || (product.discount ? unitPrice * (1 - product.discount / 100) : unitPrice);

                  return (
                    <div
                      key={product.id}
                      className="group rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] overflow-hidden hover:border-[#CD78B3]/50 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
                    >
                      {/* Image & Badges */}
                      <div
                        onClick={() => navigate(`/product/${product.slug || product.id}`)}
                        className="relative aspect-4/3 overflow-hidden bg-[var(--bg-primary)] cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-xs font-semibold text-white">مشاهده مشخصات کامل &larr;</span>
                        </div>

                        {product.discount && product.discount > 0 && (
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#CD78B3] text-white text-[11px] font-black shadow-md">
                            {toPersianDigits(product.discount)}٪ تخفیف
                          </div>
                        )}

                        {product.isFeatured && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#124A57]/90 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#CD78B3]" />
                            <span>ویژه</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                            <span className="font-semibold text-[#CD78B3]">{product.category}</span>
                            {product.sku && <span className="font-mono">{product.sku}</span>}
                          </div>

                          <h3
                            onClick={() => navigate(`/product/${product.slug || product.id}`)}
                            className="text-sm font-bold text-[var(--text-primary)] hover:text-[#CD78B3] transition-colors cursor-pointer line-clamp-2"
                          >
                            {product.name}
                          </h3>

                          {product.shortDescription && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                              {product.shortDescription}
                            </p>
                          )}
                        </div>

                        {/* Package Options Preview */}
                        {product.packageOptions && product.packageOptions.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {product.packageOptions.slice(0, 2).map((opt) => (
                              <span
                                key={opt.id || opt.weightKg}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)]"
                              >
                                {opt.label}
                              </span>
                            ))}
                            {product.packageOptions.length > 2 && (
                              <span className="text-[10px] text-[var(--text-secondary)]">
                                +{toPersianDigits(product.packageOptions.length - 2)} بسته دیگر
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price and Action Buttons */}
                        <div className="pt-3 border-t border-[var(--border)] space-y-3">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] text-[var(--text-secondary)]">قیمت هر کیلوگرم:</span>
                            <div className="text-left">
                              {product.discount && product.discount > 0 && (
                                <span className="text-[11px] text-[var(--text-secondary)] line-through block">
                                  {formatPersianNumber(unitPrice)}
                                </span>
                              )}
                              <span className="text-base font-black text-[#CD78B3]">
                                {formatPersianNumber(effectivePrice)} <span className="text-[11px] font-normal text-[var(--text-primary)]">تومان</span>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setQuickProduct(product)}
                              className="py-2 px-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--surface-card-alt)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#CD78B3]" />
                              <span>استعلام سریع</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate(`/product/${product.slug || product.id}`)}
                              className="py-2 px-3 rounded-xl bg-[#124A57] hover:bg-[#185e6f] text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                            >
                              مشاهده کامل
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List Layout */
              <div className="space-y-4">
                {paginatedProducts.map((product) => {
                  const unitPrice = product.pricePerKg || 0;
                  const effectivePrice = product.effectivePrice || (product.discount ? unitPrice * (1 - product.discount / 100) : unitPrice);

                  return (
                    <div
                      key={product.id}
                      className="group rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] overflow-hidden hover:border-[#CD78B3]/50 transition-all p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xs hover:shadow-md"
                    >
                      <div
                        onClick={() => navigate(`/product/${product.slug || product.id}`)}
                        className="w-full sm:w-48 aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-[var(--bg-primary)] shrink-0 cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      <div className="flex-1 space-y-2 text-center sm:text-right">
                        <div className="flex items-center justify-center sm:justify-between text-xs text-[var(--text-secondary)]">
                          <span className="font-semibold text-[#CD78B3]">{product.category}</span>
                          {product.sku && <span className="font-mono hidden sm:inline">{product.sku}</span>}
                        </div>

                        <h3
                          onClick={() => navigate(`/product/${product.slug || product.id}`)}
                          className="text-base font-bold text-[var(--text-primary)] hover:text-[#CD78B3] transition-colors cursor-pointer"
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                          {product.shortDescription || product.description}
                        </p>
                      </div>

                      <div className="w-full sm:w-56 shrink-0 pt-4 sm:pt-0 sm:border-r border-[var(--border)] sm:pr-6 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-xs text-[var(--text-secondary)]">قیمت هر کیلوگرم:</div>
                          <div className="text-xl font-black text-[#CD78B3]">
                            {formatPersianNumber(effectivePrice)} تومان
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setQuickProduct(product)}
                            className="flex-1 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-card-alt)] cursor-pointer"
                          >
                            استعلام
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/product/${product.slug || product.id}`)}
                            className="flex-1 py-2 rounded-xl bg-[#124A57] text-white text-xs font-semibold hover:bg-[#185e6f] cursor-pointer"
                          >
                            مشاهده
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#124A57] text-white shadow-md shadow-[#124A57]/20"
                        : "bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                    }`}
                  >
                    {toPersianDigits(pageNum)}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick Inquiry Modal */}
      {quickProduct && (
        <ProductDetailModal
          product={quickProduct}
          onClose={() => setQuickProduct(null)}
        />
      )}
    </div>
  );
};
