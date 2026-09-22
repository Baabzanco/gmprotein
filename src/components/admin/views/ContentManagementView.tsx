import React, { useState } from "react";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { showToast } from "../ui/AdminToast";
import { FileText, Save, CheckCircle2, Film, Award, HelpCircle } from "lucide-react";

export const ContentManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "badges" | "faq">("hero");
  const [isSaving, setIsSaving] = useState(false);

  // Content states
  const [heroTitle, setHeroTitle] = useState("تأمین‌کننده برتر گوشت و فرآورده‌های پروتئینی لوکس");
  const [heroSubtitle, setHeroSubtitle] = useState("ارائه برترین برش‌های استیک، درای‌ایج و فیله با ناوگان سردخانه‌ای اختصاصی");
  const [heroVideoUrl, setHeroVideoUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-a-piece-of-meat-41484-large.mp4");

  const [aboutText, setAboutText] = useState(
    "پروتئین گلمحمدی با بیش از دو دهه تجربه در زمینه تأمین پروتئین هتل‌ها، رستوران‌های لوکس و سازمان‌های بزرگ، بالاترین استانداردهای بهداشتی و زنجیره سرد را فراهم نموده است."
  );

  const [faqs, setFaqs] = useState([
    {
      q: "آیا ارسال با خودروهای مجهز به دیتالاگر دما صورت می‌گیرد؟",
      a: "بله، تمامی ناوگان توزیع مجهز به سیستم پایش آنلاین برودت تا منفی ۱۸ درجه سانتی‌گراد هستند.",
    },
    {
      q: "شرایط تسویه حساب سازمانی چگونه است؟",
      a: "پس از اعتبارسنجی اولیه، امکان تسویه اعتباری ۳۰ الی ۴۵ روزه برای هتل‌ها و رستوران‌های طرف قرارداد مهیاست.",
    },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("محتوای صفحات با موفقیت ذخیره و در وب‌سایت عمومی بروزرسانی گردید.", "success");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت محتوای پورتال عمومی (CMS)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ویرایش متن‌ها، ویدئوی هدر، اطلاعات درباره ما و پرسش‌های متداول
          </p>
        </div>

        <AdminButton
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
          icon={<Save className="w-4 h-4" />}
        >
          ذخیره تغییرات محتوا
        </AdminButton>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "hero"
              ? "bg-[#124A57] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>بخش ویدئویی هدر (Hero)</span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "about"
              ? "bg-[#124A57] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>درباره ما و گواهینامه‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "faq"
              ? "bg-[#124A57] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>پرسش‌های متداول (FAQ)</span>
        </button>
      </div>

      {/* Hero Tab */}
      {activeTab === "hero" && (
        <AdminCard title="محتوای ویدیویی و عنوان اصلی صفحه فرود">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                تیتر اصلی (Headline)
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                زیرعنوان توضیحی (Sub-headline)
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                آدرس اینترنتی ویدئو پس‌زمینه (MP4)
              </label>
              <input
                type="url"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono text-[11px]"
              />
            </div>
          </div>
        </AdminCard>
      )}

      {/* About Tab */}
      {activeTab === "about" && (
        <AdminCard title="داستان برند و تعهد کیفیت">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                متن معرفی پروتئین گلمحمدی
              </label>
              <textarea
                rows={5}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] leading-relaxed"
              />
            </div>
          </div>
        </AdminCard>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <AdminCard title="پرسش‌های پرتکرار مشتریان">
          <div className="space-y-4 text-xs">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  سؤال {idx + 1}: {faq.q}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  پاسخ: {faq.a}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
};
