import React from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { SectionComponentProps } from "../../types";
import { safeObject, safeString } from "../../registry/sectionSchemas";

export const BannerSection: React.FC<SectionComponentProps> = ({
  title,
  subtitle,
  badge,
  content,
}) => {
  const c = safeObject(content);

  const displayBadge = badge || safeString(c.badge, "اطلاعیه ویژه");
  const displayTitle = title || safeString(c.title, "تخفیف‌های فصلی و جشنواره استیک");
  const displaySubtitle =
    subtitle || safeString(c.subtitle, "سفارشات عمده بالای ۲۰ کیلوگرم مشمول بسته‌بندی اسکین‌پک رایگان می‌باشند.");
  const linkText = safeString(c.linkText, "مشاهده جزئیات");
  const linkUrl = safeString(c.linkUrl, "#store-section");

  return (
    <section className="relative w-full bg-[#124A57] text-white py-6 px-6 sm:px-12 border-y border-[#CD78B3]/30 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {displayBadge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CD78B3] text-white text-xs font-bold shrink-0">
              <Sparkles className="w-3 h-3" />
              {displayBadge}
            </span>
          )}
          <div className="text-right">
            <h4 className="text-sm sm:text-base font-bold text-white inline-block ml-2">
              {displayTitle}
            </h4>
            {displaySubtitle && (
              <span className="text-xs sm:text-sm text-slate-200 font-light hidden md:inline">
                {displaySubtitle}
              </span>
            )}
          </div>
        </div>

        {linkText && (
          <a
            href={linkUrl}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#CD78B3] hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors shrink-0 cursor-pointer"
          >
            <span>{linkText}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </section>
  );
};
