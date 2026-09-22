import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { showToast } from "../ui/AdminToast";
import { History, RefreshCw, ShieldAlert, Terminal } from "lucide-react";

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      showToast("خطا در بارگذاری لاگ‌های امنیتی", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>ردپای امنیتی رویدادها (Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ثبت غیرقابل تغییر تمامی رویدادهای تغییر قیمت، حذف محصول و ورود به پنل
          </p>
        </div>

        <AdminButton
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          تازه‌سازی
        </AdminButton>
      </div>

      {/* Logs Table */}
      <AdminCard
        title="رویدادهای ثبت‌شده در سرور"
        subtitle="شامل نشانی IP، کاربر مجری، زمان رویداد و جزئیات عملیات"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">شناسه رویداد</th>
                <th className="pb-3 font-semibold">نوع عملیات (Action)</th>
                <th className="pb-3 font-semibold">موجودیت (Entity)</th>
                <th className="pb-3 font-semibold">کاربر مجری</th>
                <th className="pb-3 font-semibold">نشانی IP</th>
                <th className="pb-3 font-semibold">تاریخ و ساعت</th>
                <th className="pb-3 font-semibold">جزئیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {log.id.slice(0, 12)}...
                  </td>

                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-[#124A57] dark:text-teal-400">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                    {log.entity}
                  </td>

                  <td className="py-3 text-slate-800 dark:text-slate-200">
                    {log.userEmail || "سیستم"}
                  </td>

                  <td className="py-3 font-mono text-slate-400 text-[11px]">
                    {log.ipAddress || "127.0.0.1"}
                  </td>

                  <td className="py-3 font-mono text-slate-400 text-[11px]">
                    {new Date(log.createdAt).toLocaleString("fa-IR")}
                  </td>

                  <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[10px] max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
};
