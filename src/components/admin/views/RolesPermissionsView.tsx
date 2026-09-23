import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import {
  Shield,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RoleDTO, PermissionDTO } from "../../../../shared/types";

export const RolesPermissionsView: React.FC = () => {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cards" | "matrix">("cards");

  // Create Role Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createRoleName, setCreateRoleName] = useState("");
  const [createRoleTitle, setCreateRoleTitle] = useState("");
  const [createRoleDesc, setCreateRoleDesc] = useState("");
  const [createSelectedPerms, setCreateSelectedPerms] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Role Modal
  const [editRoleCandidate, setEditRoleCandidate] = useState<RoleDTO | null>(null);
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");
  const [editSelectedPerms, setEditSelectedPerms] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Role Candidate
  const [deleteCandidate, setDeleteCandidate] = useState<RoleDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
      ]);
      setRoles(rolesData || []);
      setPermissions(permsData || []);
    } catch (err: any) {
      showToast(err.message || "خطا در بارگذاری اطلاعات نقش‌ها و دسترسی‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group permissions by category
  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, PermissionDTO[]> = {};
    permissions.forEach((p) => {
      const cat = p.category || "عمومی";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(p);
    });
    return groups;
  }, [permissions]);

  const handleOpenCreateModal = () => {
    setCreateRoleName("");
    setCreateRoleTitle("");
    setCreateRoleDesc("");
    setCreateSelectedPerms([]);
    setIsCreateModalOpen(true);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRoleName.trim() || !createRoleTitle.trim()) {
      showToast("شناسه انگلیسی و عنوان فارسی نقش الزامی است.", "warning");
      return;
    }

    const formattedName = createRoleName
      .toUpperCase()
      .trim()
      .replace(/\s+/g, "_");

    setIsCreating(true);
    try {
      await adminService.createRole({
        name: formattedName,
        title: createRoleTitle.trim(),
        description: createRoleDesc.trim() || null,
        permissions: createSelectedPerms,
      });

      showToast(`نقش کاربری «${createRoleTitle}» با موفقیت ایجاد شد.`, "success");
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "خطا در ایجاد نقش", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditModal = (role: RoleDTO) => {
    setEditRoleCandidate(role);
    setEditRoleTitle(role.title || role.name);
    setEditRoleDesc(role.description || "");
    setEditSelectedPerms(role.permissions || []);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleCandidate) return;

    if (!editRoleTitle.trim()) {
      showToast("عنوان نقش نمی‌تواند خالی باشد.", "warning");
      return;
    }

    setIsUpdating(true);
    try {
      await adminService.updateRole(editRoleCandidate.id, {
        title: editRoleTitle.trim(),
        description: editRoleDesc.trim() || null,
        permissions: editSelectedPerms,
      });

      showToast("تغییرات نقش با موفقیت ذخیره شد.", "success");
      setEditRoleCandidate(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "خطا در ویرایش نقش", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await adminService.deleteRole(deleteCandidate.id);
      showToast(`نقش «${deleteCandidate.title || deleteCandidate.name}» حذف گردید.`, "success");
      setDeleteCandidate(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "خطا در حذف نقش", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCategoryPermissions = (
    categoryPerms: PermissionDTO[],
    selected: string[],
    setSelected: (perms: string[]) => void
  ) => {
    const catCodes = categoryPerms.map((p) => p.code);
    const allSelected = catCodes.every((code) => selected.includes(code));

    if (allSelected) {
      setSelected(selected.filter((code) => !catCodes.includes(code)));
    } else {
      const combined = Array.from(new Set([...selected, ...catCodes]));
      setSelected(combined);
    }
  };

  const toggleSinglePermission = (
    code: string,
    selected: string[],
    setSelected: (perms: string[]) => void
  ) => {
    if (selected.includes(code)) {
      setSelected(selected.filter((item) => item !== code));
    } else {
      setSelected([...selected, code]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
              <span>نقش‌ها و ماتریس دسترسی‌ها (RBAC)</span>
            </h2>
            <AdminBadge variant="brand" size="sm">
              {roles.length} نقش تعریف‌شده
            </AdminBadge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مدیریت نقش‌های سیستمی و سفارشی، تخصیص مجوزهای عملیاتی و کنترل دسترسی گرانولار
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab("cards")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "cards"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              کارت‌های نقش
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "matrix"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              ماتریس مقایسه‌ای
            </button>
          </div>

          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            تازه‌سازی
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            نقش جدید
          </AdminButton>
        </div>
      </div>

      {/* Cards View */}
      {activeTab === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const isSuperAdmin = role.name === "SUPER_ADMIN";
            const isSystem = role.isSystem || isSuperAdmin;
            const permsCount = isSuperAdmin ? permissions.length : role.permissions?.length || 0;

            return (
              <AdminCard key={role.id} className="relative flex flex-col justify-between h-full">
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {role.title || role.name}
                        </span>
                        {isSystem && (
                          <span
                            title="نقش پیش‌فرض سیستمی"
                            className="text-slate-400 hover:text-amber-500"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {role.name}
                      </div>
                    </div>

                    <AdminBadge
                      variant={isSuperAdmin ? "warning" : isSystem ? "info" : "neutral"}
                      size="sm"
                    >
                      {isSystem ? "سیستمی" : "سفارشی"}
                    </AdminBadge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 min-h-8 leading-relaxed">
                    {role.description || "بدون توضیحات ثبت‌شده"}
                  </p>

                  {/* Meta Stats */}
                  <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] mb-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{role.usersCount ?? 0} کاربر تخصیص یافته</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>
                        {isSuperAdmin ? "دسترسی نامحدود" : `${permsCount} مجوز عملیاتی`}
                      </span>
                    </div>
                  </div>

                  {/* Sample Permissions Tag Preview */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-semibold text-slate-400">
                      نمونه مجوزهای فعال:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {isSuperAdmin ? (
                        <AdminBadge variant="brand" size="sm">
                          تمامی مجوزهای سامانه (Super Admin)
                        </AdminBadge>
                      ) : (
                        role.permissions?.slice(0, 4).map((pCode) => (
                          <span
                            key={pCode}
                            className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-mono"
                          >
                            {pCode}
                          </span>
                        ))
                      )}
                      {!isSuperAdmin && (role.permissions?.length || 0) > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 rounded">
                          + {(role.permissions?.length || 0) - 4} مجوز دیگر
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <AdminButton
                    variant="outline"
                    size="sm"
                    disabled={isSuperAdmin}
                    onClick={() => handleOpenEditModal(role)}
                    icon={<Edit2 className="w-3 h-3" />}
                  >
                    {isSuperAdmin ? "دسترسی جامع" : "تنظیم دسترسی‌ها"}
                  </AdminButton>

                  {!isSystem && (
                    <button
                      onClick={() => setDeleteCandidate(role)}
                      title="حذف نقش کاربری"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {/* Matrix View */}
      {activeTab === "matrix" && (
        <AdminCard
          title="جدول ماتریس جامع کنترل دسترسی‌ها"
          subtitle="بررسی تطبیقی سطوح دسترسی هر نقش به تفکیک منابع و ماژول‌های سامانه"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="pb-3 pr-2 font-semibold">بخش و مجوز عملیاتی</th>
                  <th className="pb-3 font-semibold">شناسه دسترسی</th>
                  {roles.map((r) => (
                    <th key={r.id} className="pb-3 text-center font-semibold">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {r.title || r.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 font-normal">
                        {r.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-slate-100">
                      <td colSpan={2 + roles.length} className="py-2.5 px-2 text-xs">
                        <div className="flex items-center gap-1.5 text-[#124A57] dark:text-teal-400">
                          <Layers className="w-3.5 h-3.5" />
                          <span>ماژول {category}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Permissions Rows */}
                    {perms.map((p) => (
                      <tr
                        key={p.code}
                        className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="py-2.5 pr-2 font-medium text-slate-800 dark:text-slate-200">
                          <div>{p.description}</div>
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-400">
                          {p.code}
                        </td>
                        {roles.map((r) => {
                          const isSuperAdmin = r.name === "SUPER_ADMIN";
                          const has = isSuperAdmin || r.permissions?.includes(p.code);

                          return (
                            <td key={r.id} className="py-2.5 text-center">
                              {has ? (
                                <span className="inline-flex p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex p-1 rounded-full text-slate-300 dark:text-slate-600">
                                  <X className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* Create Role Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="ایجاد نقش کاربری جدید"
        description="شناسه یکتا، عنوان فارسی و ماتریس دسترسی‌های اولیه نقش را تعیین نمایید."
        maxWidth="2xl"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              انصراف
            </AdminButton>
            <AdminButton variant="primary" onClick={handleCreateRole} isLoading={isCreating}>
              ثبت و ایجاد نقش
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شناسه انگلیسی نقش (لاتین بزرگ) *
              </label>
              <input
                type="text"
                value={createRoleName}
                onChange={(e) => setCreateRoleName(e.target.value.toUpperCase())}
                placeholder="BRANCH_MANAGER"
                required
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان فارسی نقش *
              </label>
              <input
                type="text"
                value={createRoleTitle}
                onChange={(e) => setCreateRoleTitle(e.target.value)}
                placeholder="مدیر شعبه و انبار"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات شرح وظایف نقش
            </label>
            <textarea
              value={createRoleDesc}
              onChange={(e) => setCreateRoleDesc(e.target.value)}
              placeholder="توضیح اختیاری درباره سطح دسترسی‌ها و مسئولیت‌های این نقش..."
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          {/* Permissions Matrix Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                تخصیص مجوزهای دسترسی ({createSelectedPerms.length} انتخاب شده)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (createSelectedPerms.length === permissions.length) {
                    setCreateSelectedPerms([]);
                  } else {
                    setCreateSelectedPerms(permissions.map((p) => p.code));
                  }
                }}
                className="text-[#124A57] dark:text-teal-400 hover:underline font-semibold text-[11px]"
              >
                {createSelectedPerms.length === permissions.length
                  ? "لغو انتخاب همه"
                  : "انتخاب تمامی مجوزها"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              {Object.entries(groupedPermissions).map(([cat, perms]) => {
                const catCodes = perms.map((p) => p.code);
                const allSelected = catCodes.every((c) => createSelectedPerms.includes(c));

                return (
                  <div
                    key={cat}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#124A57] dark:text-teal-400" />
                        <span>{cat}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleCategoryPermissions(
                            perms,
                            createSelectedPerms,
                            setCreateSelectedPerms
                          )
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        {allSelected ? "عدم انتخاب دسته" : "انتخاب کل دسته"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = createSelectedPerms.includes(p.code);
                        return (
                          <label
                            key={p.code}
                            className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-[#124A57]/10 dark:bg-teal-950/40 text-slate-900 dark:text-slate-100"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                toggleSinglePermission(
                                  p.code,
                                  createSelectedPerms,
                                  setCreateSelectedPerms
                                )
                              }
                              className="mt-0.5 rounded text-[#124A57] focus:ring-[#124A57]"
                            />
                            <div>
                              <div className="font-medium text-[11px]">{p.description}</div>
                              <div className="font-mono text-[9px] text-slate-400">{p.code}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Edit Role Modal */}
      <AdminModal
        isOpen={!!editRoleCandidate}
        onClose={() => setEditRoleCandidate(null)}
        title={`ویرایش نقش: ${editRoleCandidate?.title || editRoleCandidate?.name}`}
        description="ویرایش عنوان، شرح وظایف و تنظیم دسترسی‌های گرانولار ماژول‌ها."
        maxWidth="2xl"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setEditRoleCandidate(null)}
              disabled={isUpdating}
            >
              انصراف
            </AdminButton>
            <AdminButton variant="primary" onClick={handleUpdateRole} isLoading={isUpdating}>
              ذخیره تغییرات
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شناسه انگلیسی
              </label>
              <input
                type="text"
                value={editRoleCandidate?.name || ""}
                disabled
                dir="ltr"
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان فارسی نقش *
              </label>
              <input
                type="text"
                value={editRoleTitle}
                onChange={(e) => setEditRoleTitle(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات شرح وظایف نقش
            </label>
            <textarea
              value={editRoleDesc}
              onChange={(e) => setEditRoleDesc(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          {/* Permissions Matrix Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                ماتریس دسترسی‌های فعال ({editSelectedPerms.length} انتخاب شده)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (editSelectedPerms.length === permissions.length) {
                    setEditSelectedPerms([]);
                  } else {
                    setEditSelectedPerms(permissions.map((p) => p.code));
                  }
                }}
                className="text-[#124A57] dark:text-teal-400 hover:underline font-semibold text-[11px]"
              >
                {editSelectedPerms.length === permissions.length
                  ? "لغو انتخاب همه"
                  : "انتخاب تمامی مجوزها"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              {Object.entries(groupedPermissions).map(([cat, perms]) => {
                const catCodes = perms.map((p) => p.code);
                const allSelected = catCodes.every((c) => editSelectedPerms.includes(c));

                return (
                  <div
                    key={cat}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#124A57] dark:text-teal-400" />
                        <span>{cat}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleCategoryPermissions(perms, editSelectedPerms, setEditSelectedPerms)
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        {allSelected ? "عدم انتخاب دسته" : "انتخاب کل دسته"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = editSelectedPerms.includes(p.code);
                        return (
                          <label
                            key={p.code}
                            className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-[#124A57]/10 dark:bg-teal-950/40 text-slate-900 dark:text-slate-100"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                toggleSinglePermission(
                                  p.code,
                                  editSelectedPerms,
                                  setEditSelectedPerms
                                )
                              }
                              className="mt-0.5 rounded text-[#124A57] focus:ring-[#124A57]"
                            />
                            <div>
                              <div className="font-medium text-[11px]">{p.description}</div>
                              <div className="font-mono text-[9px] text-slate-400">{p.code}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Delete Role Confirmation */}
      <AdminConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteRole}
        title="حذف نقش کاربری"
        message={`آیا از حذف نقش «${deleteCandidate?.title || deleteCandidate?.name}» اطمینان دارید؟`}
        confirmLabel="حذف نقش"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
