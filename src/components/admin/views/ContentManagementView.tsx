import React, { useState, useEffect, useRef } from "react";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { showToast } from "../ui/AdminToast";
import { adminService } from "../../../services/adminService";
import { siteConfig } from "../../../config/siteConfig";
import {
  FileText,
  Save,
  CheckCircle2,
  Film,
  Award,
  HelpCircle,
  UploadCloud,
  FileVideo,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RefreshCw,
  Server,
  Link2,
} from "lucide-react";

export const ContentManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "badges" | "faq">("hero");
  const [isSaving, setIsSaving] = useState(false);

  // Content states
  const [heroTitle, setHeroTitle] = useState("تأمین‌کننده برتر گوشت و فرآورده‌های پروتئینی لوکس");
  const [heroSubtitle, setHeroSubtitle] = useState("ارائه برترین برش‌های استیک، درای‌ایج و فیله با ناوگان سردخانه‌ای اختصاصی");
  const [heroVideoUrl, setHeroVideoUrl] = useState(siteConfig.heroVideo);

  // Video upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    adminService.getSettings().then((settings) => {
      if (settings?.heroVideoUrl) {
        setHeroVideoUrl(settings.heroVideoUrl);
      }
    }).catch(() => {});
  }, []);

  const handleVideoFileSelect = async (file: File) => {
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/m4v"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv|m4v)$/i)) {
      showToast("فرمت فایل معتبر نیست. لطفاً یک فایل ویدیویی با فرمت MP4، WebM یا MOV انتخاب کنید.", "error");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast("حجم ویدیو نمی‌تواند بیشتر از ۱۰۰ مگابایت باشد.", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const res = await adminService.uploadHeroVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      if (res && res.url) {
        setHeroVideoUrl(res.url);
        showToast("ویدیوی هیروسکشن با موفقیت در سرور آپلود شد و فعال گردید.", "success");
      }
    } catch (err: any) {
      showToast(err.message || "خطا در آپلود ویدیو به سرور", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminService.updateSettings({
        heroVideoUrl,
      });
      showToast("محتوای صفحات و ویدیوی هیروسکشن با موفقیت در سرور ذخیره شد.", "success");
    } catch (err: any) {
      showToast(err.message || "خطا در ذخیره تغییرات", "error");
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
            <FileText className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>مدیریت محتوای پورتال عمومی (CMS)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ویرایش متن‌ها، آپلود ویدئوی هدر، اطلاعات درباره ما و پرسش‌های متداول
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
        <div className="space-y-6">
          <AdminCard title="محتوای متنی هیروسکشن" subtitle="عناوین نمایشی روی ویدیوی هدر">
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
            </div>
          </AdminCard>

          <AdminCard title="آپلود ویدیوی هیروسکشن روی سرور" subtitle="فایل ویدیو مستقیماً در سرور ذخیره و در صفحه اصلی نمایش داده می‌شود">
            <div className="space-y-4 text-xs">
              {/* Upload Dropzone */}
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) handleVideoFileSelect(e.dataTransfer.files[0]);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDragging
                    ? "border-[#124A57] bg-[#124A57]/10 dark:bg-[#124A57]/20"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleVideoFileSelect(e.target.files[0]);
                  }}
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#124A57]/10 dark:bg-[#124A57]/30 text-[#124A57] dark:text-teal-400 flex items-center justify-center">
                    {isUploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">
                      {isUploading ? "در حال آپلود ویدیو روی سرور..." : "آپلود فایل ویدیوی هیروسکشن جدید"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      فرمت‌های MP4, WebM, MOV تا سقف ۱۰۰ مگابایت
                    </p>
                  </div>

                  {isUploading ? (
                    <div className="w-full max-w-xs space-y-1.5">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#124A57] h-full rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#124A57] hover:bg-[#0f3c46] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <FileVideo className="w-4 h-4" />
                        <span>انتخاب و آپلود ویدیو</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setHeroVideoUrl(siteConfig.heroVideo);
                          showToast("به ویدیوی پیش‌فرض تغییر یافت.", "info");
                        }}
                        className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>پیش‌فرض</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* URL & Status */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  آدرس ویدیوی فعال هیرو
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={heroVideoUrl}
                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono text-[11px] ltr"
                  />
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
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
