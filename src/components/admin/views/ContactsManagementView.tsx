import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { AdminBadge } from "../ui/AdminBadge";
import { AdminModal } from "../ui/AdminModal";
import { showToast } from "../ui/AdminToast";
import {
  MessageSquare,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Archive,
} from "lucide-react";

export const ContactsManagementView: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getContacts();
      setContacts(data || []);
    } catch (err) {
      showToast("خطا در بارگذاری پیام‌های ارتباطی", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      await adminService.updateContactStatus(id, status);
      showToast("وضعیت پیام تغییر یافت.", "success");
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, status });
      }
      fetchContacts();
    } catch (err: any) {
      showToast(err.message || "خطا در تغییر وضعیت", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));

    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>پیام‌ها و استعلام‌های ارتباط با ما</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            پیام‌های دریافتی از فرم تماس، استعلام‌های همکاری و بازخوردهای تجاری
          </p>
        </div>

        <AdminButton
          variant="outline"
          size="sm"
          onClick={fetchContacts}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          تازه‌سازی
        </AdminButton>
      </div>

      {/* Filter and Search */}
      <AdminCard bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در نام فرستنده، موضوع یا متن پیام..."
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
              <option value="ALL">همه پیام‌ها</option>
              <option value="NEW">پیام‌های جدید (خوانده نشده)</option>
              <option value="READ">خوانده شده</option>
              <option value="REPLIED">پاسخ داده شده</option>
              <option value="ARCHIVED">بایگانی شده</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Messages Table */}
      <AdminCard
        title={
          <div className="flex items-center gap-2">
            <span>لیست پیام‌های دریافتی</span>
            <AdminBadge variant="neutral" size="sm">
              {filteredContacts.length} پیام
            </AdminBadge>
          </div>
        }
      >
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            پیامی مطابق جستجو وجود ندارد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">فرستنده</th>
                  <th className="pb-3 font-semibold">موضوع</th>
                  <th className="pb-3 font-semibold">متن خلاصه</th>
                  <th className="pb-3 font-semibold">تاریخ ارسال</th>
                  <th className="pb-3 font-semibold">وضعیت</th>
                  <th className="pb-3 font-semibold text-left">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                      <div>{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {c.phone || c.email}
                      </div>
                    </td>

                    <td className="py-3 font-semibold text-[#124A57] dark:text-teal-400">
                      {c.subject}
                    </td>

                    <td className="py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {c.message}
                    </td>

                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString("fa-IR")}
                    </td>

                    <td className="py-3">
                      <AdminBadge
                        variant={
                          c.status === "NEW"
                            ? "warning"
                            : c.status === "REPLIED"
                            ? "success"
                            : "neutral"
                        }
                        size="sm"
                        dot
                      >
                        {c.status === "NEW"
                          ? "جدید"
                          : c.status === "REPLIED"
                          ? "پاسخ داده شد"
                          : c.status === "READ"
                          ? "خوانده شد"
                          : "بایگانی"}
                      </AdminBadge>
                    </td>

                    <td className="py-3 text-left">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedContact(c)}
                        icon={<Eye className="w-3.5 h-3.5 text-[#124A57]" />}
                      >
                        مشاهده پیام
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Message Inspection Modal */}
      <AdminModal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={selectedContact?.subject || "مشاهده پیام تماس"}
        description={`ارسال‌شده توسط ${selectedContact?.name}`}
        maxWidth="lg"
        footer={
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedContact?.status !== "REPLIED" && (
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedContact.id, "REPLIED")}
                  isLoading={isUpdating}
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                >
                  علامت‌گذاری به عنوان پاسخ‌داده‌شده
                </AdminButton>
              )}
              {selectedContact?.status !== "ARCHIVED" && (
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedContact.id, "ARCHIVED")}
                  isLoading={isUpdating}
                  icon={<Archive className="w-3.5 h-3.5" />}
                >
                  بایگانی
                </AdminButton>
              )}
            </div>

            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => setSelectedContact(null)}
            >
              بستن
            </AdminButton>
          </div>
        }
      >
        {selectedContact && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">فرستنده:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedContact.name}
                </span>
              </div>

              {selectedContact.phone && (
                <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedContact.phone}</span>
                </div>
              )}

              {selectedContact.email && (
                <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedContact.email}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {selectedContact.message}
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};
