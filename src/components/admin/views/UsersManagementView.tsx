import React, { useState, useEffect, useCallback } from "react";
import { adminService } from "../../../services/adminService";
import { useAuth } from "../../../context/AuthContext";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import {
  Users,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Edit2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  UserCheck,
  UserX,
  ChevronRight,
  ChevronLeft,
  Crown,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { UserDTO, RoleDTO } from "../../../../shared/types";

export const UsersManagementView: React.FC = () => {
  const { user: currentAuthUser, hasPermission } = useAuth();

  const [users, setUsers] = useState<UserDTO[]>([]);
  const [rolesList, setRolesList] = useState<RoleDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createSelectedRoles, setCreateSelectedRoles] = useState<string[]>(["PRODUCT_MANAGER"]);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editUserCandidate, setEditUserCandidate] = useState<UserDTO | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSelectedRoles, setEditSelectedRoles] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset Password Modal State
  const [resetPasswordCandidate, setResetPasswordCandidate] = useState<UserDTO | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Delete Dialog State
  const [deleteCandidate, setDeleteCandidate] = useState<UserDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Toggle State
  const [statusToggleCandidate, setStatusToggleCandidate] = useState<UserDTO | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const fetchRoles = async () => {
    try {
      const data = await adminService.getRoles();
      setRolesList(data || []);
    } catch (err) {
      console.error("Failed to load roles list", err);
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers({
        search: searchTerm || undefined,
        role: selectedRoleFilter || undefined,
        status: selectedStatusFilter || undefined,
        page: currentPage,
        limit: 10,
      });

      if (Array.isArray(response)) {
        setUsers(response);
        setTotalUsers(response.length);
        setTotalPages(1);
      } else if (response && response.users) {
        setUsers(response.users);
        setTotalUsers(response.total || response.users.length);
        setTotalPages(response.totalPages || 1);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      showToast(err.message || "خطا در بارگذاری فهرست کاربران", "error");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedRoleFilter, selectedStatusFilter, currentPage]);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateModal = () => {
    setCreateFirstName("");
    setCreateLastName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreatePassword("");
    setCreateSelectedRoles(["PRODUCT_MANAGER"]);
    setIsCreateModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword || !createFirstName.trim() || !createLastName.trim()) {
      showToast("لطفاً کلیه فیلدهای اجباری مشخصات کاربر را وارد کنید.", "warning");
      return;
    }

    if (createSelectedRoles.length === 0) {
      showToast("حداقل یک نقش کاربری برای کاربر الزامی است.", "warning");
      return;
    }

    setIsCreating(true);
    try {
      await adminService.createUser({
        firstName: createFirstName.trim(),
        lastName: createLastName.trim(),
        email: createEmail.trim().toLowerCase(),
        phone: createPhone.trim() || null,
        password: createPassword,
        roles: createSelectedRoles,
      });

      showToast("حساب کاربری جدید با موفقیت ایجاد شد.", "success");
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "خطا در ایجاد حساب کاربری", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditModal = (targetUser: UserDTO) => {
    setEditUserCandidate(targetUser);
    setEditFirstName(targetUser.firstName || "");
    setEditLastName(targetUser.lastName || "");
    setEditEmail(targetUser.email || "");
    setEditPhone(targetUser.phone || "");
    setEditSelectedRoles(targetUser.roles || []);
    setEditStatus(targetUser.isActive || targetUser.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserCandidate) return;

    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      showToast("نام، نام خانوادگی و ایمیل نمی‌توانند خالی باشند.", "warning");
      return;
    }

    if (editSelectedRoles.length === 0) {
      showToast("حداقل یک نقش کاربری الزامی است.", "warning");
      return;
    }

    setIsUpdating(true);
    try {
      await adminService.updateUser(editUserCandidate.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim() || null,
        roles: editSelectedRoles,
        isActive: editStatus === "ACTIVE",
        status: editStatus,
      });

      showToast("مشخصات کاربر با موفقیت به‌روزرسانی شد.", "success");
      setEditUserCandidate(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "خطا در ویرایش کاربر", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusToggleCandidate) return;

    const currentActive = statusToggleCandidate.isActive || statusToggleCandidate.status === "ACTIVE";
    const nextActive = !currentActive;

    setIsTogglingStatus(true);
    try {
      await adminService.updateUserStatus(statusToggleCandidate.id, nextActive);
      showToast(
        nextActive
          ? `حساب کاربری «${statusToggleCandidate.firstName} ${statusToggleCandidate.lastName}» فعال شد.`
          : `حساب کاربری «${statusToggleCandidate.firstName} ${statusToggleCandidate.lastName}» به حالت معلق درآمد.`,
        "success"
      );
      setStatusToggleCandidate(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "خطا در تغییر وضعیت حساب کاربری", "error");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordCandidate) return;

    if (!newPassword || newPassword.length < 6) {
      showToast("رمز عبور باید حداقل شامل ۶ کاراکتر باشد.", "warning");
      return;
    }

    setIsResettingPassword(true);
    try {
      await adminService.resetUserPassword(resetPasswordCandidate.id, newPassword);
      showToast("رمز عبور کاربر با موفقیت تغییر یافت.", "success");
      setResetPasswordCandidate(null);
      setNewPassword("");
    } catch (err: any) {
      showToast(err.message || "خطا در بازنشانی رمز عبور", "error");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(deleteCandidate.id);
      showToast(`حساب کاربری «${deleteCandidate.firstName} ${deleteCandidate.lastName}» حذف گردید.`, "success");
      setDeleteCandidate(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "خطا در حذف کاربر", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPersianDate = (dateStr?: string | null) => {
    if (!dateStr) return "هنوز وارد نشده";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    const matched = rolesList.find((r) => r.name === roleName);
    if (matched) return matched.title || matched.name;

    const fallbackMap: Record<string, string> = {
      SUPER_ADMIN: "مدیر ارشد کل",
      ADMIN: "مدیر عملیات",
      PRODUCT_MANAGER: "مدیر محصولات",
      CONTENT_MANAGER: "مدیر محتوا",
      SALES_MANAGER: "مدیر فروش",
      SUPPORT: "پشتیبانی",
      VIEWER: "بیننده",
    };
    return fallbackMap[roleName] || roleName;
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case "SUPER_ADMIN":
        return "brand";
      case "ADMIN":
        return "info";
      case "PRODUCT_MANAGER":
      case "CONTENT_MANAGER":
        return "neutral";
      case "SALES_MANAGER":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
              <span>مدیریت کاربران و پرسنل سامانه</span>
            </h2>
            <AdminBadge variant="neutral" size="sm">
              {totalUsers} کاربر ثبت‌شده
            </AdminBadge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعریف حساب‌های کاربری، کنترل سطح دسترسی RBAC، تعلیق و مدیریت پرسنل
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
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
            کاربر جدید
          </AdminButton>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <AdminCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو در نام، ایمیل، یا شماره تماس..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => {
                setSelectedRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="">همه نقش‌های کاربری</option>
              {rolesList.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.title || r.name} ({r.name})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="ACTIVE">فقط حساب‌های فعال</option>
              <option value="SUSPENDED">فقط حساب‌های معلق</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Users Table */}
      <AdminCard
        title="فهرست پرسنل و کاربران دارای دسترسی"
        subtitle="حساب‌های کاربری متصل به سامانه احراز هویت با ساختار مجوزهای داینامیک"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">کاربر</th>
                <th className="pb-3 font-semibold">اطلاعات تماس</th>
                <th className="pb-3 font-semibold">نقش‌ها و دسترسی</th>
                <th className="pb-3 font-semibold">وضعیت حساب</th>
                <th className="pb-3 font-semibold">آخرین ورود</th>
                <th className="pb-3 font-semibold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    کاربری با مشخصات جستجو شده یافت نشد.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuperAdmin = u.roles?.includes("SUPER_ADMIN");
                  const isActive = u.isActive || u.status === "ACTIVE";

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        !isActive ? "opacity-75 bg-rose-50/20 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs relative ${
                              isSuperAdmin
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-[#124A57]/15 text-[#124A57] dark:text-teal-400 border border-[#124A57]/20"
                            }`}
                          >
                            {u.firstName ? u.firstName[0] : "U"}
                            {isSuperAdmin && (
                              <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>
                                {u.firstName} {u.lastName}
                              </span>
                              {isSuperAdmin && (
                                <AdminBadge variant="warning" size="sm">
                                  مدیر ارشد
                                </AdminBadge>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ثبت: {formatPersianDate(u.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span dir="ltr">{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.roles?.map((roleName) => (
                            <AdminBadge
                              key={roleName}
                              variant={getRoleBadgeVariant(roleName)}
                              size="sm"
                            >
                              {getRoleDisplayName(roleName)}
                            </AdminBadge>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        <button
                          onClick={() => setStatusToggleCandidate(u)}
                          title="برای تغییر وضعیت کلیک کنید"
                          className="inline-flex items-center gap-1 group cursor-pointer focus:outline-none"
                        >
                          <AdminBadge
                            variant={isActive ? "success" : "danger"}
                            size="sm"
                            dot
                          >
                            {isActive ? "فعال" : "معلق"}
                          </AdminBadge>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {formatPersianDate(u.lastLoginAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-left">
                        <div className="flex items-center justify-end gap-1">
                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetPasswordCandidate(u);
                              setNewPassword("");
                            }}
                            title="بازنشانی رمز عبور"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="ویرایش کاربر"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#124A57] dark:hover:text-teal-400 hover:bg-[#124A57]/10 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteCandidate(u)}
                            title={isSuperAdmin ? "مدیر ارشد قابل حذف مستقیم نیست" : "حذف حساب کاربر"}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              صفحه {currentPage} از {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <AdminButton
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                قبلی
              </AdminButton>
              <AdminButton
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                بعدی
              </AdminButton>
            </div>
          </div>
        )}
      </AdminCard>

      {/* Create User Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="تعریف کاربر و مدیر جدید در سامانه"
        description="اطلاعات هویتی، رمز عبور و نقش‌های سازمانی کاربر را وارد نمایید."
        maxWidth="lg"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              انصراف
            </AdminButton>
            <AdminButton variant="primary" onClick={handleCreateUser} isLoading={isCreating}>
              ایجاد حساب کاربری
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام *
              </label>
              <input
                type="text"
                value={createFirstName}
                onChange={(e) => setCreateFirstName(e.target.value)}
                placeholder="مثلاً: علی"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام خانوادگی *
              </label>
              <input
                type="text"
                value={createLastName}
                onChange={(e) => setCreateLastName(e.target.value)}
                placeholder="مثلاً: رضایی"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ایمیل سازمانی (نام کاربری ورود) *
              </label>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="user@golmohamadi.com"
                required
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شماره همراه
              </label>
              <input
                type="text"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                placeholder="0912xxxxxxx"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              رمز عبور اولیه * (حداقل ۶ کاراکتر)
            </label>
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              dir="ltr"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              نقش‌های کاربری و دسترسی سازمانی *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              {rolesList.map((r) => {
                const isSelected = createSelectedRoles.includes(r.name);
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#124A57]/10 border-[#124A57]/40 dark:border-teal-500/50"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCreateSelectedRoles([...createSelectedRoles, r.name]);
                        } else {
                          setCreateSelectedRoles(
                            createSelectedRoles.filter((item) => item !== r.name)
                          );
                        }
                      }}
                      className="mt-0.5 rounded text-[#124A57] focus:ring-[#124A57]"
                    />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {r.title || r.name}
                      </div>
                      {r.description && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {r.description}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Edit User Modal */}
      <AdminModal
        isOpen={!!editUserCandidate}
        onClose={() => setEditUserCandidate(null)}
        title={`ویرایش حساب کاربری: ${editUserCandidate?.firstName} ${editUserCandidate?.lastName}`}
        description="تغییر اطلاعات فردی، نقش‌ها و وضعیت فعال بودن حساب."
        maxWidth="lg"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setEditUserCandidate(null)}
              disabled={isUpdating}
            >
              انصراف
            </AdminButton>
            <AdminButton variant="primary" onClick={handleUpdateUser} isLoading={isUpdating}>
              ذخیره تغییرات
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام *
              </label>
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام خانوادگی *
              </label>
              <input
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ایمیل سازمانی *
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شماره همراه
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              وضعیت حساب کاربری
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editStatus"
                  value="ACTIVE"
                  checked={editStatus === "ACTIVE"}
                  onChange={() => setEditStatus("ACTIVE")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  فعال (امکان ورود به پنل)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editStatus"
                  value="SUSPENDED"
                  checked={editStatus === "SUSPENDED"}
                  onChange={() => setEditStatus("SUSPENDED")}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  معلق / مسدود شده
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              نقش‌های اختصاص یافته
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              {rolesList.map((r) => {
                const isSelected = editSelectedRoles.includes(r.name);
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#124A57]/10 border-[#124A57]/40 dark:border-teal-500/50"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditSelectedRoles([...editSelectedRoles, r.name]);
                        } else {
                          setEditSelectedRoles(
                            editSelectedRoles.filter((item) => item !== r.name)
                          );
                        }
                      }}
                      className="mt-0.5 rounded text-[#124A57] focus:ring-[#124A57]"
                    />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {r.title || r.name}
                      </div>
                      {r.description && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {r.description}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Reset Password Modal */}
      <AdminModal
        isOpen={!!resetPasswordCandidate}
        onClose={() => setResetPasswordCandidate(null)}
        title="بازنشانی کلمه عبور کاربر"
        description={`تعیین رمز عبور جدید برای کاربر «${resetPasswordCandidate?.firstName} ${resetPasswordCandidate?.lastName}».`}
        maxWidth="sm"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setResetPasswordCandidate(null)}
              disabled={isResettingPassword}
            >
              انصراف
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleResetPassword}
              isLoading={isResettingPassword}
            >
              ثبت رمز جدید
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              رمز عبور جدید * (حداقل ۶ کاراکتر)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              dir="ltr"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            پس از ثبت، کاربر باید با رمز عبور جدید وارد پنل مدیریت شود.
          </p>
        </form>
      </AdminModal>

      {/* Status Toggle Confirmation */}
      <AdminConfirmDialog
        isOpen={!!statusToggleCandidate}
        onClose={() => setStatusToggleCandidate(null)}
        onConfirm={handleToggleStatus}
        title={
          statusToggleCandidate?.isActive || statusToggleCandidate?.status === "ACTIVE"
            ? "تعلیق و مسدودسازی حساب کاربری"
            : "فعال‌سازی مجدد حساب کاربری"
        }
        message={
          statusToggleCandidate?.isActive || statusToggleCandidate?.status === "ACTIVE"
            ? `آیا از تعلیق حساب کاربری «${statusToggleCandidate?.firstName} ${statusToggleCandidate?.lastName}» اطمینان دارید؟ دسترسی این کاربر بلافاصله به کلیه بخش‌های پنل مسدود خواهد شد.`
            : `آیا مایل به فعال‌سازی مجدد حساب «${statusToggleCandidate?.firstName} ${statusToggleCandidate?.lastName}» و برقراری دسترسی هستید؟`
        }
        confirmLabel={
          statusToggleCandidate?.isActive || statusToggleCandidate?.status === "ACTIVE"
            ? "تعلیق حساب"
            : "فعال‌سازی حساب"
        }
        isDanger={statusToggleCandidate?.isActive || statusToggleCandidate?.status === "ACTIVE"}
        isLoading={isTogglingStatus}
      />

      {/* Delete User Confirmation */}
      <AdminConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteUser}
        title="حذف دائمی حساب کاربری"
        message={`آیا از حذف حساب کاربری «${deleteCandidate?.firstName} ${deleteCandidate?.lastName}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="حذف کاربر"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
