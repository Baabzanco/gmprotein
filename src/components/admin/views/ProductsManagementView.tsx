import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import { toPersianDigits, formatPrice } from "../../../utils/formatters";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  RefreshCw,
  Lock,
  Boxes,
  PlusCircle,
  MinusCircle,
  Sliders,
  Check,
} from "lucide-react";
import { ProductPackageOptionDTO } from "../../../../shared/types";

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

  // Package variants & Custom weight settings
  const [allowCustomWeight, setAllowCustomWeight] = useState(true);
  const [packageOptions, setPackageOptions] = useState<ProductPackageOptionDTO[]>([]);

  // Structured Product Features
  const [formFeatures, setFormFeatures] = useState<{ id?: string; name: string; value: string; sortOrder: number }[]>([]);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch {
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

  const deriveSkuForCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    const slug = (cat?.slug || cat?.name || "").toLowerCase();
    let prefix = "PROD";
    if (slug.includes("beef") || slug.includes("گوساله")) prefix = "BEEF";
    else if (slug.includes("lamb") || slug.includes("گوسفند")) prefix = "LAMB";
    else if (slug.includes("special") || slug.includes("خاص")) prefix = "SPEC";
    else if (slug.includes("sale") || slug.includes("تخفیف")) prefix = "SALE";

    const count = products.filter((p) => p.categoryId === catId).length + 1;
    return `PG-${prefix}-${String(count).padStart(3, "0")}`;
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    const defaultCatId = categories[0]?.id || "cat-beef";
    setFormName("");
    setFormSlug("");
    setFormCategoryId(defaultCatId);
    setFormSku(deriveSkuForCategory(defaultCatId));
    setFormBasePrice(1250000);
    setFormUnit("کیلوگرم");
    setFormMinOrder(1);
    setFormDescription("");
    setFormImageUrl(
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
    );
    setFormIsAvailable(true);
    setFormIsFeatured(false);
    setAllowCustomWeight(true);
    setPackageOptions([
      { id: "pkg-new-1", weightKg: 10, label: "بسته ۱۰ کیلوگرمی", isDefault: false, sortOrder: 1 },
      { id: "pkg-new-2", weightKg: 25, label: "کارتن ۲۵ کیلوگرمی عمده", isDefault: true, sortOrder: 2 },
      { id: "pkg-new-3", weightKg: 50, label: "پالت ۵۰ کیلوگرمی رستورانی", isDefault: false, sortOrder: 3 },
    ]);
    setFormFeatures([
      { name: "نوع برش", value: "استیک ریب‌آی با استخوان", sortOrder: 1 },
      { name: "درجه ماربلینگ", value: "A+ ممتاز", sortOrder: 2 },
      { name: "شرایط نگهداری", value: "دمای ۰ تا ۴ درجه سانتی‌گراد", sortOrder: 3 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug || "");
    setFormSku(p.sku); // Read-only immutable SKU
    setFormCategoryId(p.categoryId || "");
    setFormBasePrice(p.basePrice || 0);
    setFormUnit(p.unit || "کیلوگرم");
    setFormMinOrder(p.minimumOrder || 1);
    setFormDescription(p.description || "");
    setFormImageUrl(p.images?.[0]?.url || "");
    setFormIsAvailable(p.isAvailable ?? true);
    setFormIsFeatured(p.isFeatured ?? false);
    setAllowCustomWeight(p.allowCustomWeight ?? true);
    setPackageOptions(
      p.packageOptions && p.packageOptions.length > 0
        ? p.packageOptions
        : [
            { id: "pkg-1", weightKg: 10, label: "بسته ۱۰ کیلوگرمی", isDefault: false, sortOrder: 1 },
            { id: "pkg-2", weightKg: 25, label: "کارتن ۲۵ کیلوگرمی", isDefault: true, sortOrder: 2 },
          ]
    );
    setFormFeatures(
      p.features && p.features.length > 0
        ? p.features.map((f: any, idx: number) => ({
            id: f.id,
            name: f.name,
            value: f.value,
            sortOrder: f.sortOrder || idx + 1,
          }))
        : [
            { name: "نوع برش", value: "برش تخصصی سرآشپز", sortOrder: 1 },
            { name: "شرایط نگهداری", value: "دمای ۰ تا ۴ درجه سانتی‌گراد", sortOrder: 2 },
          ]
    );
    setIsModalOpen(true);
  };

  const handleAddFeature = (name = "", value = "") => {
    setFormFeatures([
      ...formFeatures,
      { name, value, sortOrder: formFeatures.length + 1 },
    ]);
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, idx) => idx !== index));
  };

  const handleUpdateFeature = (index: number, field: "name" | "value", val: string) => {
    const updated = [...formFeatures];
    updated[index][field] = val;
    setFormFeatures(updated);
  };

  const handleCategoryChange = (newCatId: string) => {
    setFormCategoryId(newCatId);
    if (!editingProduct) {
      setFormSku(deriveSkuForCategory(newCatId));
    }
  };

  const handleAddPackageOption = (weightKg = 10, label = "") => {
    const nextSort = packageOptions.length + 1;
    const newOpt: ProductPackageOptionDTO = {
      id: `pkg-${Date.now()}-${nextSort}`,
      weightKg,
      label: label || `بسته ${toPersianDigits(weightKg)} کیلوگرمی`,
      isDefault: packageOptions.length === 0,
      sortOrder: nextSort,
    };
    setPackageOptions([...packageOptions, newOpt]);
  };

  const handleRemovePackageOption = (index: number) => {
    setPackageOptions(packageOptions.filter((_, idx) => idx !== index));
  };

  const handleUpdatePackageOption = (index: number, field: keyof ProductPackageOptionDTO, value: any) => {
    const updated = [...packageOptions];
    if (field === "isDefault" && value === true) {
      updated.forEach((o, i) => {
        o.isDefault = i === index;
      });
    } else {
      (updated[index] as any)[field] = value;
    }
    setPackageOptions(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("لطفاً نام محصول را وارد نمایید.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formName.trim(),
        categoryId: formCategoryId,
        basePrice: Number(formBasePrice),
        unit: formUnit,
        minimumOrder: Number(formMinOrder),
        description: formDescription.trim(),
        isAvailable: formIsAvailable,
        isFeatured: formIsFeatured,
        allowCustomWeight,
        packageOptions: packageOptions.map((opt, idx) => ({
          weightKg: Number(opt.weightKg),
          label: opt.label.trim() || `بسته ${opt.weightKg} کیلوگرمی`,
          isDefault: Boolean(opt.isDefault),
          sortOrder: idx + 1,
        })),
        features: formFeatures
          .filter((f) => f.name.trim())
          .map((f, idx) => ({
            name: f.name.trim(),
            value: f.value.trim(),
            sortOrder: idx + 1,
          })),
      };

      if (!editingProduct) {
        payload.sku = formSku.trim() || deriveSkuForCategory(formCategoryId);
      }

      if (formSlug.trim()) {
        payload.slug = formSlug.trim();
      } else {
        payload.slug = formName.trim().toLowerCase().replace(/\s+/g, "-");
      }

      if (formImageUrl.trim()) {
        payload.imageUrl = formImageUrl.trim();
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
    } catch {
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
            <span>مدیریت محصولات، بسته‌بندی‌ها و کاتالوگ</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تنظیم وزن‌های استاندارد، کد شناسایی خودکار (SKU) و کنترل قیمت پایه و انبار
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
              placeholder="جستجو بر اساس نام محصول یا کد کاتالوگ SKU..."
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
            <span>فهرست اقلام کاتالوگ</span>
            <AdminBadge variant="neutral" size="sm">
              {toPersianDigits(filteredProducts.length)} مورد
            </AdminBadge>
          </div>
        }
        subtitle="فهرست مشخصات، کد SKU پایدار، بسته‌بندی‌های فعال و نرخ پایه"
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
                  <th className="pb-3 font-semibold">کد SKU</th>
                  <th className="pb-3 font-semibold">بسته‌های وزنی قابل سفارش</th>
                  <th className="pb-3 font-semibold">قیمت پایه (تومان)</th>
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

                  const options: ProductPackageOptionDTO[] = p.packageOptions || [];

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
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold border border-slate-200/60 dark:border-slate-700">
                          {p.sku}
                        </span>
                      </td>

                      {/* Predefined Package Options Badges */}
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {options.length > 0 ? (
                            options.map((opt) => (
                              <span
                                key={opt.id || opt.weightKg}
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                  opt.isDefault
                                    ? "bg-[#124A57]/10 text-[#124A57] dark:bg-teal-950/60 dark:text-teal-300 border border-[#124A57]/30"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {toPersianDigits(opt.weightKg)} ک‌گ
                                {opt.isDefault ? " (پیش‌فرض)" : ""}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">سفارش بر اساس کیلوگرم</span>
                          )}
                          {p.allowCustomWeight && (
                            <span className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              + وزن دستی
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 font-bold text-[#124A57] dark:text-teal-400 font-mono">
                        {formatPrice(p.basePrice)}
                      </td>

                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(p)}
                          className="focus:outline-none cursor-pointer"
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
                            type="button"
                            onClick={() => openEditModal(p)}
                            title="ویرایش محصول"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#124A57] dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            title="حذف محصول"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
        title={editingProduct ? `ویرایش کالا: ${editingProduct.name}` : "افزودن کالای پروتئینی جدید"}
        description="اطلاعات محصول، بسته‌بندی‌های استاندارد، کد یکتای SKU و قیمت پایه را مدیریت کنید."
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
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>کد یکتای سیستم (SKU)</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1 font-normal">
                  <Lock className="w-3 h-3" />
                  غیرقابل ویرایش دستی (تولید سیستمی)
                </span>
              </label>
              <input
                type="text"
                value={formSku}
                readOnly
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-600 dark:text-slate-400 focus:outline-none font-mono font-bold cursor-not-allowed"
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
                onChange={(e) => handleCategoryChange(e.target.value)}
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

          {/* Package Variants Section */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#124A57] dark:text-teal-400" />
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  بسته‌بندی‌ها و وزن‌های استاندارد قابل سفارش
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">افزودن سریع:</span>
                {[5, 10, 15, 25, 30, 50].map((kg) => (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => handleAddPackageOption(kg, `بسته ${toPersianDigits(kg)} کیلوگرمی`)}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] text-slate-700 dark:text-slate-300 hover:bg-[#124A57] hover:text-white transition-colors cursor-pointer"
                  >
                    +{toPersianDigits(kg)}kg
                  </button>
                ))}
              </div>
            </div>

            {/* List of packages */}
            <div className="space-y-2">
              {packageOptions.map((opt, idx) => (
                <div
                  key={opt.id || idx}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-20">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={opt.weightKg}
                      onChange={(e) =>
                        handleUpdatePackageOption(idx, "weightKg", Number(e.target.value))
                      }
                      placeholder="وزن (kg)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-center font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) =>
                        handleUpdatePackageOption(idx, "label", e.target.value)
                      }
                      placeholder="عنوان بسته (مثال: کارتن ۲۵ کیلوگرمی)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="defaultPackageRadio"
                      checked={Boolean(opt.isDefault)}
                      onChange={() => handleUpdatePackageOption(idx, "isDefault", true)}
                      className="accent-[#124A57]"
                    />
                    <span>پیش‌فرض</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemovePackageOption(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded cursor-pointer"
                    title="حذف این بسته"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleAddPackageOption(10, "")}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#124A57] dark:text-teal-400 hover:underline cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>افزودن بسته وزنی دلخواه</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={allowCustomWeight}
                    onChange={(e) => setAllowCustomWeight(e.target.checked)}
                    className="rounded text-[#124A57] focus:ring-[#124A57] accent-[#124A57]"
                  />
                  <span className="font-semibold text-[11px]">
                    امکان ثبت وزن دستی و دلخواه توسط مشتری
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Structured Product Features Section */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#CD78B3]" />
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  مشخصات فنی و کیفی محصول (Product Features)
                </span>
              </div>

              {/* Quick Preset Features */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">پیش‌فرض:</span>
                {[
                  { name: "درجه ماربلینگ", val: "A+ ممتاز" },
                  { name: "نحوه پخت", val: "استیک / باربیکیو" },
                  { name: "سن لاشه", val: "کمتر از ۲ سال" },
                ].map((pre) => (
                  <button
                    key={pre.name}
                    type="button"
                    onClick={() => handleAddFeature(pre.name, pre.val)}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] text-slate-700 dark:text-slate-300 hover:bg-[#124A57] hover:text-white transition-colors cursor-pointer"
                  >
                    +{pre.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {formFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-1/3">
                    <input
                      type="text"
                      value={feat.name}
                      onChange={(e) => handleUpdateFeature(idx, "name", e.target.value)}
                      placeholder="عنوان ویژگی (مثال: نوع برش)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={feat.value}
                      onChange={(e) => handleUpdateFeature(idx, "value", e.target.value)}
                      placeholder="مقدار (مثال: راسته بی‌استخوان مغز)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded cursor-pointer"
                    title="حذف این مشخصه"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddFeature("", "")}
                className="flex items-center gap-1 text-[11px] font-bold text-[#CD78B3] hover:underline cursor-pointer pt-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>افزودن مشخصه فنی جدید</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                حداقل سفارش (MOQ)
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
                آدرس تصویر (Image URL)
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
              توضیحات و مشخصات بافت
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
                className="rounded border-slate-300 dark:border-slate-700 text-[#124A57] focus:ring-[#124A57] accent-[#124A57]"
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
                className="rounded border-slate-300 dark:border-slate-700 text-[#124A57] focus:ring-[#124A57] accent-[#124A57]"
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
