import React from "react";
import { AdminCard } from "../ui/AdminCard";
import { AdminBadge } from "../ui/AdminBadge";
import { Shield, Check, X } from "lucide-react";

export const RolesPermissionsView: React.FC = () => {
  const roles = [
    { key: "SUPER_ADMIN", title: "مدیر کل (Super Admin)", color: "brand" },
    { key: "ADMIN", title: "مدیر ارشد (Admin)", color: "info" },
    { key: "PRODUCT_MANAGER", title: "مدیر محصولات", color: "neutral" },
    { key: "SALES_MANAGER", title: "مدیر فروش", color: "warning" },
    { key: "CONTENT_MANAGER", title: "مدیر محتوا", color: "neutral" },
    { key: "SUPPORT", title: "پشتیبانی", color: "info" },
    { key: "VIEWER", title: "بیننده", color: "neutral" },
  ];

  const permissions = [
    {
      title: "مشاهده داشبورد و آمار تجمیعی",
      roles: ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "SALES_MANAGER", "CONTENT_MANAGER", "SUPPORT", "VIEWER"],
    },
    {
      title: "مشاهده محصولات و کاتالوگ",
      roles: ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "SALES_MANAGER", "VIEWER"],
    },
    {
      title: "افزودن و ویرایش کاتالوگ محصولات",
      roles: ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"],
    },
    {
      title: "حذف محصولات و برش‌های گوشت",
      roles: ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"],
    },
    {
      title: "تغییر گروهی و درصدی قیمت‌ها (Bulk Price)",
      roles: ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"],
    },
    {
      title: "تعریف کوپن‌ها و کدهای تخفیف",
      roles: ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"],
    },
    {
      title: "ایجاد و ویرایش کمپین‌های فصلی",
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "PRODUCT_MANAGER"],
    },
    {
      title: "مشاهده پیش‌فاکتورهای استعلامی",
      roles: ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SUPPORT", "VIEWER"],
    },
    {
      title: "تغییر وضعیت و صدور پیش‌فاکتور رسمی",
      roles: ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"],
    },
    {
      title: "مشاهده پیام‌ها و درخواست‌های تماس",
      roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT", "SALES_MANAGER"],
    },
    {
      title: "پاسخ و به‌روزرسانی وضعیت پیام‌های تماس",
      roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
    },
    {
      title: "ویرایش محتوای متنی و رسانه‌ای صفحات (CMS)",
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"],
    },
    {
      title: "مدیریت کاربران، ثبت پرسنل و تعلیق حساب",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      title: "حذف دائم حساب کاربری پرسنل",
      roles: ["SUPER_ADMIN"],
    },
    {
      title: "مشاهده لاگ‌های امنیتی و عملیاتی (Audit Trail)",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      title: "مشاهده لاگ‌های فنی و سیستمی سرور (System Logs)",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      title: "تغییر تنظیمات عمومی سامانه و نام برند",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
          <span>ماتریس نقش‌ها و کنترل دسترسی (RBAC Matrix)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          سیاست‌های امنیتی دسترسی به ماژول‌های مختلف بر اساس نقش اختصاص‌یافته در توکن JWT
        </p>
      </div>

      {/* Matrix Card */}
      <AdminCard
        title="ماتریس جامع دسترسی‌های سازمانی"
        subtitle="بررسی مجوزهای مجاز برای هر یک از نقش‌های تعریف‌شده در هسته پلتفرم"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="pb-3 pr-2 font-semibold">عنوان مجوز و عملیات</th>
                {roles.map((r) => (
                  <th key={r.key} className="pb-3 text-center font-semibold">
                    <AdminBadge variant={r.color as any} size="sm">
                      {r.title}
                    </AdminBadge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 pr-2 font-medium text-slate-800 dark:text-slate-200">
                    {p.title}
                  </td>
                  {roles.map((r) => {
                    const hasAccess = p.roles.includes(r.key);
                    return (
                      <td key={r.key} className="py-3 text-center">
                        {hasAccess ? (
                          <div className="inline-flex w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="inline-flex w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 items-center justify-center">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
};
