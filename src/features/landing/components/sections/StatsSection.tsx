import React from "react";
import { Sparkles } from "lucide-react";
import { SectionComponentProps } from "../../types";
import { safeObject, safeArray, safeString } from "../../registry/sectionSchemas";

export const StatsSection: React.FC<SectionComponentProps> = ({
  title,
  subtitle,
  badge,
  content,
}) => {
  const c = safeObject(content);

  const displayBadge = badge || safeString(c.badge, "افتخارات و ارقام");
  const displayTitle = title || safeString(c.title, "دستاوردهای ما در یک نگاه");
  const displaySubtitle =
    subtitle ||
    safeString(c.subtitle, "حاصل سال‌ها تعهد بی‌وقفه به کیفیت، سلامت و رضایت مشتریان.");

  const stats = safeArray<{ value?: string | number; suffix?: string; label?: string; description?: string }>(
    c.stats || c.items,
    [
      { value: "28", suffix: " سال", label: "سال تجربه", description: "سابقه موروثی و تخصص در صنعت پروتئین" },
      { value: "140", suffix: "+ قلم", label: "تنوع محصولات", description: "انواع برش‌های تخصصی گوسفندی و گوساله" },
      { value: "850", suffix: "+ مجموعه", label: "مشتریان وفادار", description: "همکاری پایدار با برترین رستوران‌ها و هتل‌ها" },
      { value: "22", suffix: " منطقه", label: "مناطق تحت پوشش", description: "ارسال اختصاصی با ناوگان زنجیره سرمایشی" },
    ]
  );

  return (
    <section className="relative w-full bg-[var(--bg-primary)] text-[var(--text-primary)] py-20 sm:py-28 px-6 sm:px-12 border-t border-[var(--border)] overflow-hidden">
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
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] text-center flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline justify-center gap-1 mb-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#124A57] dark:text-[#CD78B3] tracking-tight">
                    {safeString(stat.value, "0")}
                  </span>
                  {stat.suffix && (
                    <span className="text-lg font-bold text-[#CD78B3] dark:text-slate-300">
                      {stat.suffix}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2">
                  {safeString(stat.label, `شاخص ${idx + 1}`)}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed">
                  {safeString(stat.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
