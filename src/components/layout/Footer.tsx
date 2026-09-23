import React from "react";
import { siteConfig } from "../../config/siteConfig";
import { MapPin, Phone, Mail, Clock, Instagram, ShieldCheck, ChevronLeft, Shield } from "lucide-react";
import { useRouter } from "../../context/RouterContext";

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  return (
    <footer id="footer" className="bg-[#051014] text-slate-300 border-t border-[#124A57]/60 pt-20 pb-12 px-6 sm:px-12 relative overflow-hidden">
      {/* Decorative Brand Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#CD78B3]/80 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Info & Monogram */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#124A57] border border-[#CD78B3]/60 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-[#124A57]/40">
                <span className="text-[#CD78B3]">PG</span>
              </div>
              <div>
                <span className="font-extrabold text-white text-xl tracking-tight block">
                  {siteConfig.brandNameFa}
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block -mt-1">
                  {siteConfig.brandName}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
              تأمین‌کننده مرجع و تخصصی گوشت گرم کشتارگاهی، استیک‌های لوکس ماربل، برش‌های انحصاری شیشلیک و فیله گوساله دستچین با حفظ دقیق زنجیره سرد و استاندارد بین‌المللی در تهران.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="اینستاگرام پروتئین گلمحمدی"
                className="w-10 h-10 rounded-full bg-[#0e272f] hover:bg-[#124A57] border border-[#184550] flex items-center justify-center text-slate-300 hover:text-[#CD78B3] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="tel:02122000000"
                aria-label="تماس تلفنی"
                className="w-10 h-10 rounded-full bg-[#0e272f] hover:bg-[#124A57] border border-[#184550] flex items-center justify-center text-slate-300 hover:text-[#CD78B3] transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@golmohamadi.com"
                aria-label="ایمیل"
                className="w-10 h-10 rounded-full bg-[#0e272f] hover:bg-[#124A57] border border-[#184550] flex items-center justify-center text-slate-300 hover:text-[#CD78B3] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-white text-sm border-r-2 border-[#CD78B3] pr-3">
              ناوبری و صفحات
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-light">
              <li>
                <a href="#hero-scroll-section" className="hover:text-[#CD78B3] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3 h-3 text-[#124A57]" />
                  <span>خانه و هدر سینمایی</span>
                </a>
              </li>
              <li>
                <a href="#story-section" className="hover:text-[#CD78B3] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3 h-3 text-[#124A57]" />
                  <span>داستان ما</span>
                </a>
              </li>
              <li>
                <a href="#achievements" className="hover:text-[#CD78B3] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3 h-3 text-[#124A57]" />
                  <span>دستاوردهای ما</span>
                </a>
              </li>
              <li>
                <a href="#cooperation" className="hover:text-[#CD78B3] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3 h-3 text-[#124A57]" />
                  <span>شیوه همکاری</span>
                </a>
              </li>
              <li>
                <a href="#store-section" className="hover:text-[#CD78B3] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3 h-3 text-[#124A57]" />
                  <span>فروشگاه و پیش‌فاکتور</span>
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-[#CD78B3] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3 h-3 text-[#124A57]" />
                  <span>سوالات متداول</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate("/blog")}
                  className="hover:text-[#CD78B3] transition-colors flex items-center gap-1.5 cursor-pointer text-right w-full"
                >
                  <ChevronLeft className="w-3 h-3 text-[#124A57]" />
                  <span>وبلاگ تخصصی و مقالات</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="hover:text-[#CD78B3] text-teal-400 font-medium transition-colors flex items-center gap-1.5 text-right cursor-pointer"
                >
                  <Shield className="w-3 h-3 text-[#CD78B3]" />
                  <span>پنل مدیریت B2B</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-white text-sm border-r-2 border-[#CD78B3] pr-3">
              دسته‌های محصولات
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-light">
              <li>
                <a href="#store-section" className="hover:text-[#CD78B3] transition-colors">
                  گوشت گوساله و استیک
                </a>
              </li>
              <li>
                <a href="#store-section" className="hover:text-[#CD78B3] transition-colors">
                  گوشت گوسفندی شاندیزی
                </a>
              </li>
              <li>
                <a href="#store-section" className="hover:text-[#CD78B3] transition-colors">
                  فیله و راسته پاک‌شده
                </a>
              </li>
              <li>
                <a href="#store-section" className="hover:text-[#CD78B3] transition-colors">
                  برش‌های باربیکیو و مرینیت
                </a>
              </li>
              <li>
                <a href="#campaign-section" className="hover:text-[#CD78B3] transition-colors">
                  پیشنهادهای فصلی با تخفیف
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details & Headquarters */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-bold text-white text-sm border-r-2 border-[#CD78B3] pr-3">
              مرکز مدیریت و ارتباط
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-400 font-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#CD78B3] shrink-0 mt-0.5" />
                <span>تهران، خیابان ولیعصر، نرسیده به میدان تجریش، مجتمع پروتئین بوتیک گلمحمدی</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#CD78B3] shrink-0" />
                <span dir="ltr">021 - 2200 0000 / 021 - 2200 0001</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#CD78B3] shrink-0" />
                <span>ساعات کار فروشگاه و انبار: همه‌روزه ۸:۳۰ الی ۲۱:۳۰</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#CD78B3] shrink-0" />
                <span>شماره پروانه بهره‌برداری و نظارت دامپزشکی: ۲۴-۷۸۹</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-light gap-4">
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} تمامی حقوق متعلق به {siteConfig.brandNameFa} است.</span>
            <a href="#contact" className="hover:text-slate-300">حفظ حریم خصوصی</a>
            <a href="#cooperation" className="hover:text-slate-300">شرایط و ضوابط تأمین</a>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-[#CD78B3] hover:underline cursor-pointer"
            >
              ورود همکاران و پنل مدیریت
            </button>
          </div>

          <span className="text-[11px] text-slate-600 font-mono tracking-wider">
            {siteConfig.brandName} • Fine Meats & Protein Supply
          </span>
        </div>
      </div>
    </footer>
  );
};
