import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { useRouter } from "../../../context/RouterContext";
import { useAuth } from "../../../context/AuthContext";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { showToast } from "../ui/AdminToast";
import {
  Package,
  FileSpreadsheet,
  MessageSquare,
  Flame,
  Plus,
  DollarSign,
  ArrowUpRight,
  Clock,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";

export const DashboardHomeView: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, quotesData, contactsData] = await Promise.all([
        adminService.getDashboardStats().catch(() => null),
        adminService.getQuotations().catch(() => []),
        adminService.getContacts().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setQuotations(quotesData.slice(0, 5));
      setContacts(contactsData.slice(0, 5));
    } catch (err) {
      showToast("خطا در بارگذاری اطلاعات داشبورد", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateQuotationStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateQuotationStatus(id, newStatus);
      showToast("وضعیت پیش‌فاکتور به‌روزرسانی شد.", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "خطا در تغییر وضعیت", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            درود، {user?.firstName || "مدیر گرامی"} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            خلاصه وضعیت سفارشات سازمانی، کاتالوگ فرآورده‌های پروتئینی و پیش‌فاکتورها
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            تازه‌سازی داده‌ها
          </AdminButton>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => navigate("/admin/prices")}
            icon={<DollarSign className="w-3.5 h-3.5 text-[#124A57]" />}
          >
            تغییر گروهی قیمت‌ها
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => navigate("/admin/products")}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            افزودن کالای جدید
          </AdminButton>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div
          onClick={() => navigate("/admin/products")}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#124A57]/50 dark:hover:border-teal-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              کل محصولات کاتالوگ
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#124A57]/10 text-[#124A57] dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.totalProducts ?? "—"}
            </span>
            <span className="text-xs text-slate-400">محصول فعال</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <span>{stats?.activeProducts ?? stats?.totalProducts ?? "—"} محصول موجود در انبار سردخانه</span>
          </div>
        </div>

        {/* Pending Quotations */}
        <div
          onClick={() => navigate("/admin/quotations")}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              پیش‌فاکتورهای نیازمند اقدام
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats?.pendingQuotations ?? 0}
            </span>
            <span className="text-xs text-slate-400">درخواست منتظر</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>از مجموع {stats?.totalQuotations ?? 0} پیش‌فاکتور ثبت‌شده</span>
          </div>
        </div>

        {/* Contact Requests */}
        <div
          onClick={() => navigate("/admin/contacts")}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-400/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              استعلام‌ها و پیام‌های جدید
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {stats?.newContacts ?? 0}
            </span>
            <span className="text-xs text-slate-400">پیام جدید</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>از مجموع {stats?.totalContacts ?? 0} پیام ارسالی مشتریان</span>
          </div>
        </div>

        {/* System & DB Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              وضعیت زیرساخت و سرور
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#CD78B3]/10 text-[#CD78B3] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stats?.databaseConnected ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {stats?.databaseConnected ? "پایگاه داده متصل" : "حالت ذخیره‌سازی ایزوله"}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>زمان سرور: {new Date().toLocaleTimeString("fa-IR")}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column: Recent Quotations */}
        <div className="lg:col-span-8 space-y-4">
          <AdminCard
            title="آخرین استعلام‌های پیش‌فاکتور سازمانی"
            subtitle="درخواست‌های خرید عمده رستوران‌ها و هتل‌ها"
            action={
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/quotations")}
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                مشاهده همه
              </AdminButton>
            }
          >
            {quotations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                هنوز هیچ درخواست پیش‌فاکتوری ثبت نشده است.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="pb-3 font-semibold">کد پیگیری</th>
                      <th className="pb-3 font-semibold">متقاضی / شرکت</th>
                      <th className="pb-3 font-semibold">تعداد اقلام</th>
                      <th className="pb-3 font-semibold">وضعیت</th>
                      <th className="pb-3 font-semibold text-left">اقدام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quotations.map((q) => {
                      const statusVariant =
                        q.status === "PENDING"
                          ? "warning"
                          : q.status === "QUOTED" || q.status === "ACCEPTED"
                          ? "success"
                          : "neutral";

                      const statusLabel =
                        q.status === "PENDING"
                          ? "در انتظار بررسی"
                          : q.status === "REVIEWING"
                          ? "در حال بررسی"
                          : q.status === "QUOTED"
                          ? "قیمت‌گذاری شده"
                          : q.status === "ACCEPTED"
                          ? "تأیید شده"
                          : q.status;

                      return (
                        <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 font-mono font-bold text-[#124A57] dark:text-teal-400">
                            {q.trackingCode}
                          </td>
                          <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                            <div>{q.fullName}</div>
                            {q.company && (
                              <div className="text-[10px] text-slate-400">{q.company}</div>
                            )}
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">
                            {q.items?.length || 0} قلم
                          </td>
                          <td className="py-3">
                            <AdminBadge variant={statusVariant} size="sm" dot>
                              {statusLabel}
                            </AdminBadge>
                          </td>
                          <td className="py-3 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              {q.status === "PENDING" && (
                                <button
                                  onClick={() => handleUpdateQuotationStatus(q.id, "REVIEWING")}
                                  className="text-[11px] font-bold text-[#124A57] dark:text-teal-400 hover:underline px-2 py-1 rounded bg-[#124A57]/10"
                                >
                                  شروع بررسی
                                </button>
                              )}
                              <button
                                onClick={() => navigate("/admin/quotations")}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="مشاهده جزئیات"
                              >
                                <Eye className="w-3.5 h-3.5" />
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
        </div>

        {/* Right Column: Recent Contact Inquiries & Quick Status */}
        <div className="lg:col-span-4 space-y-6">
          <AdminCard
            title="پیام‌های اخیر تماس"
            subtitle="استعلام‌ها و درخواست‌های همکاری"
            action={
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/contacts")}
              >
                همه
              </AdminButton>
            }
          >
            {contacts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                پیامی دریافت نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate("/admin/contacts")}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.name}
                      </span>
                      <AdminBadge
                        variant={c.status === "NEW" ? "warning" : "success"}
                        size="sm"
                      >
                        {c.status === "NEW" ? "جدید" : "پاسخ داده شد"}
                      </AdminBadge>
                    </div>
                    <div className="text-[11px] font-medium text-[#124A57] dark:text-teal-400 truncate">
                      {c.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {c.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#124A57]/15 to-[#CD78B3]/10 border border-[#124A57]/20 text-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#CD78B3]" />
              <span>پروتکل امنیت داده‌ها فعال است</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              تمام رویدادهای حذف کالا، تغییر قیمت و صدور پیش‌فاکتور با شناسه کاربری و برچسب زمانی غیرقابل ویرایش در سامانه Audit Trail ثبت می‌گردند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
