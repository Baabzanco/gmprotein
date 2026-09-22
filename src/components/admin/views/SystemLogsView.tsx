import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { showToast } from "../ui/AdminToast";
import { Terminal, RefreshCw, Trash2, Filter } from "lucide-react";

export const SystemLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("ALL");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSystemLogs();
      setLogs(data || []);
    } catch (err) {
      showToast("خطا در بارگذاری لاگ‌های سیستمی", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) => levelFilter === "ALL" || l.level === levelFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>لاگ‌های سیستمی سرور (System Logs)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            خروجی خطاهای سرور Express، وضعیت درخواست‌های HTTP و پیام‌های داخلی پلتفرم
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">همه سطوح</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          <AdminButton
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            تازه‌سازی
          </AdminButton>
        </div>
      </div>

      {/* Terminal Display */}
      <div className="bg-[#071318] border border-[#1b434e] rounded-2xl p-5 shadow-2xl overflow-hidden font-mono text-xs text-slate-300">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1b434e] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="mr-2 text-[11px] text-slate-400">pg-server.log — stdout</span>
          </div>
          <span>{filteredLogs.length} خط</span>
        </div>

        <div className="space-y-1.5 max-h-[500px] overflow-y-auto ltr text-left">
          {filteredLogs.map((log) => {
            const levelColor =
              log.level === "ERROR"
                ? "text-rose-400 bg-rose-950/40"
                : log.level === "WARN"
                ? "text-amber-400 bg-amber-950/40"
                : "text-emerald-400 bg-emerald-950/30";

            return (
              <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/40 p-1 rounded">
                <span className="text-slate-600 shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${levelColor} shrink-0`}>
                  {log.level}
                </span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
