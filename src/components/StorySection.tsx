import React from "react";
import { siteConfig } from "../config/siteConfig";
import { Award, ShieldCheck, HeartHandshake, Flame, ArrowLeft } from "lucide-react";

export const StorySection: React.FC = () => {
  return (
    <section
      id="story-section"
      className="relative w-full bg-[#0B1E24] text-slate-100 py-24 sm:py-32 px-6 sm:px-12 border-t border-[#124A57]/50"
    >
      {/* Decorative ambient radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#124A57]/30 via-transparent to-transparent blur-3xl opacity-60"
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#124A57]/40 border border-[#CD78B3]/30 text-xs sm:text-sm text-[#CD78B3] mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>داستان ما و اصالت طعم</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 max-w-2xl leading-tight">
            تعهدی به بالاترین معیار تازگی و اصالت گوشت
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
            در مجموعه <span className="text-[#CD78B3] font-medium">{siteConfig.brandNameFa}</span>،
            ما پروتئین را تنها به عنوان یک ماده غذایی نمی‌بینیم؛ بلکه هنری از انتخاب دقیق، برش حرفه‌ای قصابی مدرن، و حفظ زنجیره سرد از مزرعه تا میز غذای شماست.
          </p>
        </div>

        {/* Narrative Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Card 1 */}
          <div
            id="story-card-traceability"
            className="group relative bg-[#0e272f]/70 border border-[#184550] hover:border-[#CD78B3]/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#124A57]/20"
          >
            <div className="w-12 h-12 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">زنجیره تامین بدون واسطه</h3>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              انتخاب دام و طیور به صورت مستقیم از برترین مزارع استاندارد کشور همراه با گواهی سلامت و نظارت مستمر دامپزشکی.
            </p>
          </div>

          {/* Card 2 */}
          <div
            id="story-card-craftsmanship"
            className="group relative bg-[#0e272f]/70 border border-[#184550] hover:border-[#CD78B3]/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#124A57]/20"
          >
            <div className="w-12 h-12 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">هنر قصابی تخصصی</h3>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              برش‌های استاندارد بین‌المللی اعم از ریب‌آی، فیله مینیون، تی‌بن و طعم‌دارسازی اختصاصی با ادویه‌های اصیل و طبیعی.
            </p>
          </div>

          {/* Card 3 */}
          <div
            id="story-card-coldchain"
            className="group relative bg-[#0e272f]/70 border border-[#184550] hover:border-[#CD78B3]/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#124A57]/20"
          >
            <div className="w-12 h-12 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] mb-6 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">تازگی بی‌وقفه و بسته‌بندی خلأ</h3>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              حفظ بافت طبیعی و عطر گوشت تازه با فناوری بسته‌بندی در اتمسفر اصلاح‌شده و کنترل پیوسته دما تا لحظه تحویل.
            </p>
          </div>
        </div>

        {/* Narrative Quote Highlight */}
        <div
          id="story-quote-banner"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#124A57] to-[#1a5b6a] p-8 sm:p-12 border border-[#CD78B3]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="max-w-xl text-right">
            <span className="text-xs uppercase tracking-widest text-[#CD78B3] font-semibold block mb-2">
              استاندارد ممتاز گلمحمدی
            </span>
            <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              «طعم واقعی گوشت تازه نتیجه صداقت در انتخاب و احترام به سلیقه غذایی خانواده‌هاست.»
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#products"
              id="cta-explore-products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#CD78B3] hover:bg-[#b8619e] text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-[#CD78B3]/25 active:scale-95"
            >
              <span>مشاهده محصولات منتخب</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
