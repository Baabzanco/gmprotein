import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { AdminConfirmDialog } from "../ui/AdminConfirmDialog";
import { showToast } from "../ui/AdminToast";
import { Users, Plus, RefreshCw, Shield, Trash2, CheckCircle2, XCircle } from "lucide-react";

export const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PRODUCT_MANAGER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (err) {
      showToast("خطا در بارگذاری کاربران", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !firstName.trim() || !lastName.trim()) {
      showToast("لطفاً کلیه فیلدهای مشخصات کاربر را وارد کنید.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createUser({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roles: [role],
      });

      showToast("کاربر جدید با موفقیت ایجاد شد.", "success");
      setIsModalOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "خطا در ایجاد کاربر", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const isCurrentlyActive = user.isActive !== undefined ? user.isActive : user.status === "ACTIVE";
      await adminService.updateUserStatus(user.id, !isCurrentlyActive);
      showToast("وضعیت کاربر تغییر کرد.", "success");
      fetchUsers();
    } catch (err: any) {
      showToast("خطا در تغییر وضعیت کاربر", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(deleteCandidate.id);
      showToast(`کاربر «${deleteCandidate.firstName} ${deleteCandidate.lastName}» حذف گردید.`, "success");
      setDeleteCandidate(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "خطا در حذف کاربر", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت کاربران و دسترسی‌ها</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعریف مدیران سامانه، کارشناسان کاتالوگ و نمایندگان فروش B2B
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchUsers}
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
            کاربر جدید
          </AdminButton>
        </div>
      </div>

      {/* Users Table */}
      <AdminCard
        title="فهرست پرسنل و کاربران دارای دسترسی"
        subtitle="حساب‌های کاربری متصل به سامانه احراز هویت RBAC"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">نام و نام خانوادگی</th>
                <th className="pb-3 font-semibold">ایمیل سازمانی</th>
                <th className="pb-3 font-semibold">نقش کاربری</th>
                <th className="pb-3 font-semibold">وضعیت حساب</th>
                <th className="pb-3 font-semibold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const roleNames = u.roles?.map((r: any) => r.name || r).join("، ") || "کاربر عادی";

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#124A57]/15 text-[#124A57] dark:text-teal-400 flex items-center justify-center font-bold">
                          {u.firstName ? u.firstName[0] : "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {u.firstName} {u.lastName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 font-mono text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>

                    <td className="py-3">
                      <AdminBadge variant="brand" size="sm">
                        {roleNames}
                      </AdminBadge>
                    </td>

                    <td className="py-3">
                      <button onClick={() => handleToggleStatus(u)} title="تغییر وضعیت">
                        <AdminBadge
                          variant={u.status === "ACTIVE" ? "success" : "danger"}
                          size="sm"
                          dot
                        >
                          {u.status === "ACTIVE" ? "فعال" : "معلق"}
                        </AdminBadge>
                      </button>
                    </td>

                    <td className="py-3 text-left">
                      <button
                        onClick={() => setDeleteCandidate(u)}
                        title="حذف کاربر"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Create Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تعریف کاربر جدید در سامانه"
        description="اطلاعات هویتی و نقش سطح دسترسی در پنل مدیریت را تعیین نمایید."
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
            <AdminButton variant="primary" onClick={handleCreateUser} isLoading={isSubmitting}>
              ایجاد حساب
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              ایمیل سازمانی *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@golmohamadi.com"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              رمز عبور اولیه *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۸ کاراکتر..."
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              نقش کاربری در سیستم
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="SUPER_ADMIN">مدیر ارشد کل (SUPER_ADMIN)</option>
              <option value="ADMIN">مدیر عملیات و سیستم (ADMIN)</option>
              <option value="PRODUCT_MANAGER">مدیر محصولات و قیمت‌گذاری (PRODUCT_MANAGER)</option>
              <option value="SALES_MANAGER">مدیر فروش و پیش‌فاکتورها (SALES_MANAGER)</option>
              <option value="CONTENT_MANAGER">مدیر محتوا و صفحات (CONTENT_MANAGER)</option>
              <option value="SUPPORT">کارشناس پشتیبانی و تماس‌ها (SUPPORT)</option>
              <option value="VIEWER">بیننده و ناظر گزارش‌ها (VIEWER)</option>
            </select>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteUser}
        title="تأیید حذف کاربر"
        message={`آیا از حذف حساب کاربری «${deleteCandidate?.firstName} ${deleteCandidate?.lastName}» اطمینان دارید؟`}
        confirmLabel="حذف کاربر"
        cancelLabel="انصراف"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
