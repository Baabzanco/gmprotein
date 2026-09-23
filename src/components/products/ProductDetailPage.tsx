import React, { useState, useEffect } from "react";
import { Product } from "../../types";
import { productService, quotationService } from "../../services";
import { formatPersianNumber, toPersianDigits } from "../../utils/formatters";
import { useRouter } from "../../context/RouterContext";
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  Scale,
  Package,
  Sparkles,
  Share2,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Flame,
  Thermometer,
  Layers,
  Award
} from "lucide-react";

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Active Image
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Packaging and quotation state
  const [selectedWeightKg, setSelectedWeightKg] = useState<number>(10);
  const [isCustomWeightMode, setIsCustomWeightMode] = useState<boolean>(false);
  const [customWeightInput, setCustomWeightInput] = useState<number>(10);
  const [selectedPackageLabel, setSelectedPackageLabel] = useState<string>("");
  const [packageCount, setPackageCount] = useState<number>(1);

  // Form state
  const [customerName, setCustomerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    productService
      .getProductBySlug(slug)
      .then((prod) => {
        if (!prod) {
          setError("محصول مورد نظر یافت نشد.");
          setLoading(false);
          return;
        }
        setProduct(prod);

        // Set default package
        const def = prod.packageOptions?.find((opt) => opt.isDefault) || prod.packageOptions?.[0];
        const initialWeight = def ? def.weightKg : prod.minimumOrder || 2;
        setSelectedWeightKg(initialWeight);
        setCustomWeightInput(initialWeight);
        setSelectedPackageLabel(def ? def.label : `بسته ${toPersianDigits(initialWeight)} کیلوگرمی`);

        // Fetch related products
        productService.getProducts({ category: prod.category }).then((all) => {
          setRelatedProducts(all.filter((p) => p.id !== prod.id).slice(0, 4));
        });

        setLoading(false);
      })
      .catch((err) => {
        setError("خطا در بارگذاری اطلاعات محصول");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#CD78B3]/20 border-t-[#CD78B3] rounded-full animate-spin"></div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">در حال دریافت اطلاعات محصول ممتاز...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] max-w-lg mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#CD78B3] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">محصول یافت نشد</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{error || "ممکن است این محصول حذف یا تغییر نام یافته باشد."}</p>
          <button
            onClick={() => navigate("/store")}
            className="px-6 py-3 rounded-2xl bg-[#124A57] text-white text-sm font-semibold hover:bg-[#185e6f] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فروشگاه</span>
          </button>
        </div>
      </div>
    );
  }

  // Price calculations
  const unitPrice = product.pricePerKg || 0;
  const effectivePricePerKg = product.discount
    ? unitPrice * (1 - product.discount / 100)
    : unitPrice;
  const activeWeight = isCustomWeightMode ? customWeightInput : selectedWeightKg;
  const totalEstimatedAmount = Math.round(effectivePricePerKg * activeWeight * packageCount);

  const imagesList = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : [product.image];

  const handleSelectPackage = (weightKg: number, label: string) => {
    setIsCustomWeightMode(false);
    setSelectedWeightKg(weightKg);
    setSelectedPackageLabel(label);
  };

  const handleCustomWeightChange = (val: number) => {
    const validVal = Math.max(0.5, val);
    setCustomWeightInput(validVal);
    setSelectedPackageLabel(`وزن دلخواه: ${toPersianDigits(validVal)} کیلوگرم`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      if (!customerName.trim()) throw new Error("نام و نام خانوادگی را وارد کنید.");
      if (!phone.trim() || !/^09\d{9}$/.test(phone.trim())) {
        throw new Error("شماره همراه معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)");
      }

      await quotationService.submitRequest({
        productId: product.id,
        productName: product.name,
        weightKg: activeWeight,
        quantityPackages: packageCount,
        customerName: customerName.trim(),
        phone: phone.trim(),
        companyName: companyName.trim() || undefined,
        notes: notes.trim()
          ? `${notes.trim()} | بسته انتخابی: ${selectedPackageLabel}`
          : `بسته انتخابی: ${selectedPackageLabel}`,
      });

      setSubmitSuccess(true);
      setSuccessMessage(
        "درخواست پیش‌فاکتور شما با موفقیت ثبت گردید. کارشناس بازرگانی ظرف کمتر از ۳۰ دقیقه جهت هماهنگی با شما تماس خواهد گرفت."
      );
    } catch (err: any) {
      setFormError(err.message || "خطا در ثبت پیش‌فاکتور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-8 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            صفحه اصلی
          </button>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-60" />
          <button
            onClick={() => navigate("/store")}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            فروشگاه اینترنتی
          </button>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-60" />
          <span className="text-[var(--text-primary)] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Grid: Gallery & Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Gallery (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface-card)] shadow-md group">
              <img
                src={imagesList[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.discount && product.discount > 0 && (
                <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-[#CD78B3] text-white text-xs font-bold shadow-lg shadow-[#CD78B3]/30">
                  {toPersianDigits(product.discount)}٪ تخفیف ویژه
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#124A57] text-white text-xs font-medium flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#CD78B3]" />
                  <span>محصول منتخب</span>
                </div>
              )}
            </div>

            {/* Thumbnails if multiple */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-[#CD78B3] ring-2 ring-[#CD78B3]/20 scale-95"
                        : "border-[var(--border)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality & Assurance Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#CD78B3] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-[var(--text-primary)]">گواهی دامپزشکی</div>
                  <div className="text-[var(--text-secondary)] text-[11px]">نظارت کامل بهداشتی</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#CD78B3] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-[var(--text-primary)]">ناوگان مجهز برودتی</div>
                  <div className="text-[var(--text-secondary)] text-[11px]">زنجیره سرد ۰ تا ۴ درجه</div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details & Ordering Section (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header / Titles */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--badge-bg)] text-[#CD78B3] border border-[var(--badge-border)]">
                    {product.category}
                  </span>
                  {product.sku && (
                    <span className="text-xs text-[var(--text-secondary)] font-mono">
                      کد: {product.sku}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? "لینک کپی شد!" : "اشتراک‌گذاری"}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-4">
                  {product.shortDescription}
                </p>
              )}

              {/* Price Banner */}
              <div className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] flex items-center justify-between flex-wrap gap-4 shadow-xs">
                <div>
                  <div className="text-xs text-[var(--text-secondary)] mb-1">قیمت پایه هر کیلوگرم:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#CD78B3]">
                      {formatPersianNumber(effectivePricePerKg)}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-semibold">تومان / کیلوگرم</span>
                  </div>
                </div>

                {product.discount && product.discount > 0 && (
                  <div className="text-left">
                    <div className="text-xs text-[var(--text-secondary)] line-through">
                      {formatPersianNumber(unitPrice)} تومان
                    </div>
                    <div className="text-xs font-bold text-emerald-500">
                      سود شما: {formatPersianNumber(unitPrice - effectivePricePerKg)} تومان در هر کیلو
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Packaging Options Selector */}
            <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <Package className="w-4 h-4 text-[#CD78B3]" />
                  <span>انتخاب بسته‌بندی و وزن:</span>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">
                  حداقل سفارش: {toPersianDigits(product.minimumOrder || 1)} کیلوگرم
                </span>
              </div>

              {/* Package Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.packageOptions && product.packageOptions.length > 0 ? (
                  product.packageOptions.map((opt) => {
                    const isSelected = !isCustomWeightMode && selectedWeightKg === opt.weightKg;
                    return (
                      <button
                        key={opt.id || opt.weightKg}
                        type="button"
                        onClick={() => handleSelectPackage(opt.weightKg, opt.label)}
                        className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-[#124A57] text-white border-[#124A57] shadow-md shadow-[#124A57]/20"
                            : "bg-[var(--bg-primary)] hover:bg-[var(--surface-card-alt)] text-[var(--text-primary)] border-[var(--border)]"
                        }`}
                      >
                        <div className="text-xs font-bold mb-1">{opt.label}</div>
                        <div className={`text-xs ${isSelected ? "text-white/80" : "text-[var(--text-secondary)]"}`}>
                          وزن: {toPersianDigits(opt.weightKg)} کیلوگرم
                        </div>
                        {opt.isDefault && (
                          <span className={`absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded-md ${
                            isSelected ? "bg-white/20 text-white" : "bg-[#CD78B3]/10 text-[#CD78B3]"
                          }`}>
                            پیشنهادی
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectPackage(10, "بسته ۱۰ کیلوگرمی استاندارد")}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      !isCustomWeightMode
                        ? "bg-[#124A57] text-white border-[#124A57]"
                        : "bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border)]"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">بسته استاندارد رستورانی</div>
                    <div className="text-xs text-[var(--text-secondary)]">وزن: ۱۰ کیلوگرم</div>
                  </button>
                )}
              </div>

              {/* Custom Weight Option */}
              {product.allowCustomWeight && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#CD78B3]" />
                      <span>یا وزن سفارشی خود را تعیین کنید:</span>
                    </label>
                    <span className="text-xs font-bold text-[#CD78B3]">
                      {toPersianDigits(activeWeight)} کیلوگرم
                    </span>
                  </div>
                  <input
                    type="range"
                    min={product.minimumOrder || 1}
                    max={100}
                    step={1}
                    value={activeWeight}
                    onChange={(e) => {
                      setIsCustomWeightMode(true);
                      handleCustomWeightChange(Number(e.target.value));
                    }}
                    className="w-full accent-[#CD78B3] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
                    <span>{toPersianDigits(product.minimumOrder || 1)} کیلوگرم</span>
                    <span>۵۰ کیلوگرم</span>
                    <span>۱۰۰ کیلوگرم</span>
                  </div>
                </div>
              )}

              {/* Summary of Price Estimation */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-[var(--text-secondary)]">
                  تخمین مبلغ پیش‌فاکتور ({toPersianDigits(activeWeight * packageCount)} کیلوگرم):
                </div>
                <div className="text-base font-black text-[var(--text-primary)]">
                  {formatPersianNumber(totalEstimatedAmount)} تومان
                </div>
              </div>
            </div>

            {/* Quotation Inquiry Form */}
            <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xs">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#CD78B3]" />
                <span>ثبت درخواست استعلام و صدور پیش‌فاکتور</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-5">
                بدون نیاز به پرداخت آنلاین — همکاران ما برای نهایی‌سازی هماهنگ خواهند شد.
              </p>

              {submitSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>درخواست شما با موفقیت ثبت شد</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-300/90">{successMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setCustomerName("");
                      setPhone("");
                      setCompanyName("");
                      setNotes("");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    ثبت استعلام جدید برای این محصول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuotation} className="space-y-4">
                  {formError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        نام و نام خانوادگی <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: علی رضایی"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#CD78B3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        شماره تماس همراه <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#CD78B3] text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        نام مجموعه / رستوران (اختیاری)
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="مثال: رستوران البرز"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#CD78B3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        تعداد بسته‌ها
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPackageCount(Math.max(1, packageCount - 1))}
                          className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] hover:border-[#CD78B3] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-bold text-sm text-[var(--text-primary)]">
                          {toPersianDigits(packageCount)} بسته
                        </span>
                        <button
                          type="button"
                          onClick={() => setPackageCount(packageCount + 1)}
                          className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] hover:border-[#CD78B3] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      یادداشت یا توضیحات سفارشی (ضخامت برش، زمان تحویل و ...)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="در صورت نیاز به برش خاص یا تحویل در ساعات معین، اینجا قید فرمایید..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#CD78B3]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-[#124A57] hover:bg-[#185e6f] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#124A57]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>ثبت استعلام پیش‌فاکتور رسمی</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Structured Product Features & Specifications */}
        <div className="mt-16 space-y-8">
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#CD78B3]" />
              <span>مشخصات فنی و ویژگی‌های تخصصی محصول</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features Table */}
            <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#CD78B3]" />
                <span>شناسنامه کیفی و فنی</span>
              </h3>

              {product.features && product.features.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {product.features.map((feat, idx) => (
                    <div key={feat.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <span className="font-semibold text-[var(--text-secondary)]">{feat.name}:</span>
                      <span className="font-bold text-[var(--text-primary)] text-left">{feat.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                  <div className="py-2 flex justify-between border-b border-[var(--border)]">
                    <span>دسته‌بندی:</span>
                    <span className="font-bold text-[var(--text-primary)]">{product.category}</span>
                  </div>
                  <div className="py-2 flex justify-between border-b border-[var(--border)]">
                    <span>واحد عرضه:</span>
                    <span className="font-bold text-[var(--text-primary)]">{product.unit || "کیلوگرم"}</span>
                  </div>
                  <div className="py-2 flex justify-between border-b border-[var(--border)]">
                    <span>شرایط نگهداری:</span>
                    <span className="font-bold text-[var(--text-primary)]">دمای ۰ الی ۴ درجه سانتی‌گراد</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description & Advice */}
            <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#CD78B3]" />
                <span>توضیحات و راهنمای سرآشپز</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {product.description || "این برش از تازه‌ترین و ممتازترین گوشت‌های تحت نظارت زنجیره تأمین پروتئین گلمحمدی تهیه شده و با رعایت دقیق استانداردهای بهداشتی و برودتی بسته‌بندی گردیده است."}
              </p>

              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#CD78B3]">
                  <Thermometer className="w-4 h-4" />
                  <span>توصیه زنجیره سرد و مصرف</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  جهت حفظ بافت آبدار و لطافت استیک، پیشنهاد می‌شود گوشت را ۳۰ دقیقه قبل از پخت در دمای محیط قرار دهید و از منجمد کردن مجدد پس از دیفراست خودداری فرمایید.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">محصولات مشابه و مرتبط</h3>
              <button
                onClick={() => navigate("/store")}
                className="text-xs font-semibold text-[#CD78B3] hover:underline cursor-pointer"
              >
                مشاهده همه برش‌ها
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.slug || p.id}`)}
                  className="group rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] overflow-hidden hover:border-[#CD78B3]/50 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col"
                >
                  <div className="aspect-4/3 overflow-hidden bg-[var(--bg-primary)] relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.discount && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#CD78B3] text-white text-[10px] font-bold">
                        {toPersianDigits(p.discount)}٪
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-[#CD78B3] transition-colors">
                      {p.name}
                    </h4>
                    <div className="text-xs font-black text-[#CD78B3]">
                      {formatPersianNumber(p.effectivePrice || p.pricePerKg)} تومان
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
