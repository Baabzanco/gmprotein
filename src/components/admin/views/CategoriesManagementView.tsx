import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { showToast } from "../ui/AdminToast";
import { FolderTree, Plus, Search, RefreshCw, Layers } from "lucide-react";

export const CategoriesManagementView: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        adminService.getCategories(),
        adminService.getProducts(),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (err: any) {
      showToast("خطا در بارگذاری دسته‌بندی‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("لطفاً نام دسته‌بندی را وارد کنید.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedSlug = slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-");
      await adminService.createCategory({
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
      });

      showToast("دسته‌بندی جدید با موفقیت ایجاد گردید.", "success");
      setIsModalOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || "خطا در ایجاد دسته‌بندی", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت دسته‌بندی‌های کاتالوگ</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            دسته‌بندی‌های اصلی و زیرشاخه‌های فرآورده‌های دامی و استیک
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchCategories}
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
            دسته‌بندی جدید
          </AdminButton>
        </div>
      </div>

      {/* Search */}
      <AdminCard bodyClassName="p-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در نام یا شناسه دسته‌بندی..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </AdminCard>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;

          return (
            <AdminCard key={c.id} className="hover:border-[#124A57]/40 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#124A57]/10 text-[#124A57] dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      /{c.slug}
                    </span>
                  </div>
                </div>

                <AdminBadge variant="brand" size="sm">
                  {count} کالا
                </AdminBadge>
              </div>

              {c.description && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>اولویت نمایش: {c.sortOrder ?? 0}</span>
                <span className="text-[#124A57] dark:text-teal-400 font-medium">فعال در منو</span>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {/* Create Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="ایجاد دسته‌بندی جدید"
        description="عنوان فارسی و اسلاگ یکتای دسته را برای ناوبری و فیلتر فروشگاه تعریف کنید."
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
            <AdminButton
              variant="primary"
              onClick={handleCreateCategory}
              isLoading={isSubmitting}
            >
              ایجاد دسته‌بندی
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان فارسی دسته‌بندی *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: استیک‌های لوکس و درای‌ایج"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              نامک لاتین (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="dry-aged-steaks"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              ترتیب نمایش (Sort Order)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات کوتاه
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحاتی در مورد برش‌ها و فرآورده‌های این رده..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
