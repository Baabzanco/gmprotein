import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { showToast } from "../ui/AdminToast";
import { Flame, Plus, RefreshCw, Calendar, Tag, Edit, Trash2, Power } from "lucide-react";

export const CampaignsManagementView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [badge, setBadge] = useState("جشنواره فصلی");
  const [highlightDiscount, setHighlightDiscount] = useState("۲۰٪ تخفیف ویژه");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80");
  const [ctaLabel, setCtaLabel] = useState("مشاهده برش‌ها و استعلام قیمت");
  const [ctaLink, setCtaLink] = useState("#store-section");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
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

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setShortDescription("");
    setBadge("جشنواره فصلی");
    setHighlightDiscount("۲۰٪ تخفیف ویژه");
    setImage("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80");
    setCtaLabel("مشاهده برش‌ها و استعلام قیمت");
    setCtaLink("#store-section");
    setSortOrder(campaigns.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setTitle(c.title || "");
    setSlug(c.slug || "");
    setDescription(c.description || "");
    setShortDescription(c.shortDescription || "");
    setBadge(c.badge || "جشنواره");
    setHighlightDiscount(c.highlightDiscount || "");
    setImage(c.image || "");
    setCtaLabel(c.ctaLabel || "");
    setCtaLink(c.ctaLink || "");
    setSortOrder(c.sortOrder ?? 1);
    setIsActive(c.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      showToast("عنوان و اسلاگ کمپین الزامی است.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        badge: badge.trim(),
        highlightDiscount: highlightDiscount.trim(),
        image: image.trim(),
        ctaLabel: ctaLabel.trim(),
        ctaLink: ctaLink.trim(),
        sortOrder: Number(sortOrder),
        isActive,
      };

      if (editingId) {
        await adminService.updateCampaign(editingId, payload);
        showToast("کمپین با موفقیت ویرایش شد.", "success");
      } else {
        await adminService.createCampaign({
          ...payload,
          startAt: new Date().toISOString(),
          endAt: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
        showToast("کمپین جدید با موفقیت ایجاد شد.", "success");
      }

      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      showToast(err.message || "خطا در ذخیره کمپین", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await adminService.toggleCampaignStatus(id, !currentStatus);
      showToast("وضعیت کمپین تغییر کرد.", "success");
      fetchCampaigns();
    } catch (err: any) {
      showToast(err.message || "خطا در تغییر وضعیت کمپین", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این کمپین اطمینان دارید؟")) return;
    try {
      await adminService.deleteCampaign(id);
      showToast("کمپین حذف شد.", "success");
      fetchCampaigns();
    } catch (err: any) {
      showToast(err.message || "خطا در حذف کمپین", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#CD78B3]" />
            <span>مدیریت کمپین‌ها و پیشنهادهای فصلی</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مدیریت بنرها، جشنواره‌های تخفیف فصلی و اسلایدر صفحه اصلی
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
            onClick={handleOpenCreate}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            کمپین جدید
          </AdminButton>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => (
          <AdminCard key={c.id} className="overflow-hidden flex flex-col justify-between">
            <div>
              {c.image && (
                <div className="h-44 -mx-6 -mt-6 mb-4 relative overflow-hidden bg-slate-900">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-85"
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
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-black/60 text-white backdrop-blur-sm">
                      ترتیب: {c.sortOrder}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {c.title}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    /{c.slug}
                  </span>
                </div>
                <AdminBadge variant={c.isActive ? "success" : "neutral"} size="sm" dot>
                  {c.isActive ? "فعال" : "غیرفعال"}
                </AdminBadge>
              </div>

              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                {c.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#124A57]" />
                <span>نمایش در اسلایدر صفحه اصلی</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(c.id, c.isActive)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    c.isActive
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                  }`}
                  title="تغییر وضعیت انتشار"
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="ویرایش"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "ویرایش کمپین فصلی" : "تعریف کمپین فصلی جدید"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان کمپین
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: جشنواره استیک‌های لوکس باربیکیو"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شناسهکلمات اسلاگ (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="luxury-bbq-festival"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نشان (Badge)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="جشنواره فصلی تابستانه"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تخفیف برجسته
              </label>
              <input
                type="text"
                value={highlightDiscount}
                onChange={(e) => setHighlightDiscount(e.target.value)}
                placeholder="۲۰٪ تخفیف ویژه"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              لینک تصویر بنر (URL)
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                متن دکمه (CTA)
              </label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="مشاهده محصولات"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                لینک دکمه (CTA Link)
              </label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="#store-section"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات کامل
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات تکمیلی کمپین..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ترتیب نمایش (Sort Order)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#CD78B3] focus:ring-[#CD78B3]"
              />
              <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                کمپین فعال باشد
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <AdminButton variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              انصراف
            </AdminButton>
            <AdminButton variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
