import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

export const ProductsManagementView: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");

  // Selection for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formBasePrice, setFormBasePrice] = useState<number>(0);
  const [formUnit, setFormUnit] = useState("کیلوگرم");
  const [formMinOrder, setFormMinOrder] = useState<number>(1);
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (err: any) {
      showToast("خطا در دریافت لیست محصولات", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;

    const matchesAvailability =
      availabilityFilter === "ALL" ||
      (availabilityFilter === "AVAILABLE" && p.isAvailable) ||
      (availabilityFilter === "UNAVAILABLE" && !p.isAvailable);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSlug("");
    setFormSku(`PG-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategoryId(categories[0]?.id || "");
    setFormBasePrice(850000);
    setFormUnit("کیلوگرم");
    setFormMinOrder(1);
    setFormDescription("");
    setFormImageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80");
    setFormIsAvailable(true);
    setFormIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug || "");
    setFormSku(p.sku);
    setFormCategoryId(p.categoryId || "");
    setFormBasePrice(p.basePrice || 0);
    setFormUnit(p.unit || "کیلوگرم");
    setFormMinOrder(p.minimumOrder || 1);
    setFormDescription(p.description || "");
    setFormImageUrl(p.images?.[0]?.url || "");
    setFormIsAvailable(p.isAvailable ?? true);
    setFormIsFeatured(p.isFeatured ?? false);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) {
      showToast("لطفاً نام محصول و کد شناسایی SKU را وارد نمایید.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formName.trim(),
        sku: formSku.trim(),
        categoryId: formCategoryId,
        basePrice: Number(formBasePrice),
        unit: formUnit,
        minimumOrder: Number(formMinOrder),
        description: formDescription.trim(),
        isAvailable: formIsAvailable,
        isFeatured: formIsFeatured,
      };

      if (formSlug.trim()) {
        payload.slug = formSlug.trim();
      }

      if (formImageUrl.trim()) {
        payload.images = [
          { url: formImageUrl.trim(), sortOrder: 0, isPrimary: true },
        ];
      }

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        showToast("محصول با موفقیت ویرایش شد.", "success");
      } else {
        await adminService.createProduct(payload);
        showToast("کالای جدید به کاتالوگ اضافه شد.", "success");
      }

      setIsModalOpen(false);
      fetchCatalog();
    } catch (err: any) {
      showToast(err.message || "خطا در ذخیره محصول", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await adminService.deleteProduct(deleteCandidate.id);
      showToast(`محصول «${deleteCandidate.name}» با موفقیت حذف شد.`, "success");
      setDeleteCandidate(null);
      fetchCatalog();
    } catch (err: any) {
      showToast(err.message || "خطا در حذف محصول", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (product: any) => {
    try {
      const newStatus = !product.isAvailable;
      await adminService.updateProduct(product.id, { isAvailable: newStatus });
      showToast(
        newStatus ? "محصول موجود شد." : "وضعیت محصول به ناموجود تغییر یافت.",
        "success"
      );
      fetchCatalog();
    } catch (err: any) {
      showToast("خطا در تغییر وضعیت موجودی", "error");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت محصولات و کاتالوگ</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مشاهده، ویرایش قیمت، وضعیت موجودی و ثبت برش‌های گوشت جدید
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchCatalog}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            تازه‌سازی
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            افزودن کالای جدید
          </AdminButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminCard bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو بر اساس نام محصول یا کد SKU..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="ALL">همه دسته‌بندی‌ها</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="sm:col-span-3">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="ALL">همه وضعیت‌ها</option>
              <option value="AVAILABLE">فقط موجود در سردخانه</option>
              <option value="UNAVAILABLE">فقط ناموجود</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Products Table Card */}
      <AdminCard
        title={
          <div className="flex items-center gap-2">
            <span>فهرست اقلام</span>
            <AdminBadge variant="neutral" size="sm">
              {filteredProducts.length} مورد
            </AdminBadge>
          </div>
        }
        subtitle="فهرست کامل محصولات و قیمت‌های پایه تعریف‌شده در سیستم"
      >
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            هیچ کالایی با شرایط جستجو یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={
                        selectedProductIds.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#124A57] focus:ring-[#124A57]"
                    />
                  </th>
                  <th className="pb-3 font-semibold">تصویر و مشخصات کالا</th>
                  <th className="pb-3 font-semibold">دسته‌بندی</th>
                  <th className="pb-3 font-semibold">شناسه SKU</th>
                  <th className="pb-3 font-semibold">قیمت پایه (تومان)</th>
                  <th className="pb-3 font-semibold">حداقل سفارش</th>
                  <th className="pb-3 font-semibold">وضعیت انبار</th>
                  <th className="pb-3 font-semibold text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const categoryName =
                    categories.find((c) => c.id === p.categoryId)?.name || "عمومی";
                  const primaryImage =
                    p.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80";

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 pr-2">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => handleToggleSelectOne(p.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-[#124A57] focus:ring-[#124A57]"
                        />
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImage}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            loading="lazy"
                          />
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.isFeatured && (
                                <AdminBadge variant="brand" size="sm">
                                  ویژه
                                </AdminBadge>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                              {p.description || "بدون توضیحات"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                        {categoryName}
                      </td>

                      <td className="py-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {p.sku}
                      </td>

                      <td className="py-3 font-bold text-[#124A57] dark:text-teal-400">
                        {Number(p.basePrice).toLocaleString("fa-IR")}
                      </td>

                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {p.minimumOrder} {p.unit}
                      </td>

                      <td className="py-3">
                        <button
                          onClick={() => handleToggleAvailability(p)}
                          className="focus:outline-none"
                          title="کلیک برای تغییر وضعیت"
                        >
                          <AdminBadge
                            variant={p.isAvailable ? "success" : "danger"}
                            size="sm"
                            dot
                          >
                            {p.isAvailable ? "موجود در انبار" : "عدم موجودی"}
                          </AdminBadge>
                        </button>
                      </td>

                      <td className="py-3 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            title="ویرایش محصول"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#124A57] dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(p)}
                            title="حذف محصول"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "ویرایش مشخصات کالا" : "افزودن کالای پروتئینی جدید"}
        description="اطلاعات کاتالوگ، استانداردهای تحویل و قیمت پایه بر حسب تومان را تعیین کنید."
        maxWidth="2xl"
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
              onClick={handleSaveProduct}
              isLoading={isSubmitting}
            >
              {editingProduct ? "ذخیره تغییرات" : "ایجاد محصول"}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام رسمی محصول *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: استیک ریب‌آی گوساله ماربل"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                کد یکتای کالا (SKU) *
              </label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                placeholder="PG-101"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                دسته‌بندی
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                قیمت پایه (تومان) *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formBasePrice}
                onChange={(e) => setFormBasePrice(Number(e.target.value))}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                واحد سنجش
              </label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              >
                <option value="کیلوگرم">کیلوگرم</option>
                <option value="بسته">بسته</option>
                <option value="شقه">شقه</option>
                <option value="لاشه کامل">لاشه کامل</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                حداقل مقدار سفارش (MOQ)
              </label>
              <input
                type="number"
                min="1"
                value={formMinOrder}
                onChange={(e) => setFormMinOrder(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                آدرس اینترنتی تصویر (Image URL)
              </label>
              <input
                type="url"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات فنی، بافت و کاربرد
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="توضیحات در مورد دوره بیاتی، ماربلینگ، نحوه پخت و کاربرد در رستوران‌ها..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsAvailable}
                onChange={(e) => setFormIsAvailable(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-[#124A57] focus:ring-[#124A57]"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                موجود در سردخانه برای عرضه
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsFeatured}
                onChange={(e) => setFormIsFeatured(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-[#124A57] focus:ring-[#124A57]"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                نمایش به عنوان کالای برگزیده (Featured)
              </span>
            </label>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="تأیید حذف محصول"
        message={`آیا از حذف محصول «${deleteCandidate?.name}» از کاتالوگ اطمینان دارید؟ این عملیات در ردپای امنیتی (Audit Trail) ثبت می‌گردد.`}
        confirmLabel="حذف دائم"
        cancelLabel="انصراف"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
