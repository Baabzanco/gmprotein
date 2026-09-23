import React, { useState, useEffect, useMemo } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import { toPersianDigits, formatPrice } from "../../../utils/formatters";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Check,
  RefreshCw,
  AlertTriangle,
  Coins,
  CheckSquare,
  Square,
  ArrowUpDown,
  Eye,
} from "lucide-react";

export const PriceManagementView: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bulk Adjustment Configuration
  const [adjustmentType, setAdjustmentType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [targetCategory, setTargetCategory] = useState<string>("ALL");
  const [percentageChange, setPercentageChange] = useState<number>(5);
  const [fixedAmountChange, setFixedAmountChange] = useState<number>(50000);
  const [roundToNearest, setRoundToNearest] = useState<number>(1000);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Dialog & preview state
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  // Inline single edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [isSavingInline, setIsSavingInline] = useState(false);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      // Reset selected products
      setSelectedProductIds([]);
    } catch {
      showToast("خطا در بارگذاری قیمت‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Filtered by category
  const filteredProducts = useMemo(() => {
    if (targetCategory === "ALL") return products;
    return products.filter((p) => p.categoryId === targetCategory);
  }, [products, targetCategory]);

  // Actual target items for bulk update: either explicitly checked or all in filtered view if none individually selected
  const activeTargets = useMemo(() => {
    if (selectedProductIds.length > 0) {
      return products.filter((p) => selectedProductIds.includes(p.id));
    }
    return filteredProducts;
  }, [selectedProductIds, products, filteredProducts]);

  // Calculate new price for a given product
  const calculateNewPrice = (currentPrice: number): number => {
    let projected = currentPrice;
    if (adjustmentType === "PERCENTAGE") {
      projected = currentPrice * (1 + percentageChange / 100);
    } else {
      projected = currentPrice + fixedAmountChange;
    }

    if (roundToNearest > 0) {
      projected = Math.round(projected / roundToNearest) * roundToNearest;
    } else {
      projected = Math.round(projected);
    }

    return Math.max(1000, projected);
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyBulkPrices = async () => {
    if (activeTargets.length === 0) {
      showToast("هیچ محصولی برای تغییر قیمت انتخاب نشده است.", "warning");
      return;
    }

    setIsApplyingBulk(true);
    try {
      const ids = activeTargets.map((p) => p.id);
      const val = adjustmentType === "PERCENTAGE" ? percentageChange : fixedAmountChange;

      await adminService.bulkUpdatePrices({
        type: adjustmentType,
        value: val,
        productIds: ids,
        roundToNearest,
      });

      showToast(
        `قیمت ${toPersianDigits(ids.length)} کالا با موفقیت به‌روزرسانی گردید.`,
        "success"
      );
      setShowBulkConfirm(false);
      fetchPrices();
    } catch (err: any) {
      showToast(err.message || "خطا در اعمال تغییرات قیمت", "error");
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const handleStartInlineEdit = (p: any) => {
    setEditingId(p.id);
    setTempPrice(p.basePrice);
  };

  const handleSaveInlinePrice = async (id: string) => {
    setIsSavingInline(true);
    try {
      await adminService.updateProduct(id, { basePrice: Number(tempPrice) });
      showToast("قیمت با موفقیت ویرایش شد.", "success");
      setEditingId(null);
      fetchPrices();
    } catch (err: any) {
      showToast(err.message || "خطا در ویرایش قیمت", "error");
    } finally {
      setIsSavingInline(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت قیمت‌ها و تغییرات دسته‌ای (Bulk Pricing)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            امکان اعمال نوسانات درصدی یا مبالغ ثابت ریالی به تفکیک دسته‌بندی یا کالاهای انتخابی با پیش‌نمایش آنی
          </p>
        </div>

        <AdminButton
          variant="outline"
          size="sm"
          onClick={fetchPrices}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          تازه‌سازی
        </AdminButton>
      </div>

      {/* Bulk Price Adjustment Card */}
      <AdminCard
        title="تنظیمات تغییر گروهی قیمت‌ها"
        subtitle="نرخ روز کشتارگاه و نوسانات هفتگی بازار گوشت را اعمال کنید"
        className="border-[#124A57]/30 dark:border-teal-500/30 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          {/* 1. Mode Selector */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              نوع محاسبه تغییر قیمت
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setAdjustmentType("PERCENTAGE")}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  adjustmentType === "PERCENTAGE"
                    ? "bg-[#124A57] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>درصدی (٪)</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("FIXED_AMOUNT")}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  adjustmentType === "FIXED_AMOUNT"
                    ? "bg-[#124A57] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>مبلغ ثابت (تومان)</span>
              </button>
            </div>
          </div>

          {/* 2. Target Category */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              دسته‌بندی هدف
            </label>
            <select
              value={targetCategory}
              onChange={(e) => {
                setTargetCategory(e.target.value);
                setSelectedProductIds([]);
              }}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="ALL">تمامی دسته‌ها ({toPersianDigits(products.length)} کالا)</option>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({toPersianDigits(count)} کالا)
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Value Input */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {adjustmentType === "PERCENTAGE"
                ? "میزان تغییر درصدی (+ افزایش / - کاهش)"
                : "میزان تغییر مبلغ (+ افزایش / - کاهش به تومان)"}
            </label>
            {adjustmentType === "PERCENTAGE" ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={percentageChange}
                  onChange={(e) => setPercentageChange(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
                />
                <div className="flex items-center gap-1">
                  {[-10, -5, +5, +10, +15, +20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPercentageChange(preset)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                        percentageChange === preset
                          ? "bg-[#124A57] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {preset > 0 ? `+${preset}٪` : `${preset}٪`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="5000"
                  value={fixedAmountChange}
                  onChange={(e) => setFixedAmountChange(Number(e.target.value))}
                  className="w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
                />
                <div className="flex items-center gap-1">
                  {[-50000, -20000, +20000, +50000, +100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFixedAmountChange(preset)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
                        fixedAmountChange === preset
                          ? "bg-[#124A57] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {preset > 0 ? `+${preset / 1000}k` : `${preset / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Button */}
          <div className="lg:col-span-2">
            <AdminButton
              variant="primary"
              className="w-full"
              onClick={() => setShowBulkConfirm(true)}
              disabled={activeTargets.length === 0}
              icon={<TrendingUp className="w-4 h-4" />}
            >
              پیش‌نمایش و اعمال
            </AdminButton>
          </div>
        </div>

        {/* Rounding & Selection Banner */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">گرد کردن ارقام نهایی:</span>
            <div className="flex items-center gap-1.5">
              {[
                { val: 0, label: "دقیق (بدون رند)" },
                { val: 1000, label: "۱,۰۰۰ تومان" },
                { val: 5000, label: "۵,۰۰۰ تومان" },
                { val: 10000, label: "۱۰,۰۰۰ تومان" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setRoundToNearest(item.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    roundToNearest === item.val
                      ? "bg-[#124A57] text-white font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>{toPersianDigits(activeTargets.length)} کالا</strong> مشمول تغییر
              {selectedProductIds.length > 0 ? " (انتخاب دستی)" : " (کل دسته)"} خواهند شد.
            </span>
          </div>
        </div>
      </AdminCard>

      {/* Prices List & Live Simulation Table */}
      <AdminCard
        title="فهرست و شبیه‌سازی آنی تغییر قیمت‌ها"
        subtitle="برای انتخاب تکی کالاها جهت تغییر دسته‌ای، چک‌باکس‌ها را انتخاب کنید."
        action={
          <AdminButton variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedProductIds.length === filteredProducts.length
              ? "لغو انتخاب همه"
              : "انتخاب همه این دسته"}
          </AdminButton>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 pr-2 font-semibold w-8">
                  <span className="sr-only">انتخاب</span>
                </th>
                <th className="pb-3 font-semibold">محصول</th>
                <th className="pb-3 font-semibold">دسته‌بندی</th>
                <th className="pb-3 font-semibold">کد کاتالوگ (SKU)</th>
                <th className="pb-3 font-semibold">قیمت فعلی (تومان)</th>
                <th className="pb-3 font-semibold">
                  قیمت پیش‌بینی شده (
                  {adjustmentType === "PERCENTAGE"
                    ? `${percentageChange > 0 ? "+" : ""}${toPersianDigits(percentageChange)}٪`
                    : `${fixedAmountChange > 0 ? "+" : ""}${formatPrice(fixedAmountChange)}`
                  })
                </th>
                <th className="pb-3 font-semibold">تفاضل نرخ</th>
                <th className="pb-3 font-semibold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const categoryName =
                  categories.find((c) => c.id === p.categoryId)?.name || "عمومی";
                const isSelected = selectedProductIds.includes(p.id);
                const isIncludedInBatch = activeTargets.some((t) => t.id === p.id);

                const simulatedNewPrice = isIncludedInBatch
                  ? calculateNewPrice(p.basePrice)
                  : p.basePrice;
                const diff = simulatedNewPrice - p.basePrice;

                const isEditingThis = editingId === p.id;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                      isSelected ? "bg-[#124A57]/5 dark:bg-teal-950/20" : ""
                    }`}
                  >
                    <td className="py-3 pr-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectProduct(p.id)}
                        className="text-slate-400 hover:text-[#124A57] cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#124A57] dark:text-teal-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </td>

                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {categoryName}
                    </td>

                    <td className="py-3 font-mono text-slate-500 text-[11px]">
                      {p.sku}
                    </td>

                    <td className="py-3">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="1000"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-28 bg-white dark:bg-slate-800 border border-[#124A57] rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-bold"
                          />
                          <button
                            onClick={() => handleSaveInlinePrice(p.id)}
                            disabled={isSavingInline}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="ذخیره"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => handleStartInlineEdit(p)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#124A57] dark:hover:text-teal-400 cursor-pointer underline decoration-dotted"
                          title="کلیک برای ویرایش قیمت"
                        >
                          {formatPrice(p.basePrice)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 font-bold text-[#124A57] dark:text-teal-400 font-mono">
                      {isIncludedInBatch ? (
                        <span>{formatPrice(simulatedNewPrice)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3">
                      {isIncludedInBatch && diff !== 0 ? (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            diff > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {diff > 0 ? "+" : ""}
                          {formatPrice(diff)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">بدون تغییر</span>
                      )}
                    </td>

                    <td className="py-3 text-left">
                      {!isEditingThis && (
                        <button
                          onClick={() => handleStartInlineEdit(p)}
                          className="text-xs text-[#124A57] dark:text-teal-400 hover:underline px-2 py-1 rounded bg-[#124A57]/10 cursor-pointer"
                        >
                          تغییر دستی
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Confirmation Dialog for Bulk Prices */}
      <AdminConfirmDialog
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleApplyBulkPrices}
        title="تأیید به‌روزرسانی دسته‌ای قیمت‌ها"
        message={`آیا از اعمال تغییر ${
          adjustmentType === "PERCENTAGE"
            ? `${percentageChange > 0 ? "+" : ""}${toPersianDigits(percentageChange)}٪`
            : `${fixedAmountChange > 0 ? "+" : ""}${formatPrice(fixedAmountChange)}`
        } بر روی ${toPersianDigits(activeTargets.length)} محصول انتخابی اطمینان دارید؟ تمامی ارقام در ردپای امنیتی (Audit Trail) ثبت خواهند شد.`}
        confirmLabel="اعمال نهایی قیمت‌ها"
        cancelLabel="انصراف"
        isLoading={isApplyingBulk}
      />
    </div>
  );
};
