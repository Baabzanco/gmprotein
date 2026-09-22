import React, { useState, useEffect, useRef } from "react";
import { adminService } from "../../../services/adminService";
import { siteConfig } from "../../../config/siteConfig";
import { AdminCard } from "../ui/AdminCard";
import { AdminButton } from "../ui/AdminButton";
import { showToast } from "../ui/AdminToast";
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle2,
  Shield,
  Film,
  UploadCloud,
  FileVideo,
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Server,
  Link2,
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    siteName: "پروتئین گلمحمدی",
    supportPhone: "۰۲۱-۸۸۸۸۹۹۹۹",
    supportEmail: "info@golmohamadi.com",
    address: "تهران، مجتمع صنایع غذایی و سردخانه‌ای گلمحمدی",
    currency: "IRR",
    freeDeliveryThreshold: 20000000,
    maintenanceMode: false,
    heroVideoUrl: siteConfig.heroVideo,
    heroScrollMultiplier: 4.5,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Video upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>(siteConfig.heroVideo);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoFileSize, setVideoFileSize] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await adminService.getSettings();
        if (data) {
          setSettings((prev: any) => ({
            ...prev,
            ...data,
            heroVideoUrl: data.heroVideoUrl || siteConfig.heroVideo,
          }));
          setVideoPreviewUrl(data.heroVideoUrl || siteConfig.heroVideo);
        }
      } catch (err) {
        // Keep default state
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleVideoFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/m4v"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv|m4v)$/i)) {
      showToast("فرمت فایل معتبر نیست. لطفاً یک فایل ویدیویی با فرمت MP4، WebM یا MOV انتخاب کنید.", "error");
      return;
    }

    // Validate size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      showToast("حجم ویدیو نمی‌تواند بیشتر از ۱۰۰ مگابایت باشد.", "error");
      return;
    }

    // Display formatted file size
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setVideoFileSize(`${sizeMb} مگابایت`);

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const res = await adminService.uploadHeroVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      if (res && res.url) {
        setSettings((prev: any) => ({
          ...prev,
          heroVideoUrl: res.url,
        }));
        setVideoPreviewUrl(res.url);
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleVideoFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleResetDefaultVideo = () => {
    setSettings((prev: any) => ({
      ...prev,
      heroVideoUrl: siteConfig.heroVideo,
    }));
    setVideoPreviewUrl(siteConfig.heroVideo);
    setVideoFileSize(null);
    showToast("آدرس ویدیو به نسخه اولیه برند بازنشانی شد. برای ثبت دکمه ذخیره را بزنید.", "info");
  };

  const toggleVideoPlayback = () => {
    if (!previewVideoRef.current) return;
    if (previewVideoRef.current.paused) {
      previewVideoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      previewVideoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!previewVideoRef.current) return;
    previewVideoRef.current.muted = !previewVideoRef.current.muted;
    setIsVideoMuted(previewVideoRef.current.muted);
  };

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

  const isServerHosted = settings.heroVideoUrl?.startsWith("/uploads");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#124A57] dark:text-teal-400" />
            <span>تنظیمات عمومی و رسانه‌ای پلتفرم</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            آپلود ویدیوی هیروسکشن صفحه اصلی، اطلاعات تماس تجاری، نشانی سردخانه و پیکربندی سفارشات
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
        {/* HERO SECTION VIDEO UPLOAD & CONFIGURATION CARD */}
        <AdminCard
          title="مدیریت و آپلود ویدیوی هیروسکشن (Hero Section Video)"
          subtitle="ویدیوی سینمایی پس‌زمینه در بالای صفحه اصلی که با اسکرول کاربر پخش می‌شود"
        >
          <div className="space-y-5 text-xs">
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? "border-[#124A57] bg-[#124A57]/10 dark:bg-[#124A57]/20 scale-[0.99]"
                  : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-[#124A57]/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/m4v,.mp4,.webm,.mov,.mkv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleVideoFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#124A57]/10 dark:bg-[#124A57]/30 text-[#124A57] dark:text-teal-400 flex items-center justify-center shadow-xs">
                  {isUploading ? (
                    <RefreshCw className="w-7 h-7 animate-spin text-[#124A57] dark:text-teal-400" />
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {isUploading
                      ? "در حال آپلود و پردازش ویدیو روی سرور..."
                      : "فایل ویدیوی جدید هیروسکشن را اینجا بکشید یا انتخاب کنید"}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    پشتیبانی از فرمت‌های MP4, WebM, MOV (کیفیت پیشنهادی: 1080p با بیت‌ریت بهینه - حداکثر ۱۰۰ مگابایت)
                  </p>
                </div>

                {isUploading ? (
                  <div className="w-full max-w-xs space-y-2 mt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#124A57] to-[#CD78B3] h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {uploadProgress}% تکمیل شده
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#124A57] hover:bg-[#0f3c46] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <FileVideo className="w-4 h-4" />
                      <span>انتخاب فایل ویدیو از رایانه</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetDefaultVideo}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="بازگرداندن به ویدیوی پیش‌فرض اولیه"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ویدیوی پیش‌فرض</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Video Status & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              {/* Video Player Preview */}
              <div className="lg:col-span-5 bg-black/90 rounded-2xl overflow-hidden border border-slate-700 shadow-md relative group">
                <video
                  ref={previewVideoRef}
                  src={videoPreviewUrl}
                  muted={isVideoMuted}
                  playsInline
                  loop
                  onLoadedMetadata={(e) => {
                    const dur = (e.target as HTMLVideoElement).duration;
                    if (!isNaN(dur)) setVideoDuration(dur);
                  }}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  className="w-full h-48 sm:h-56 object-cover object-center"
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-3 flex flex-col justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-white text-[11px]">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Film className="w-3 h-3 text-[#CD78B3]" />
                      <span>پیش‌نمایش زنده هیرو</span>
                    </span>

                    {videoDuration && (
                      <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-mono text-[10px]">
                        {videoDuration.toFixed(1)} ثانیه
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={toggleVideoPlayback}
                      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      {isVideoPlaying ? (
                        <Pause className="w-4 h-4 fill-slate-900" />
                      ) : (
                        <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={toggleVideoMute}
                      className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                    >
                      {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Video URL & Details Form */}
              <div className="lg:col-span-7 space-y-3">
                {/* Active Hosting Badge */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  {isServerHosted ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Server className="w-4 h-4" />
                      <span className="font-bold">میزبانی مستقیم روی سرور محلی (VPS / Server Storage)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Link2 className="w-4 h-4" />
                      <span className="font-bold">میزبانی از طریق آدرس اینترنتی (External URL)</span>
                    </div>
                  )}
                  {videoFileSize && (
                    <span className="mr-auto font-mono text-slate-500 text-[11px]">
                      حجم: {videoFileSize}
                    </span>
                  )}
                </div>

                {/* Direct Video URL Input */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    آدرس فایل ویدیو فعال در سامانه (URL / Path)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.heroVideoUrl || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings({ ...settings, heroVideoUrl: val });
                        setVideoPreviewUrl(val);
                      }}
                      placeholder="https://... یا /uploads/videos/hero-video.mp4"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57] font-mono text-[11px] ltr"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    با آپلود فایل، این آدرس به صورت خودکار با مسیر سرور محلی پر می‌شود. همچنین در صورت تمایل می‌توانید آدرس مستقیم فایل MP4 را نیز وارد نمایید.
                  </p>
                </div>

                {/* Scroll Multiplier / Sensitivity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      حساسیت اسکرول ویدیو (Scroll Multiplier)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="2.5"
                      max="8"
                      value={settings.heroScrollMultiplier || 4.5}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          heroScrollMultiplier: parseFloat(e.target.value) || 4.5,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#124A57]"
                    />
                    <span className="text-[10px] text-slate-500">
                      مقدار پیش‌فرض: ۴.۵ (عدد بالاتر = اسکرول نرم‌تر و سینمایی‌تر)
                    </span>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setVideoPreviewUrl(settings.heroVideoUrl);
                        if (previewVideoRef.current) {
                          previewVideoRef.current.load();
                        }
                        showToast("پیش‌نمایش ویدیو به‌روزرسانی شد.", "info");
                      }}
                      className="w-full p-2.5 bg-slate-150 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>بارگذاری مجدد پیش‌نمایش</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>

        {/* BUSINESS AND BRAND INFORMATION */}
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

        {/* SECURITY AND MAINTENANCE */}
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
