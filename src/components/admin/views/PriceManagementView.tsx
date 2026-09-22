import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Check,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Filter,
} from "lucide-react";

export const PriceManagementView: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bulk Adjustment State
  const [targetCategory, setTargetCategory] = useState<string>("ALL");
  const [percentageChange, setPercentageChange] = useState<number>(5);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  // Inline edit state
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
    } catch (err) {
      showToast("خطا در بارگذاری قیمت‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const targetProducts = products.filter(
    (p) => targetCategory === "ALL" || p.categoryId === targetCategory
  );

  const handleApplyBulkPrices = async () => {
    setIsApplyingBulk(true);
    try {
      const ids = targetProducts.map((p) => p.id);
      await adminService.bulkUpdatePrices(ids, percentageChange);
      showToast(
        `قیمت ${ids.length} کالا به میزان ${percentageChange > 0 ? "+" : ""}${percentageChange}٪ با موفقیت به‌روزرسانی شد.`,
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
            <span>مدیریت قیمت‌ها و تغییرات دسته‌ای</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تنظیم قیمت پایه برش‌های گوشت، اعمال درصدی نوسانات بازار و پیش‌نمایش آنی
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
        title="تغییر دسته‌ای و گروهی قیمت‌ها"
        subtitle="برای انطباق سریع با نرخ روز کشتارگاه و نوسانات هفتگی بازار گوشت"
        className="border-[#124A57]/30 dark:border-teal-500/30 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Target Category Select */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              دسته اقلام هدف
            </label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="ALL">تمامی محصولات ({products.length} کالا)</option>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count} کالا)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Percentage Input & Quick Buttons */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>درصد تغییر قیمت (مثبت: افزایش، منفی: کاهش)</span>
              <span className="font-mono text-[#124A57] dark:text-teal-400">
                {percentageChange > 0 ? `+${percentageChange}` : percentageChange}٪
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={percentageChange}
                onChange={(e) => setPercentageChange(Number(e.target.value))}
                className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1">
                {[-10, -5, +5, +10, +15].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPercentageChange(preset)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-colors ${
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
          </div>

          {/* Action Button */}
          <div className="md:col-span-3">
            <AdminButton
              variant="primary"
              className="w-full"
              onClick={() => setShowBulkConfirm(true)}
              disabled={targetProducts.length === 0 || percentageChange === 0}
              icon={<TrendingUp className="w-4 h-4" />}
            >
              محاسبه و اعمال گروهی
            </AdminButton>
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              اعمال این تغییر موجب بروزرسانی قیمت پایه <strong>{targetProducts.length} محصول</strong> به میزان <strong>{percentageChange > 0 ? "+" : ""}{percentageChange}٪</strong> خواهد شد.
            </span>
          </div>
          <span className="text-[11px] font-medium underline cursor-pointer" onClick={() => setShowBulkConfirm(true)}>
            پیش‌نمایش تأیید
          </span>
        </div>
      </AdminCard>

      {/* Prices List Table */}
      <AdminCard
        title="فهرست قیمت‌های جاری و ویرایش انفرادی"
        subtitle="برای تغییر سریع قیمت یک کالا، روی آیکون ویرایش یا قیمت کلیک کنید."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">محصول</th>
                <th className="pb-3 font-semibold">دسته‌بندی</th>
                <th className="pb-3 font-semibold">شناسه SKU</th>
                <th className="pb-3 font-semibold">قیمت فعلی (تومان)</th>
                <th className="pb-3 font-semibold">قیمت پس از تغییر دسته‌ای ({percentageChange > 0 ? `+${percentageChange}` : percentageChange}٪)</th>
                <th className="pb-3 font-semibold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => {
                const categoryName =
                  categories.find((c) => c.id === p.categoryId)?.name || "عمومی";
                const isSelectedInBulk =
                  targetCategory === "ALL" || p.categoryId === targetCategory;

                const simulatedNewPrice = isSelectedInBulk
                  ? Math.round(p.basePrice * (1 + percentageChange / 100))
                  : p.basePrice;

                const isEditingThis = editingId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </td>

                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {categoryName}
                    </td>

                    <td className="py-3 font-mono text-slate-400">
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
                            className="w-32 bg-white dark:bg-slate-800 border border-[#124A57] rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-bold"
                          />
                          <button
                            onClick={() => handleSaveInlinePrice(p.id)}
                            disabled={isSavingInline}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
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
                          {Number(p.basePrice).toLocaleString("fa-IR")}
                        </span>
                      )}
                    </td>

                    <td className="py-3 font-mono font-bold text-[#124A57] dark:text-teal-400">
                      {isSelectedInBulk ? (
                        <span>{simulatedNewPrice.toLocaleString("fa-IR")} تومان</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 text-left">
                      {!isEditingThis && (
                        <button
                          onClick={() => handleStartInlineEdit(p)}
                          className="text-xs text-[#124A57] dark:text-teal-400 hover:underline px-2 py-1 rounded bg-[#124A57]/10"
                        >
                          تغییر قیمت
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
        message={`آیا مطمئن هستید که می‌خواهید قیمت ${targetProducts.length} کالای انتخابی را به میزان ${percentageChange > 0 ? "+" : ""}${percentageChange}٪ تغییر دهید؟ این عملیات در ردپای امنیتی (Audit Trail) سیستم ثبت خواهد شد.`}
        confirmLabel="اعمال نهایی قیمت‌ها"
        cancelLabel="انصراف"
        isLoading={isApplyingBulk}
      />
    </div>
  );
};
