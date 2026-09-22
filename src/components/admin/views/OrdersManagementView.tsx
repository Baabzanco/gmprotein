import React, { useState } from "react";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { showToast } from "../ui/AdminToast";
import { ShoppingBag, Truck, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";

export const OrdersManagementView: React.FC = () => {
  const [orders, setOrders] = useState([
    {
      id: "ORD-2026-9041",
      customer: "هتل اسپیناس پالاس",
      items: "فیله گوساله ۲۵۰ کیلوگرم، استیک تی‌بون ۱۵۰ کیلوگرم",
      total: 340000000,
      paymentStatus: "PAID",
      fulfillment: "IN_TRANSIT",
      tempStatus: "-18°C (زنجیره سرد استاندارد)",
      date: "۱۴۰۴/۱۲/۲۲",
    },
    {
      id: "ORD-2026-9042",
      customer: "رستوران بین‌المللی ارکیده",
      items: "ریب‌آی مرینیت‌شده ۸۰ کیلوگرم",
      total: 76000000,
      paymentStatus: "CREDIT_30_DAYS",
      fulfillment: "PREPARING",
      tempStatus: "-20°C (در حال سورتینگ)",
      date: "۱۴۰۴/۱۲/۲۲",
    },
    {
      id: "ORD-2026-9038",
      customer: "مجموعه غذایی شاندیز جردن",
      items: "شیشلیک گوسفندی ۱۲۰ کیلوگرم، فیله بره ۶۰ کیلوگرم",
      total: 185000000,
      paymentStatus: "PAID",
      fulfillment: "DELIVERED",
      tempStatus: "تحویل موفق سردخانه‌ای",
      date: "۱۴۰۴/۱۲/۲۰",
    },
  ]);

  const handleUpdateFulfillment = (orderId: string, nextStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, fulfillment: nextStatus } : o))
    );
    showToast(`وضعیت سفارش ${orderId} به‌روز شد.`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>سفارش‌ها و یکپارچه‌سازی ERP</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            پیگیری سفارشات قطعی، زنجیره سرد و اتصال به سیستم انبارداری و پخش
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>اتصال نرم‌افزار پخش و انبار: فعال (ERP Sync)</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <AdminCard
        title="فهرست محموله‌های سازمانی"
        subtitle="سفارشات قطعی شده جهت بارگیری با ناوگان مجهز به ثبت دمای هوشمند"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">شناسه سفارش</th>
                <th className="pb-3 font-semibold">مشتری</th>
                <th className="pb-3 font-semibold">اقلام تحویلی</th>
                <th className="pb-3 font-semibold">مبلغ کل (تومان)</th>
                <th className="pb-3 font-semibold">وضعیت تسویه</th>
                <th className="pb-3 font-semibold">پایش زنجیره سرد</th>
                <th className="pb-3 font-semibold">وضعیت ارسال</th>
                <th className="pb-3 font-semibold text-left">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 font-mono font-bold text-[#124A57] dark:text-teal-400">
                    {o.id}
                  </td>

                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                    {o.customer}
                  </td>

                  <td className="py-3 text-slate-600 dark:text-slate-300 max-w-xs">
                    {o.items}
                  </td>

                  <td className="py-3 font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {o.total.toLocaleString("fa-IR")}
                  </td>

                  <td className="py-3">
                    <AdminBadge
                      variant={o.paymentStatus === "PAID" ? "success" : "info"}
                      size="sm"
                    >
                      {o.paymentStatus === "PAID" ? "تسویه شده" : "اعتباری ۳۰ روزه"}
                    </AdminBadge>
                  </td>

                  <td className="py-3 text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                    {o.tempStatus}
                  </td>

                  <td className="py-3">
                    <AdminBadge
                      variant={
                        o.fulfillment === "DELIVERED"
                          ? "success"
                          : o.fulfillment === "IN_TRANSIT"
                          ? "brand"
                          : "warning"
                      }
                      size="sm"
                      dot
                    >
                      {o.fulfillment === "DELIVERED"
                        ? "تحویل نهایی شد"
                        : o.fulfillment === "IN_TRANSIT"
                        ? "در مسیر تحویل"
                        : "آماده‌سازی سردخانه"}
                    </AdminBadge>
                  </td>

                  <td className="py-3 text-left">
                    {o.fulfillment === "PREPARING" && (
                      <button
                        onClick={() => handleUpdateFulfillment(o.id, "IN_TRANSIT")}
                        className="text-[11px] font-bold text-[#124A57] dark:text-teal-400 hover:underline px-2 py-1 rounded bg-[#124A57]/10"
                      >
                        بارگیری خودرو
                      </button>
                    )}
                    {o.fulfillment === "IN_TRANSIT" && (
                      <button
                        onClick={() => handleUpdateFulfillment(o.id, "DELIVERED")}
                        className="text-[11px] font-bold text-emerald-600 hover:underline px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40"
                      >
                        ثبت تحویل
                      </button>
                    )}
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
