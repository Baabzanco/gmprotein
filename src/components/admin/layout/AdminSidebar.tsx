import React from "react";
import { useRouter } from "../../../context/RouterContext";
import { useAuth } from "../../../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  DollarSign,
  Tag,
  Flame,
  FileSpreadsheet,
  MessageSquare,
  ShoppingBag,
  FileText,
  BookOpen,
  Users,
  Shield,
  BarChart3,
  History,
  Terminal,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  pendingQuotationsCount?: number;
  newContactsCount?: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  pendingQuotationsCount = 0,
  newContactsCount = 0,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { path, navigate } = useRouter();
  const { user, logout, canAccess } = useAuth();

  const handleNav = (targetPath: string) => {
    navigate(targetPath);
    setIsMobileOpen(false);
  };

  interface NavItem {
    title: string;
    path: string;
    icon: React.ReactNode;
    permissionKey: string;
    badge?: number;
    badgeColor?: string;
  }

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: "اصلی",
      items: [
        {
          title: "داشبورد مدیریت",
          path: "/admin/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
          permissionKey: "dashboard",
        },
      ],
    },
    {
      label: "کاتالوگ و کالاها",
      items: [
        {
          title: "محصولات و موجودی",
          path: "/admin/products",
          icon: <Package className="w-4 h-4" />,
          permissionKey: "products",
        },
        {
          title: "دسته‌بندی‌ها",
          path: "/admin/categories",
          icon: <FolderTree className="w-4 h-4" />,
          permissionKey: "categories",
        },
      ],
    },
    {
      label: "قیمت‌گذاری و تخفیف‌ها",
      items: [
        {
          title: "مدیریت قیمت و تغییر دسته‌ای",
          path: "/admin/prices",
          icon: <DollarSign className="w-4 h-4" />,
          permissionKey: "prices",
        },
        {
          title: "کوپن‌ها و تخفیف‌ها",
          path: "/admin/discounts",
          icon: <Tag className="w-4 h-4" />,
          permissionKey: "discounts",
        },
        {
          title: "کمپین‌های فصلی",
          path: "/admin/campaigns",
          icon: <Flame className="w-4 h-4" />,
          permissionKey: "campaigns",
        },
      ],
    },
    {
      label: "ارتباطات",
      items: [
        {
          title: "پیام‌ها و استعلام تماس",
          path: "/admin/contacts",
          icon: <MessageSquare className="w-4 h-4" />,
          badge: newContactsCount > 0 ? newContactsCount : undefined,
          badgeColor: "emerald",
          permissionKey: "contacts",
        },
      ],
    },
    {
      label: "محتوا و پورتال",
      items: [
        {
          title: "مدیریت صفحات و لندینگ",
          path: "/admin/content",
          icon: <FileText className="w-4 h-4" />,
          permissionKey: "content",
        },
        {
          title: "کتابخانه رسانه‌ها",
          path: "/admin/media",
          icon: <ImageIcon className="w-4 h-4" />,
          permissionKey: "media",
        },
        {
          title: "وبلاگ و مقالات",
          path: "/admin/blog",
          icon: <BookOpen className="w-4 h-4" />,
          permissionKey: "content",
        },
      ],
    },
    {
      label: "کاربران و امنیت",
      items: [
        {
          title: "کاربران سیستم",
          path: "/admin/users",
          icon: <Users className="w-4 h-4" />,
          permissionKey: "users",
        },
        {
          title: "نقش‌ها و دسترسی‌ها",
          path: "/admin/roles",
          icon: <Shield className="w-4 h-4" />,
          permissionKey: "roles",
        },
      ],
    },
    {
      label: "نظارت و سیستم",
      items: [
        {
          title: "گزارش‌های تحلیلی",
          path: "/admin/reports",
          icon: <BarChart3 className="w-4 h-4" />,
          permissionKey: "reports",
        },
        {
          title: "لاگ تغییرات (Audit)",
          path: "/admin/audit-logs",
          icon: <History className="w-4 h-4" />,
          permissionKey: "audit-logs",
        },
        {
          title: "لاگ‌های سیستمی",
          path: "/admin/system-logs",
          icon: <Terminal className="w-4 h-4" />,
          permissionKey: "system-logs",
        },
        {
          title: "تنظیمات عمومی",
          path: "/admin/settings",
          icon: <Settings className="w-4 h-4" />,
          permissionKey: "settings",
        },
      ],
    },
  ];

  const primaryRole = user?.roles?.[0] || "کاربر سیستم";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 bg-white dark:bg-[#124A57] border-l border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        } ${
          isMobileOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Brand Bar */}
        <div className="h-16 px-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
          <div
            onClick={() => handleNav("/admin/dashboard")}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0E353E] dark:bg-black/40 flex items-center justify-center font-black text-white shrink-0 shadow-sm border border-[#CD78B3]/50">
              <span className="text-xs text-[#CD78B3]">PG</span>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                  پروتئین گلمحمدی
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-300 font-mono tracking-wider">
                  مدیریت پلتفرم B2B
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title={isCollapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) =>
              canAccess(item.permissionKey)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 dark:text-slate-200/70 uppercase tracking-wider">
                    {group.label}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const isActive =
                    path === item.path ||
                    (item.path !== "/admin/dashboard" && path.startsWith(item.path));

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      title={isCollapsed ? item.title : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#124A57] text-white shadow-xs dark:bg-black/40 dark:border dark:border-[#CD78B3]/60 dark:text-white"
                          : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`shrink-0 ${isActive ? "text-[#CD78B3]" : "text-slate-400 dark:text-slate-300"}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.badgeColor === "amber"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-white/10 space-y-2 shrink-0 bg-slate-50/50 dark:bg-black/20">
          <button
            onClick={() => handleNav("/")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-[#124A57] dark:hover:text-teal-400 hover:bg-white dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/15 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="مشاهده وب‌سایت عمومی"
          >
            <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-300 shrink-0" />
            {!isCollapsed && <span>مشاهده وب‌سایت عمومی</span>}
          </button>

          <div
            className={`flex items-center justify-between p-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200/80 dark:border-white/15 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                {user?.firstName ? user.firstName[0] : "A"}
              </div>
              {!isCollapsed && (
                <div className="truncate text-right">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user ? `${user.firstName} ${user.lastName}` : "مدیر سیستم"}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-300 font-mono truncate">
                    {primaryRole}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="خروج از حساب"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
