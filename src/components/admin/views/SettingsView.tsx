import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/adminService";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { showToast } from "../ui/AdminToast";
import { Settings, Save, RefreshCw, CheckCircle2, Shield } from "lucide-react";

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    siteName: "پروتئین گلمحمدی",
    supportPhone: "۰۲۱-۸۸۸۸۹۹۹۹",
    supportEmail: "info@golmohamadi.com",
    address: "تهران، مجتمع صنایع غذایی و سردخانه‌ای گلمحمدی",
    currency: "IRR",
    freeDeliveryThreshold: 20000000,
    maintenanceMode: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await adminService.getSettings();
        if (data) setSettings(data);
      } catch (err) {
        // Keep default state
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateSettings(settings);
      showToast("تنظیمات عمومی سامانه با موفقیت ذخیره گردید.", "success");
    } catch (err: any) {
      showToast(err.message || "خطا در ذخیره تنظیمات", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>تنظیمات عمومی پلتفرم</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            اطلاعات پشتیبانی، آدرس سردخانه مرکزی و پیکربندی سفارشات
          </p>
        </div>

        <AdminButton
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
          icon={<Save className="w-4 h-4" />}
        >
          ذخیره تنظیمات
        </AdminButton>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="مشخصات تجاری و برند" subtitle="اطلاعاتی که در فاکتورهای رسمی و فوتر وب‌سایت درج می‌شود">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام رسمی مجموعه *
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شماره تماس پشتیبانی و فروش *
              </label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ایمیل رسمی پشتیبانی
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                حداقل سفارش برای ارسال رایگان سردخانه‌ای (تومان)
              </label>
              <input
                type="number"
                step="1000000"
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نشانی دقیق انبار مرکزی و سردخانه
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="امنیت و حالت نگهداری" subtitle="کنترل دسترسی عمومی هنگام به‌روزرسانی سیستم">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                حالت نگهداری وب‌سایت (Maintenance Mode)
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                در صورت فعال‌سازی، کاربران عادی پیام به‌روزرسانی سیستم را مشاهده خواهند نمود.
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#124A57]"></div>
            </label>
          </div>
        </AdminCard>
      </form>
    </div>
  );
};
