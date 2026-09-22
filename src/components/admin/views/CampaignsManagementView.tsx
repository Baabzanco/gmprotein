import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { showToast } from "../ui/AdminToast";
import { Flame, Plus, RefreshCw, Calendar, Tag } from "lucide-react";

export const CampaignsManagementView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("جشنواره فصلی");
  const [highlightDiscount, setHighlightDiscount] = useState("۱۵٪ تخفیف");
  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      showToast("خطا در بارگذاری کمپین‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("لطفاً عنوان کمپین را وارد کنید.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createCampaign({
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: description.trim(),
        badge: badge.trim(),
        highlightDiscount: highlightDiscount.trim(),
        bannerUrl: bannerUrl.trim(),
        isActive: true,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      });

      showToast("کمپین فصلی با موفقیت راه‌اندازی شد.", "success");
      setIsModalOpen(false);
      setName("");
      setDescription("");
      fetchCampaigns();
    } catch (err: any) {
      showToast(err.message || "خطا در ایجاد کمپین", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#CD78B3]" />
            <span>کمپین‌ها و پیشنهادهای فصلی</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جشنواره‌های ویژه هتل‌ها و رستوران‌ها و پیشنهادهای دارای تخفیف ویژه
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchCampaigns}
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
            کمپین فصلی جدید
          </AdminButton>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => (
          <AdminCard key={c.id} className="overflow-hidden">
            {c.bannerUrl && (
              <div className="h-44 -mx-6 -mt-6 mb-4 relative overflow-hidden bg-slate-900">
                <img
                  src={c.bannerUrl}
                  alt={c.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <AdminBadge variant="brand" size="sm">
                    {c.badge || "جشنواره"}
                  </AdminBadge>
                  {c.highlightDiscount && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#CD78B3] text-white">
                      {c.highlightDiscount}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {c.name}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  /{c.slug}
                </span>
              </div>
              <AdminBadge variant={c.isActive ? "success" : "neutral"} size="sm" dot>
                {c.isActive ? "در حال اجرا" : "پایان یافته"}
              </AdminBadge>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {c.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#124A57]" />
                <span>مدت اعتبار: ۶۰ روز</span>
              </span>
              <span className="text-[#124A57] dark:text-teal-400 font-bold">
                فعال در صفحه اصلی
              </span>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Create Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تعریف کمپین فصلی جدید"
        description="مشخصات و بنر جشنواره را برای نمایش در صفحه فرود و بخش پیشنهادهای فصلی تعیین کنید."
        maxWidth="lg"
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
              ایجاد کمپین
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان کمپین *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: جشنواره تابستانه استیک تاماهاوک"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                برچسب نشان (Badge)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="فروش ویژه فصل"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                برچسب تخفیف ویژه
              </label>
              <input
                type="text"
                value={highlightDiscount}
                onChange={(e) => setHighlightDiscount(e.target.value)}
                placeholder="۲۰٪ تخفیف"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              آدرس اینترنتی تصویر بنر (Banner Image URL)
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات و پیشنهاد ارزش برای مشتریان عمده
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحاتی پیرامون تخفیف ویژه رستوران‌ها، بسته‌بندی خلأ و تحویل رایگان سردخانه‌ای..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
