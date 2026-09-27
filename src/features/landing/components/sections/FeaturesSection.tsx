import React from "react";
import { Sparkles, ShieldCheck, Truck, Award, ThermometerSnowflake, Layers } from "lucide-react";
import { SectionComponentProps } from "../../types";
import { safeObject, safeArray, safeString } from "../../registry/sectionSchemas";

const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <ShieldCheck className="w-6 h-6" />,
  truck: <Truck className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  temp: <ThermometerSnowflake className="w-6 h-6" />,
  layers: <Layers className="w-6 h-6" />,
};

export const FeaturesSection: React.FC<SectionComponentProps> = ({
  title,
  subtitle,
  badge,
  content,
}) => {
  const c = safeObject(content);

  const displayBadge = badge || safeString(c.badge, "مزایای رقابتی");
  const displayTitle = title || safeString(c.title, "چرا پروتئین گلمحمدی؟");
  const displaySubtitle =
    subtitle ||
    safeString(
      c.subtitle,
      "تضمین کیفیت پایدار، پایش حرارتی از مبدا تا مقصد و پاسخگویی اختصاصی به مشتریان تجاری."
    );

  const items = safeArray<{ title?: string; description?: string; icon?: string }>(c.items, [
    {
      title: "زنجیره سرمایش پیوسته",
      description: "حفظ دمای بهینه از لحظه کشتار تا تحویل نهایی به سردخانه یا آشپزخانه شما.",
      icon: "temp",
    },
    {
      title: "برش‌های تخصصی سرآشپز",
      description: "آماده‌سازی سفارشی انواع استیک با ضخامت میلی‌متری و گرید ماربلینگ بالا.",
      icon: "award",
    },
    {
      title: "ارسال سریع و بهداشتی",
      description: "ناوگان مجهز به دستگاه‌های خنک‌کننده اختصاصی و بسته‌بندی در اتمسفر اصلاح‌شده.",
      icon: "truck",
    },
    {
      title: "تضمین اصالت و سلامت دام",
      description: "نظارت مستقیم کارشناسان دامپزشکی و رعایت پروتکل‌های بهداشتی بین‌المللی.",
      icon: "shield",
    },
  ]);

  return (
    <section className="relative w-full bg-[var(--bg-primary)] text-[var(--text-primary)] py-24 sm:py-32 px-6 sm:px-12 border-t border-[var(--border)]">
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          {displayBadge && (
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs sm:text-sm text-[#CD78B3] mb-5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium tracking-wide">{displayBadge}</span>
            </div>
          )}

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight sm:leading-snug max-w-3xl">
            {displayTitle}
          </h2>

          {displaySubtitle && (
            <p className="text-base sm:text-xl text-[var(--text-secondary)] font-light mt-4 max-w-2xl leading-relaxed">
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] hover:border-[#124A57]/60 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#124A57] text-[#CD78B3] flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  {ICON_MAP[item.icon || ""] || <Sparkles className="w-6 h-6" />}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3">
                  {safeString(item.title, `مزیت ${idx + 1}`)}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                  {safeString(item.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
