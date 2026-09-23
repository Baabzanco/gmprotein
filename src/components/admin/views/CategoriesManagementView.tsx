import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import { toPersianDigits } from "../../../utils/formatters";
import { FolderTree, Plus, Search, RefreshCw, Layers, Edit2, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

export const CategoriesManagementView: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal state
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Dialog state
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        adminService.getCategories(),
        adminService.getProducts(),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch {
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
        isActive,
      });

      showToast("دسته‌بندی جدید با موفقیت ایجاد گردید.", "success");
      setIsCreateModalOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      setSortOrder(0);
      setIsActive(true);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || "خطا در ایجاد دسته‌بندی", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setEditName(cat.name || "");
    setEditSlug(cat.slug || "");
    setEditDescription(cat.description || "");
    setEditSortOrder(cat.sortOrder || 0);
    setEditIsActive(cat.isActive !== false);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) {
      showToast("نام دسته‌بندی الزامی است.", "warning");
      return;
    }

    setIsUpdating(true);
    try {
      await adminService.updateCategory(editingCategory.id, {
        name: editName.trim(),
        slug: editSlug.trim() || editName.trim().toLowerCase().replace(/\s+/g, "-"),
        description: editDescription.trim() || null,
        sortOrder: Number(editSortOrder) || 0,
        isActive: editIsActive,
      });

      showToast("تغییرات دسته‌بندی با موفقیت ذخیره شد.", "success");
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || "خطا در ویرایش دسته‌بندی", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCandidate) return;
    const count = products.filter((p) => p.categoryId === deleteCandidate.id).length;
    if (count > 0) {
      showToast(
        `امکان حذف وجود ندارد؛ این دسته شامل ${toPersianDigits(count)} محصول است.`,
        "error"
      );
      setDeleteCandidate(null);
      return;
    }

    setIsDeleting(true);
    try {
      await adminService.deleteCategory(deleteCandidate.id);
      showToast("دسته‌بندی با موفقیت حذف گردید.", "success");
      setDeleteCandidate(null);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || "خطا در حذف دسته‌بندی", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
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
            تعریف، ویرایش و مدیریت دسته‌های فرآورده‌های دامی، استیک‌ها و برش‌های خاص
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
            onClick={() => setIsCreateModalOpen(true)}
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
            placeholder="جستجو در نام یا اسلاگ دسته‌بندی..."
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
            <AdminCard key={c.id} className="hover:border-[#124A57]/40 transition-colors flex flex-col justify-between">
              <div>
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

                  <div className="flex items-center gap-1.5">
                    <AdminBadge variant={count > 0 ? "brand" : "neutral"} size="sm">
                      {toPersianDigits(count)} کالا
                    </AdminBadge>
                    {c.isActive === false ? (
                      <AdminBadge variant="warning" size="sm">
                        غیرفعال
                      </AdminBadge>
                    ) : (
                      <AdminBadge variant="success" size="sm">
                        فعال
                      </AdminBadge>
                    )}
                  </div>
                </div>

                {c.description && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  اولویت: {toPersianDigits(c.sortOrder ?? 0)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="ویرایش دسته‌بندی"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(c)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      count > 0
                        ? "text-slate-300 dark:text-slate-600 hover:text-rose-500"
                        : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    }`}
                    title={
                      count > 0
                        ? `دارای ${toPersianDigits(count)} محصول (غیرقابل حذف)`
                        : "حذف دسته‌بندی"
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {/* Create Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="ایجاد دسته‌بندی جدید"
        description="عنوان فارسی و اسلاگ یکتای دسته را برای ناوبری و فیلتر فروشگاه تعریف کنید."
        maxWidth="md"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
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

          <div className="grid grid-cols-2 gap-3">
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
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="createIsActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#124A57] focus:ring-[#124A57] accent-[#124A57]"
              />
              <label htmlFor="createIsActive" className="font-bold text-slate-700 dark:text-slate-300">
                وضعیت فعال در منو
              </label>
            </div>
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

      {/* Edit Modal */}
      {editingCategory && (
        <AdminModal
          isOpen={Boolean(editingCategory)}
          onClose={() => setEditingCategory(null)}
          title={`ویرایش دسته‌بندی: ${editingCategory.name}`}
          description="تغییر عنوان، نامک و اولویت نمایش دسته‌بندی در فروشگاه."
          maxWidth="md"
          footer={
            <>
              <AdminButton
                variant="secondary"
                onClick={() => setEditingCategory(null)}
                disabled={isUpdating}
              >
                انصراف
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleUpdateCategory}
                isLoading={isUpdating}
              >
                ذخیره تغییرات
              </AdminButton>
            </>
          }
        >
          <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان فارسی دسته‌بندی *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
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
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ترتیب نمایش (Sort Order)
                </label>
                <input
                  type="number"
                  value={editSortOrder}
                  onChange={(e) => setEditSortOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#124A57] focus:ring-[#124A57] accent-[#124A57]"
                />
                <label htmlFor="editIsActive" className="font-bold text-slate-700 dark:text-slate-300">
                  وضعیت فعال
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                توضیحات
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </form>
        </AdminModal>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <AdminConfirmDialog
          isOpen={Boolean(deleteCandidate)}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={handleDeleteCategory}
          title="حذف دسته‌بندی"
          message={
            products.filter((p) => p.categoryId === deleteCandidate.id).length > 0
              ? `خطا: دسته‌بندی "${deleteCandidate.name}" شامل ${toPersianDigits(
                  products.filter((p) => p.categoryId === deleteCandidate.id).length
                )} محصول فعال است و امکان حذف آن وجود ندارد.`
              : `آیا از حذف دائمی دسته‌بندی "${deleteCandidate.name}" اطمینان دارید؟`
          }
          confirmLabel={
            products.filter((p) => p.categoryId === deleteCandidate.id).length > 0
              ? "متوجه شدم"
              : "بله، حذف شود"
          }
          isDanger={
            !(products.filter((p) => p.categoryId === deleteCandidate.id).length > 0)
          }
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
