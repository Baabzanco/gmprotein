import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { showToast } from "../ui/AdminToast";
import { Tag, Plus, RefreshCw, Copy, Check } from "lucide-react";

export const DiscountsManagementView: React.FC = () => {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(10000000);
  const [maxDiscount, setMaxDiscount] = useState<number>(2000000);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDiscounts();
      setDiscounts(data || []);
    } catch (err) {
      showToast("خطا در بارگذاری تخفیف‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast("لطفاً عنوان و کد تخفیف را وارد کنید.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createDiscount({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrderAmount: Number(minOrderAmount) || null,
        maxDiscount: type === "PERCENTAGE" ? Number(maxDiscount) || null : null,
        isActive: true,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      showToast("کد تخفیف با موفقیت ایجاد گردید.", "success");
      setIsModalOpen(false);
      setName("");
      setCode("");
      fetchDiscounts();
    } catch (err: any) {
      showToast(err.message || "خطا در ایجاد تخفیف", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`کد «${text}» کپی شد.`, "info");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت کوپن‌ها و کدهای تخفیف</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعریف جشنواره‌های تخفیف، بن‌های سازمانی و کدهای تخفیف اولین سفارش
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchDiscounts}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            تازه‌سازی
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            ایجاد کد تخفیف جدید
          </AdminButton>
        </div>
      </div>

      {/* Discounts Table */}
      <AdminCard
        title="کدهای تخفیف فعال و آرشیو"
        subtitle="فهرست بن‌ها و درصد تخفیف اعمالی روی پیش‌فاکتورها"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">عنوان طرح</th>
                <th className="pb-3 font-semibold">کد تخفیف</th>
                <th className="pb-3 font-semibold">نوع و مقدار</th>
                <th className="pb-3 font-semibold">حداقل خرید</th>
                <th className="pb-3 font-semibold">حداکثر سقف تخفیف</th>
                <th className="pb-3 font-semibold">تعداد دفعات مصرف</th>
                <th className="pb-3 font-semibold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                    {d.name}
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => copyToClipboard(d.code)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-[#124A57] dark:text-teal-400 hover:bg-slate-200"
                      title="کلیک برای کپی"
                    >
                      <span>{d.code}</span>
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </td>

                  <td className="py-3 font-semibold">
                    {d.type === "PERCENTAGE" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {d.value}٪ درصدی
                      </span>
                    ) : (
                      <span className="text-sky-600 dark:text-sky-400">
                        {Number(d.value).toLocaleString("fa-IR")} تومان ثابت
                      </span>
                    )}
                  </td>

                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    {d.minOrderAmount
                      ? `${Number(d.minOrderAmount).toLocaleString("fa-IR")} تومان`
                      : "بدون شرط"}
                  </td>

                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    {d.maxDiscount
                      ? `${Number(d.maxDiscount).toLocaleString("fa-IR")} تومان`
                      : "نامحدود"}
                  </td>

                  <td className="py-3 font-mono text-slate-500 dark:text-slate-400">
                    {d.usageCount ?? 0} مرتبه
                  </td>

                  <td className="py-3">
                    <AdminBadge variant={d.isActive ? "success" : "neutral"} size="sm" dot>
                      {d.isActive ? "فعال" : "منقضی"}
                    </AdminBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Create Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تعریف کد تخفیف جدید"
        description="شرایط تخفیف، درصد یا مبلغ ثابت و حداقل سبد خرید را تعیین نمایید."
        maxWidth="md"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              انصراف
            </AdminButton>
            <AdminButton variant="primary" onClick={handleCreate} isLoading={isSubmitting}>
              ایجاد تخفیف
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان فارسی طرح تخفیف *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: تخفیف ویژه نوروزی رستوران‌ها"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                کد تخفیف (لاتین) *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="NOWRUZ2026"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع تخفیف
              </label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              >
                <option value="PERCENTAGE">درصدی (٪)</option>
                <option value="FIXED_AMOUNT">مبلغ ثابت (تومان)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                مقدار تخفیف {type === "PERCENTAGE" ? "(درصد)" : "(تومان)"} *
              </label>
              <input
                type="number"
                min="1"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                حداقل سفارش (تومان)
              </label>
              <input
                type="number"
                step="500000"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          {type === "PERCENTAGE" && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                سقف حداکثر تخفیف (تومان)
              </label>
              <input
                type="number"
                step="100000"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          )}
        </form>
      </AdminModal>
    </div>
  );
};
