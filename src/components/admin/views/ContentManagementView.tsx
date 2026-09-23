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
  Plus,
  Trash2,
  Settings,
  Layers,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const ContentManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "faqs" | "achievements" | "steps" | "footer">("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [heroTitle, setHeroTitle] = useState("تأمین‌کننده برتر گوشت و فرآورده‌های پروتئینی لوکس");
  const [heroSubtitle, setHeroSubtitle] = useState("ارائه برترین برش‌های استیک، درای‌ایج و فیله با ناوگان سردخانه‌ای اختصاصی");
  const [heroVideoUrl, setHeroVideoUrl] = useState(siteConfig.heroVideo);
  const [heroCtaText, setHeroCtaText] = useState("مشاهده کاتالوگ سازمانی");

  const [aboutTitle, setAboutTitle] = useState("داستان پروتئین گلمحمدی");
  const [aboutSubtitle, setAboutSubtitle] = useState("تعهد به کیفیت بی‌نظیر از مزرعه تا رستوران");
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

  const [achievements, setAchievements] = useState([
    { label: "سال سابقه درخشان", value: "۲۰+" },
    { label: "رستوران و هتل همکار", value: "۴۵۰+" },
    { label: "دقت تحویل به موقع", value: "۹۹.۸٪" },
    { label: "تن پروتئین توزیع ماهانه", value: "۱۲۰+" },
  ]);

  const [steps, setSteps] = useState([
    { number: "۰۱", title: "ثبت درخواست یا استعلام", desc: "تماس مستقیم یا ارسال سبد محصولات مورد نیاز پروتئینی" },
    { number: "۰۲", title: "مشاوره تخصصی و عیارسنجی برش", desc: "تنظیم وزن، پخت، استخوان‌گیری یا فیله بر اساس استاندارد سرآشپز" },
    { number: "۰۳", title: "بسته‌بندی وکیوم و زنجیره سرد", desc: "آماده‌سازی در کشتارگاه صنعتی و ارسال با کامیون‌های یخچال‌دار مجهز" },
    { number: "۰۴", title: "تحویل در محل مشتری", desc: "بازرسی و کنترل کیفیت در لحظه تحویل با فاکتور رسمی و گواهی دامپزشکی" },
  ]);

  const [footerInfo, setFooterInfo] = useState({
    address: "تهران، میدان مرکزی میوه و تبارک، غرفه ۱۲ پروتئین گلمحمدی",
    phone: "۰۲۱-۵۵۵۵۸۸۹۹",
    email: "info@golmohammadi-meat.ir",
    workingHours: "شنبه تا پنج‌شنبه: ۸:۰۰ الی ۱۸:۰۰",
    copyright: "تمامی حقوق مادی و معنوی برای پروتئین گلمحمدی محفوظ است.",
  });

  // Video upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    adminService.getSettings().then((settings) => {
      if (settings) {
        if (settings.heroVideoUrl) setHeroVideoUrl(settings.heroVideoUrl);
        if (settings.heroTitle) setHeroTitle(settings.heroTitle);
        if (settings.heroSubtitle) setHeroSubtitle(settings.heroSubtitle);
        if (settings.aboutText) setAboutText(settings.aboutText);
        if (settings.faqs && Array.isArray(settings.faqs)) setFaqs(settings.faqs);
        if (settings.achievements && Array.isArray(settings.achievements)) setAchievements(settings.achievements);
        if (settings.steps && Array.isArray(settings.steps)) setSteps(settings.steps);
        if (settings.footerInfo) setFooterInfo({ ...footerInfo, ...settings.footerInfo });
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
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

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await adminService.updateSettings({
        heroTitle,
        heroSubtitle,
        heroVideoUrl,
        heroCtaText,
        aboutTitle,
        aboutSubtitle,
        aboutText,
        faqs,
        achievements,
        steps,
        footerInfo,
      });
      showToast("تغییرات محتوای لندینگ و تنظیمات با موفقیت ذخیره شد.", "success");
    } catch (err: any) {
      showToast(err.message || "خطا در ذخیره تنظیمات محتوا", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#124A57]" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#124A57] dark:text-teal-400" />
            مدیریت محتوای صفحات و لندینگ (CMS)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مدیریت متون، بخش هیرو، ویدیوها، داستان برند، سوالات متداول و اطلاعات تماس وب‌سایت عمومی
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminButton
            onClick={handleSaveAll}
            isLoading={isSaving}
            className="bg-[#124A57] hover:bg-[#0E353E] text-white"
          >
            <Save className="w-4 h-4 ml-1.5" />
            ذخیره تغییرات کلی
          </AdminButton>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: "hero", label: "هیرو و ویدیو بنر", icon: <Film className="w-4 h-4" /> },
          { id: "about", label: "داستان و درباره ما", icon: <FileText className="w-4 h-4" /> },
          { id: "faqs", label: "سوالات متداول (FAQ)", icon: <HelpCircle className="w-4 h-4" /> },
          { id: "achievements", label: "آمار و افتخارات", icon: <Award className="w-4 h-4" /> },
          { id: "steps", label: "مراحل همکاری", icon: <Layers className="w-4 h-4" /> },
          { id: "footer", label: "فوتر و اطلاعات تماس", icon: <MapPin className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-[#124A57] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Hero & Video Banner */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminCard title="متون اصلی بخش هیرو (Hero Section)">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عنوان اصلی هیرو
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#124A57] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    توضیحات زیرعنوان
                  </label>
                  <textarea
                    rows={3}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#124A57] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    متن دکمه دعوت به اقدام (CTA)
                  </label>
                  <input
                    type="text"
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#124A57] outline-none"
                  />
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="ویدیوی پس‌زمینه هیرو">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    آدرس ویدیو (URL یا مسیر فایل)
                  </label>
                  <input
                    type="text"
                    value={heroVideoUrl}
                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px] font-mono outline-none"
                  />
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleVideoFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                    isDragging
                      ? "border-[#124A57] bg-teal-50/50 dark:bg-teal-950/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/mkv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleVideoFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-[#124A57] dark:text-teal-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    فایل ویدیویی را اینجا رها کنید
                  </div>
                  <div className="text-[11px] text-slate-400 mb-4">
                    فرمت‌های MP4, WebM (حداکثر ۱۰۰ مگابایت)
                  </div>
                  <AdminButton
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                    variant="outline"
                    className="text-xs"
                  >
                    انتخاب از رایانه
                  </AdminButton>

                  {isUploading && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>در حال آپلود ویدیو...</span>
                        <span>{uploadProgress}٪</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#124A57] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {heroVideoUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black aspect-video relative">
                    <video
                      src={heroVideoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-white">
                      پیش‌نمایش زنده ویدیو
                    </div>
                  </div>
                )}
              </div>
            </AdminCard>
          </div>
        </div>
      )}

      {/* Tab 2: About / Story */}
      {activeTab === "about" && (
        <AdminCard title="مدیریت بخش درباره ما و داستان برند">
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                عنوان بخش
              </label>
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                زیرعنوان
              </label>
              <input
                type="text"
                value={aboutSubtitle}
                onChange={(e) => setAboutSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                متن کامل درباره ما
              </label>
              <textarea
                rows={5}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none leading-relaxed"
              />
            </div>
          </div>
        </AdminCard>
      )}

      {/* Tab 3: FAQs */}
      {activeTab === "faqs" && (
        <AdminCard title="مدیریت سوالات متداول (FAQ)">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                سوالاتی که در بخش پایانی لندینگ پیج برای مشتریان B2B نمایش داده می‌شود.
              </span>
              <AdminButton
                onClick={() => setFaqs([...faqs, { q: "سوال جدید؟", a: "پاسخ سوال..." }])}
                className="bg-[#124A57] text-white text-xs"
              >
                <Plus className="w-4 h-4 ml-1" />
                افزودن سوال جدید
              </AdminButton>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-[#124A57] dark:text-teal-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const updated = [...faqs];
                        updated[idx].q = e.target.value;
                        setFaqs(updated);
                      }}
                      placeholder="متن سوال..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <button
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="حذف سوال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => {
                        const updated = [...faqs];
                        updated[idx].a = e.target.value;
                        setFaqs(updated);
                      }}
                      placeholder="پاسخ سوال..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      )}

      {/* Tab 4: Achievements */}
      {activeTab === "achievements" && (
        <AdminCard title="مدیریت آمار و ارقام کلیدی (Achievements)">
          <div className="space-y-4 max-w-3xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              این آمار به صورت نوار برجسته در بخش بالایی لندینگ نمایش داده می‌شود.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      مقدار / عدد (مثال: ۲۰+)
                    </label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...achievements];
                        updated[idx].value = e.target.value;
                        setAchievements(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-[#124A57] dark:text-teal-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      عنوان شاخص
                    </label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...achievements];
                        updated[idx].label = e.target.value;
                        setAchievements(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      )}

      {/* Tab 5: Cooperation Steps */}
      {activeTab === "steps" && (
        <AdminCard title="مدیریت مراحل همکاری (How We Work)">
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              نحوه ثبت سفارش و تأمین پروتئین هتل‌ها و رستوران‌ها در ۴ مرحله.
            </p>
            <div className="space-y-4">
              {steps.map((st, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#124A57] text-white font-black text-sm flex items-center justify-center shrink-0">
                    {st.number}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].title = e.target.value;
                        setSteps(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      value={st.desc}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].desc = e.target.value;
                        setSteps(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      )}

      {/* Tab 6: Footer & Contact */}
      {activeTab === "footer" && (
        <AdminCard title="اطلاعات تماس و فوتر سایت">
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                آدرس دفتر مرکزی و انبار
              </label>
              <input
                type="text"
                value={footerInfo.address}
                onChange={(e) => setFooterInfo({ ...footerInfo, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  شماره تماس سازمانی
                </label>
                <input
                  type="text"
                  value={footerInfo.phone}
                  onChange={(e) => setFooterInfo({ ...footerInfo, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ایمیل پشتیبانی
                </label>
                <input
                  type="text"
                  value={footerInfo.email}
                  onChange={(e) => setFooterInfo({ ...footerInfo, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ساعات کاری پاسخگویی
              </label>
              <input
                type="text"
                value={footerInfo.workingHours}
                onChange={(e) => setFooterInfo({ ...footerInfo, workingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                متن کپی‌رایت فوتر
              </label>
              <input
                type="text"
                value={footerInfo.copyright}
                onChange={(e) => setFooterInfo({ ...footerInfo, copyright: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none"
              />
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
};
