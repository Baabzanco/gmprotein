import React, { useState } from "react";
import { Product } from "../../types";
import { quotationService } from "../../services";
import { X, CheckCircle, Scale, Package, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  // Local state for Quotation calculation
  const [selectedWeightKg, setSelectedWeightKg] = useState<number>(2);
  const [packageCount, setPackageCount] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Price calculations
  const unitPrice = product.pricePerKg || 0;
  const effectivePricePerKg = product.discount
    ? unitPrice * (1 - product.discount / 100)
    : unitPrice;
  const totalEstimatedAmount = Math.round(effectivePricePerKg * selectedWeightKg * packageCount);

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await quotationService.submitRequest({
        productId: product.id,
        productName: product.name,
        weightKg: selectedWeightKg,
        quantityPackages: packageCount,
        customerName,
        phone,
        companyName,
        notes,
      });

      setSubmitSuccess(true);
      setSuccessMessage(response.message);
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ثبت درخواست. لطفاً دوباره تلاش نمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-4xl bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl text-[var(--text-primary)] flex flex-col md:flex-row my-8 max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="بستن پنجره"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-[var(--surface-card-alt)] hover:bg-[var(--badge-bg)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left/Top: Product Media & Information */}
        <div className="md:w-5/12 bg-[var(--surface-card-alt)] flex flex-col justify-between border-b md:border-b-0 md:border-l border-[var(--border)]">
          <div className="relative aspect-square overflow-hidden bg-black/10">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.discount && (
              <span className="absolute top-4 right-4 bg-[#CD78B3] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {product.discount}٪ تخفیف فصلی
              </span>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div>
              <span className="text-xs font-mono text-[#CD78B3] uppercase tracking-wider block mb-1">
                {product.category}
              </span>
              <h3 id="modal-product-title" className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                {product.name}
              </h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
              {product.description}
            </p>

            {product.cutType && (
              <div className="text-xs text-[var(--text-muted)] space-y-1 border-t border-[var(--border)] pt-3">
                <div className="flex justify-between">
                  <span>نوع قطعه:</span>
                  <span className="text-[var(--text-primary)] font-medium">{product.cutType}</span>
                </div>
                {product.origin && (
                  <div className="flex justify-between">
                    <span>خاستگاه گوشت:</span>
                    <span className="text-[var(--text-primary)] font-medium">{product.origin}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right/Bottom: Quotation Form / B2B Estimator */}
        <div className="md:w-7/12 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          {!submitSuccess ? (
            <form onSubmit={handleSubmitQuotation} className="space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-[#CD78B3] font-medium mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>سامانه رسمی استعلام بها و پیش‌فاکتور</span>
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">
                  تنظیم مقادیر و صدور پیش‌فاکتور
                </h4>
              </div>

              {/* Weight Selector */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                  وزن تقریبی هر بسته (کیلوگرم):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 5, 10].map((w) => (
                    <button
                      type="button"
                      key={w}
                      onClick={() => setSelectedWeightKg(w)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                        selectedWeightKg === w
                          ? "bg-[#124A57] border-[#CD78B3] text-white shadow-md shadow-[#CD78B3]/20"
                          : "bg-[var(--surface-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[#124A57]"
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{w} کیلو</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Packages */}
              <div className="flex items-center justify-between bg-[var(--surface-card)] p-3.5 rounded-2xl border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#CD78B3]" />
                  <span className="text-xs text-[var(--text-secondary)]">تعداد بسته‌ها:</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPackageCount(Math.max(1, packageCount - 1))}
                    className="w-8 h-8 rounded-lg bg-[#124A57] text-white font-bold flex items-center justify-center hover:bg-[#185362] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-[var(--text-primary)] text-sm w-6 text-center">
                    {packageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPackageCount(packageCount + 1)}
                    className="w-8 h-8 rounded-lg bg-[#124A57] text-white font-bold flex items-center justify-center hover:bg-[#185362] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Estimation Summary */}
              {product.pricePerKg ? (
                <div className="p-4 rounded-2xl bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">مبلغ برآوردی پیش‌فاکتور:</span>
                    <span className="text-[var(--text-primary)] text-base font-extrabold font-mono">
                      {totalEstimatedAmount.toLocaleString("fa-IR")}
                    </span>{" "}
                    <span className="text-[var(--text-secondary)]">تومان</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    مجموع وزن: {selectedWeightKg * packageCount} کیلوگرم
                  </span>
                </div>
              ) : null}

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: علیرضا رضایی"
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                    شماره تماس مستقیم *
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912xxxxxxx"
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3] text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                  نام سازمان یا رستوران (اختیاری)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: رستوران باربیکیو ماهان"
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                  توضیحات یا نوع برش خاص (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: لطفاً ضخامت استیک‌ها دقیقا ۲ سانتی‌متر باشد."
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3] resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#CD78B3] hover:bg-[#b8619e] text-white font-bold text-sm transition-all shadow-lg shadow-[#CD78B3]/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>در حال ثبت استعلام...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>ثبت نهایی درخواست پیش‌فاکتور</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-500 mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[var(--text-primary)]">
                درخواست شما با موفقیت دریافت شد
              </h4>
              <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
                {successMessage}
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#124A57] hover:bg-[#1a5b6a] text-white text-xs font-semibold cursor-pointer"
              >
                بازگشت به کاتالوگ فروشگاه
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
