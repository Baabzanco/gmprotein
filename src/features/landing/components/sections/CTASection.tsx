import React from "react";
import { Sparkles, ArrowLeft, PhoneCall } from "lucide-react";
import { SectionComponentProps } from "../../types";
import { safeObject, safeString } from "../../registry/sectionSchemas";

export const CTASection: React.FC<SectionComponentProps> = ({
  title,
  subtitle,
  badge,
  content,
}) => {
  const c = safeObject(content);

  const displayBadge = badge || safeString(c.badge, "همکاری تجاری و سازمانی");
  const displayTitle =
    title || safeString(c.title, "آماده ارتقای استانداردهای پروتئینی مجموعه خود هستید؟");
  const displaySubtitle =
    subtitle ||
    safeString(
      c.subtitle,
      "همین حالا با کارشناسان فروش عمده تماس حاصل فرمایید یا استعلام خود را به صورت آنلاین ثبت نمایید."
    );
  const primaryCta = safeString(c.primaryCta, "ثبت درخواست استعلام قیمت");
  const primaryCtaLink = safeString(c.primaryCtaLink, "#contact-section");
  const phone = safeString(c.phone, "021-88888888");

  return (
    <section className="relative w-full bg-[var(--bg-primary)] py-20 sm:py-28 px-6 sm:px-12 border-t border-[var(--border)] overflow-hidden">
      <div className="relative max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#124A57] to-[#1a5b6a] text-white p-8 sm:p-14 shadow-2xl border border-[#CD78B3]/30 overflow-hidden text-center flex flex-col items-center">
        {/* Glow ambient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-[#CD78B3]/30 rounded-full blur-3xl"
        />

        {displayBadge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-[#CD78B3] mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{displayBadge}</span>
          </div>
        )}

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-snug max-w-3xl mb-4">
          {displayTitle}
        </h2>

        {displaySubtitle && (
          <p className="text-sm sm:text-lg text-slate-200 font-light max-w-2xl leading-relaxed mb-8">
            {displaySubtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          {primaryCta && (
            <a
              href={primaryCtaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#CD78B3] hover:bg-[#b5659e] text-white font-bold text-sm sm:text-base shadow-xl transition-all duration-200 cursor-pointer"
            >
              <span>{primaryCta}</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-medium text-sm sm:text-base backdrop-blur-md transition-all duration-200 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#CD78B3]" />
              <span>تماس مستقیم: {phone}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
