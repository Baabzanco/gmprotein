import React from "react";
import { ThermometerSnowflake, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export const QualityStandards: React.FC = () => {
  return (
    <section id="standards" className="py-20 bg-[#0B1E24] text-slate-100 border-t border-[#124A57]/40 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#CD78B3] font-semibold block mb-2">
            تضمین بهداشت و سلامت
          </span>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            چهار اصل بنیادین پروتئین گلمحمدی
          </h2>
          <p className="text-sm text-slate-300 font-light leading-relaxed">
            ما سلامت غذایی مشتریانمان را با پروتکل‌های سختگیرانه آزمایشگاهی و استانداردهای روز بین‌المللی تضمین می‌کنیم.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0e272f]/50 border border-[#184550]">
            <ThermometerSnowflake className="w-8 h-8 text-[#CD78B3] mb-4" />
            <h4 className="font-bold text-white mb-2 text-base">زنجیره سرد مداوم</h4>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              تثبیت دمای بهینه از زمان کشتار تا تحویل به درب منزل با ناوگان یخچال‌دار مدرن مجهز به سنسور دیجیتال.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e272f]/50 border border-[#184550]">
            <ShieldAlert className="w-8 h-8 text-[#CD78B3] mb-4" />
            <h4 className="font-bold text-white mb-2 text-base">بدون مواد نگهدارنده</h4>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              صددرصد خالص، بدون استفاده از رنگ‌های شیمیایی، نیتریت یا مواد نگهدارنده غیرطبیعی.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e272f]/50 border border-[#184550]">
            <Sparkles className="w-8 h-8 text-[#CD78B3] mb-4" />
            <h4 className="font-bold text-white mb-2 text-base">استریل و اتاق تمیز</h4>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              بخش قطعه‌بندی و بسته‌بندی در فضایی با فیلتر هپا و نظافت استریل روزانه مطابق با ضوابط بهداشت جهانی.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e272f]/50 border border-[#184550]">
            <CheckCircle2 className="w-8 h-8 text-[#CD78B3] mb-4" />
            <h4 className="font-bold text-white mb-2 text-base">برش سفارشی به دلخواه</h4>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              امکان تعیین دقیق ضخامت برش استیک، چرخ‌کرده با درصد چربی دلخواه و طعم‌دارسازی اختصاصی مشتری.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
