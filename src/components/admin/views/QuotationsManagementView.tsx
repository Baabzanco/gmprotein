import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { showToast } from "../ui/AdminToast";
import {
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Clock,
} from "lucide-react";

export const QuotationsManagementView: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Inspection Modal
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getQuotations();
      setQuotations(data || []);
    } catch (err) {
      showToast("خطا در بارگذاری پیش‌فاکتورها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const openInspection = (q: any) => {
    setSelectedQuotation(q);
    setNewStatus(q.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedQuotation || !newStatus) return;

    setIsUpdatingStatus(true);
    try {
      await adminService.updateQuotationStatus(selectedQuotation.id, newStatus);
      showToast("وضعیت پیش‌فاکتور با موفقیت به‌روزرسانی شد.", "success");
      setSelectedQuotation({ ...selectedQuotation, status: newStatus });
      fetchQuotations();
    } catch (err: any) {
      showToast(err.message || "خطا در تغییر وضعیت", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      q.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.company && q.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      q.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "ALL" || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <AdminBadge variant="warning" size="sm" dot>در انتظار بررسی</AdminBadge>;
      case "REVIEWING":
        return <AdminBadge variant="info" size="sm" dot>در حال بررسی فنی</AdminBadge>;
      case "QUOTED":
        return <AdminBadge variant="brand" size="sm" dot>پیش‌فاکتور صادر شد</AdminBadge>;
      case "ACCEPTED":
        return <AdminBadge variant="success" size="sm" dot>تأیید نهایی مشتری</AdminBadge>;
      case "REJECTED":
        return <AdminBadge variant="danger" size="sm" dot>رد شده</AdminBadge>;
      case "CANCELLED":
        return <AdminBadge variant="neutral" size="sm" dot>لغو شده</AdminBadge>;
      default:
        return <AdminBadge variant="neutral" size="sm">{status}</AdminBadge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت و صدور پیش‌فاکتورهای رسمی</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            بررسی استعلام‌های خرید عمده رستوران‌ها، تالارها و هتل‌های طرف قرارداد
          </p>
        </div>

        <AdminButton
          variant="outline"
          size="sm"
          onClick={fetchQuotations}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          تازه‌سازی
        </AdminButton>
      </div>

      {/* Search & Filter */}
      <AdminCard bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با کد پیگیری، نام مشتری، نام شرکت یا شماره تماس..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
            >
              <option value="ALL">همه وضعیت‌ها</option>
              <option value="PENDING">در انتظار بررسی</option>
              <option value="REVIEWING">در حال بررسی فنی</option>
              <option value="QUOTED">قیمت‌گذاری شده</option>
              <option value="ACCEPTED">تأیید نهایی شده</option>
              <option value="REJECTED">رد شده</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Quotations Table */}
      <AdminCard
        title={
          <div className="flex items-center gap-2">
            <span>درخواست‌های ثبت‌شده</span>
            <AdminBadge variant="neutral" size="sm">
              {filteredQuotations.length} مورد
            </AdminBadge>
          </div>
        }
        subtitle="فهرست رسمی استعلام‌های پیش‌فاکتور با امکان بازبینی ریز اقلام"
      >
        {filteredQuotations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            پیش‌فاکتوری مطابق معیارهای جستجو یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">کد پیگیری</th>
                  <th className="pb-3 font-semibold">متقاضی / شرکت</th>
                  <th className="pb-3 font-semibold">شماره تماس</th>
                  <th className="pb-3 font-semibold">تعداد اقلام</th>
                  <th className="pb-3 font-semibold">تاریخ ثبت</th>
                  <th className="pb-3 font-semibold">وضعیت</th>
                  <th className="pb-3 font-semibold text-left">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredQuotations.map((q) => (
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

                    <td className="py-3 font-mono text-slate-600 dark:text-slate-300">
                      {q.phone}
                    </td>

                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {q.items?.length || 0} ردیف کالا
                    </td>

                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(q.createdAt).toLocaleDateString("fa-IR")}
                    </td>

                    <td className="py-3">
                      {getStatusBadge(q.status)}
                    </td>

                    <td className="py-3 text-left">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        onClick={() => openInspection(q)}
                        icon={<Eye className="w-3.5 h-3.5 text-[#124A57]" />}
                      >
                        بررسی و تعیین وضعیت
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Inspection Modal */}
      <AdminModal
        isOpen={!!selectedQuotation}
        onClose={() => setSelectedQuotation(null)}
        title={
          <div className="flex items-center gap-2">
            <span>جزئیات پیش‌فاکتور رسمی</span>
            <span className="font-mono text-[#124A57] dark:text-teal-400">
              #{selectedQuotation?.trackingCode}
            </span>
          </div>
        }
        description="بررسی اطلاعات خریدار، اقلام درخواستی و تغییر وضعیت گردش کار"
        maxWidth="2xl"
        footer={
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                تغییر وضعیت:
              </span>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="PENDING">در انتظار بررسی (PENDING)</option>
                <option value="REVIEWING">در حال بررسی فنی (REVIEWING)</option>
                <option value="QUOTED">صدور پیش‌فاکتور (QUOTED)</option>
                <option value="ACCEPTED">تأیید نهایی مشتری (ACCEPTED)</option>
                <option value="REJECTED">رد درخواست (REJECTED)</option>
                <option value="CANCELLED">لغو شده (CANCELLED)</option>
              </select>
              <AdminButton
                variant="primary"
                size="sm"
                onClick={handleUpdateStatus}
                isLoading={isUpdatingStatus}
              >
                ثبت وضعیت
              </AdminButton>
            </div>

            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setSelectedQuotation(null)}
            >
              بستن
            </AdminButton>
          </div>
        }
      >
        {selectedQuotation && (
          <div className="space-y-6 text-xs">
            {/* Customer Details Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="font-bold">نام متقاضی:</span>
                  <span>{selectedQuotation.fullName}</span>
                </div>
                {selectedQuotation.company && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold">مجموعه / شرکت:</span>
                    <span>{selectedQuotation.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedQuotation.phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedQuotation.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedQuotation.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">نشانی تحویل: </span>
                    <span>{selectedQuotation.address || "قید نشده"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requested Items Table */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                اقلام و اوزان درخواستی
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                    <tr>
                      <th className="p-2.5 font-semibold">ردیف</th>
                      <th className="p-2.5 font-semibold">نام برش / کالا</th>
                      <th className="p-2.5 font-semibold">مقدار درخواستی</th>
                      <th className="p-2.5 font-semibold">توضیحات و برش اختصاصی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedQuotation.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                          {item.productName || item.productId}
                        </td>
                        <td className="p-2.5 font-semibold text-[#124A57] dark:text-teal-400">
                          {item.requestedWeight} {item.unit || "کیلوگرم"}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400">
                          {item.notes || "برش استاندارد رستورانی"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Notes */}
            {selectedQuotation.notes && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs">
                <div className="font-bold mb-1">یادداشت خریدار:</div>
                <p className="leading-relaxed">{selectedQuotation.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
};
