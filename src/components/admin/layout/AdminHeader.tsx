import React, { useState } from "react";
import { useRouter } from "../../../context/RouterContext";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  Menu,
  Sun,
  Moon,
  ExternalLink,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  databaseConnected?: boolean;
  pendingQuotationsCount?: number;
  newContactsCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileMenu,
  databaseConnected = true,
  pendingQuotationsCount = 0,
  newContactsCount = 0,
}) => {
  const { path, navigate } = useRouter();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive title from current path
  const getPageTitle = (p: string) => {
    if (p.includes("/products")) return "مدیریت کاتالوگ و محصولات";
    if (p.includes("/categories")) return "مدیریت دسته‌بندی‌ها";
    if (p.includes("/prices")) return "مدیریت قیمت‌ها و تغییر دسته‌ای";
    if (p.includes("/discounts")) return "مدیریت کوپن‌ها و تخفیف‌ها";
    if (p.includes("/campaigns")) return "کمپین‌ها و جشنواره‌های فصلی";
    if (p.includes("/quotations")) return "بررسی و صدور پیش‌فاکتورهای رسمی";
    if (p.includes("/contacts")) return "استعلام‌ها و پیام‌های ارتباطی";
    if (p.includes("/orders")) return "سفارش‌ها و اتصال به ERP";
    if (p.includes("/content")) return "مدیریت محتوا و پورتال عمومی";
    if (p.includes("/users")) return "مدیریت کاربران و دسترسی‌ها";
    if (p.includes("/roles")) return "نقش‌ها و ماتریس دسترسی";
    if (p.includes("/reports")) return "گزارش‌های آماری و عملکردی";
    if (p.includes("/audit-logs")) return "ردپای امنیتی رویدادها (Audit Trail)";
    if (p.includes("/system-logs")) return "لاگ‌های سیستمی و سرور";
    if (p.includes("/settings")) return "تنظیمات عمومی پلتفرم";
    return "میز کار و داشبورد جامع";
  };

  const totalAlerts = pendingQuotationsCount + newContactsCount;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Right side: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="باز کردن منو"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
            {getPageTitle(path)}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>پنل مدیریت B2B</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  databaseConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {databaseConnected ? "پایگاه داده متصل" : "حالت ذخیره‌سازی ایزوله"}
            </span>
          </div>
        </div>
      </div>

      {/* Left side: Search, Theme Toggle, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick View Public Website */}
        <button
          onClick={() => navigate("/")}
          className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-[#124A57] dark:hover:text-teal-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span>مشاهده سایت</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="تغییر تم"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? "حالت روشن" : "حالت تاریک"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="اعلان‌ها"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CD78B3] ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 space-y-2 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>اعلان‌های سیستم</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {totalAlerts} مورد نیازمند بررسی
                </span>
              </div>

              {pendingQuotationsCount > 0 ? (
                <div
                  onClick={() => {
                    navigate("/admin/quotations");
                    setShowNotifications(false);
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {pendingQuotationsCount} پیش‌فاکتور جدید در انتظار بررسی
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      برای ثبت قیمت نهایی یا تأیید کلیک کنید.
                    </div>
                  </div>
                </div>
              ) : null}

              {newContactsCount > 0 ? (
                <div
                  onClick={() => {
                    navigate("/admin/contacts");
                    setShowNotifications(false);
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {newContactsCount} پیام تماس جدید
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      استعلام همکاری یا پیام از فرم تماس دریافت شده است.
                    </div>
                  </div>
                </div>
              ) : null}

              {totalAlerts === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  هیچ اعلان یا اقدام معوقه‌ای وجود ندارد.
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#124A57] text-[#CD78B3] flex items-center justify-center font-bold text-xs">
              {user?.firstName ? user.firstName[0] : "A"}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {user ? `${user.firstName}` : "مدیر"}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user ? `${user.firstName} ${user.lastName}` : "مدیر سیستم"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>

              <button
                onClick={() => {
                  navigate("/admin/settings");
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-right"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>تنظیمات پروفایل</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-right"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج از حساب</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
