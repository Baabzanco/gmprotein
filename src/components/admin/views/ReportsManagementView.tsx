import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { showToast } from "../ui/AdminToast";
import { BarChart3, Download, TrendingUp, Package, Users, FileSpreadsheet } from "lucide-react";

export const ReportsManagementView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [s, q, p] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getQuotations(),
          adminService.getProducts(),
        ]);
        setStats(s);
        setQuotations(q || []);
        setProducts(p || []);
      } catch (err) {
        showToast("خطا در بارگذاری داده‌های گزارش", "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCSV = () => {
    if (quotations.length === 0) {
      showToast("داده‌ای جهت استخراج وجود ندارد.", "warning");
      return;
    }

    const headers = "کد پیگیری,متقاضی,شرکت,شماره تماس,وضعیت,تاریخ ثبت\n";
    const rows = quotations
      .map(
        (q) =>
          `"${q.trackingCode}","${q.fullName}","${q.company || ""}","${q.phone}","${q.status}","${q.createdAt}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `quotations-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("فایل گزارش با فرمت CSV دانلود شد.", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>گزارش‌های تحلیلی و آمار تجاری</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تحلیل تقاضای بازار، عملکرد فروش و استخراج گزارش پیش‌فاکتورها
          </p>
        </div>

        <AdminButton
          variant="primary"
          onClick={handleExportCSV}
          icon={<Download className="w-4 h-4" />}
        >
          خروجی اکسل / CSV پیش‌فاکتورها
        </AdminButton>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard title="توزیع وضعیت پیش‌فاکتورها">
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300 font-semibold">
                <span>در انتظار بررسی فنی</span>
                <span>{stats?.pendingQuotations || 0} مورد</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${
                      stats?.totalQuotations
                        ? Math.min(100, (stats.pendingQuotations / stats.totalQuotations) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300 font-semibold">
                <span>تأیید نهایی و آماده تحویل</span>
                <span>
                  {quotations.filter((q) => q.status === "ACCEPTED" || q.status === "QUOTED").length} مورد
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "70%" }} />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="تقاضای کاتالوگ بر حسب رده">
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300 font-semibold">
                <span>برش‌های استیک و فیله ممتاز</span>
                <span>۵۵٪</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#124A57] dark:bg-teal-500 h-full rounded-full" style={{ width: "55%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300 font-semibold">
                <span>فرآورده‌های مرینیت رستورانی</span>
                <span>۳۰٪</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#CD78B3] h-full rounded-full" style={{ width: "30%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300 font-semibold">
                <span>لاشه‌های کامل و شقه</span>
                <span>۱۵٪</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: "15%" }} />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="کیفیت خدمات و زنجیره سرد">
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <div className="font-bold">شاخص تحویل بموقع (On-Time):</div>
              <div className="text-xl font-black mt-1 font-mono">۹۹.۴٪</div>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300">
              <div className="font-bold">رعایت پیوسته زنجیره انجماد:</div>
              <div className="text-xl font-black mt-1 font-mono">۱۰۰٪</div>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
};
