import React from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { SectionComponentProps } from "../../types";
import { safeObject, safeString } from "../../registry/sectionSchemas";

export const HeroSection: React.FC<SectionComponentProps> = ({
  title,
  subtitle,
  badge,
  content,
  settings,
}) => {
  const c = safeObject(content);
  const s = safeObject(settings);

  const displayBadge = badge || safeString(c.badge, "پروتئین ممتاز گلمحمدی");
  const displayTitle = title || safeString(c.title, "تأمین مستقیم و تخصصی گوشت و استیک لوکس");
  const displaySubtitle =
    subtitle ||
    safeString(
      c.subtitle,
      "تلاقی تجربه چند ده‌ساله در صنعت گوشت با دانش نوین زنجیره سرد، برش‌های آرتسیان و بسته‌بندی استاندارد."
    );
  const primaryCta = safeString(c.primaryCta, "مشاهده کاتالوگ و استعلام قیمت");
  const primaryCtaLink = safeString(c.primaryCtaLink, "#store-section");
  const secondaryCta = safeString(c.secondaryCta, "ارتباط با مشاورین تجاری");
  const secondaryCtaLink = safeString(c.secondaryCtaLink, "#contact-section");
  const imageUrl = safeString(
    c.imageUrl,
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80"
  );

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-[#0B1E24] text-white overflow-hidden py-24 px-6 sm:px-12">
      {/* Background Image with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt={displayTitle}
          className="w-full h-full object-cover object-center filter contrast-105 brightness-75 opacity-40 scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E24] via-[#0B1E24]/80 to-[#0B1E24]/90" />
      </div>

      {/* Decorative Ambient Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 w-[500px] h-[500px] bg-[#124A57]/30 rounded-full blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-10 w-[500px] h-[500px] bg-[#CD78B3]/20 rounded-full blur-[160px]"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        {displayBadge && (
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#124A57]/70 border border-[#CD78B3]/40 text-xs sm:text-sm text-[#CD78B3] mb-6 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium tracking-wide">{displayBadge}</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight sm:leading-snug max-w-4xl drop-shadow-md">
          {displayTitle}
        </h1>

        {/* Subtitle */}
        {displaySubtitle && (
          <p className="text-base sm:text-xl md:text-2xl text-slate-200 font-light mt-6 max-w-3xl leading-relaxed drop-shadow">
            {displaySubtitle}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          {primaryCta && (
            <a
              href={primaryCtaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#CD78B3] hover:bg-[#b5659e] text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-[#CD78B3]/25 transition-all duration-200 cursor-pointer"
            >
              <span>{primaryCta}</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          )}
          {secondaryCta && (
            <a
              href={secondaryCtaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm sm:text-base backdrop-blur-md transition-all duration-200 cursor-pointer"
            >
              <span>{secondaryCta}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
