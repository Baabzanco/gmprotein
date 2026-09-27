import React from "react";
import { Sparkles, Check } from "lucide-react";
import { SectionComponentProps } from "../../types";
import { safeObject, safeArray, safeString } from "../../registry/sectionSchemas";

export const SplitContentSection: React.FC<SectionComponentProps> = ({
  title,
  subtitle,
  badge,
  content,
}) => {
  const c = safeObject(content);

  const displayBadge = badge || safeString(c.badge, "روایت اصالت و هنر پروتئین");
  const displayTitle = title || safeString(c.title, "داستان پروتئین گلمحمدی");
  const displaySubtitle =
    subtitle ||
    safeString(
      c.subtitle,
      "تلاقی تجربه چند ده‌ساله در صنعت گوشت با دانش نوین زنجیره سرد و قصابی کلاسیک."
    );

  const mainParagraph = safeString(
    c.mainParagraph || c.body,
    "مسیر پروتئین گلمحمدی از یک باور بنیادین آغاز شد: «کیفیت گوشت سر میز غذا، حاصل احترام به تک‌تک مراحل زیست، تغذیه و فرآوری دام است». با درک نیاز رو به رشد مصرف‌کنندگان فهیم و رستوران‌های برتر کشور به گوشت استاندارد، ما ساختاری یکپارچه را بنا نهادیم تا فاصله‌ی میان مزارع کنترل‌شده تا آشپزخانه را به امن‌ترین و شفاف‌ترین شیوه بپیماییم."
  );

  const secondaryParagraph = safeString(
    c.secondaryParagraph,
    "در این مجموعه، هر دام نه بر پایه کمیت، بلکه بر اساس شاخص‌های دقیق سلامت بیولوژیکی، سن مناسب کشتار و نسبت ایده‌آل بافت چربی میان‌عضلانی انتخاب می‌شود. این نگاه دقیق تضمین می‌کند که طعم اصیل و بافت ترد گوشت در هنگام طبخ حفظ گردد."
  );

  const bullets = safeArray<{ title?: string; desc?: string }>(c.bullets, [
    {
      title: "توسعه و فناوری نوین توزیع",
      desc: "گذر از سیستم‌های سنتی به سامانه‌های مکانیزه توزیع با پایش لحظه‌ای دما در سراسر مسیر.",
    },
    {
      title: "هنر قصابی و استیک‌های تخصصی",
      desc: "استفاده از استادکاران مجرب قصابی جهت اجرای برش‌های آرتسیان بین‌المللی.",
    },
  ]);

  const imageUrl = safeString(
    c.imageUrl || c.image,
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
  );
  const imageCaption = safeString(c.imageCaption, "دقت در جزئیات، اصالت در طعم");

  return (
    <section className="relative w-full bg-[var(--bg-primary)] text-[var(--text-primary)] py-24 sm:py-32 px-6 sm:px-12 border-t border-[var(--border)] overflow-hidden">
      {/* Background Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 w-[600px] h-[600px] bg-[#124A57]/10 rounded-full blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-10 w-[500px] h-[500px] bg-[#CD78B3]/10 rounded-full blur-[160px]"
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-start mb-16 sm:mb-20">
          {displayBadge && (
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs sm:text-sm text-[#CD78B3] mb-5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium tracking-wide">{displayBadge}</span>
            </div>
          )}

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight sm:leading-snug max-w-4xl">
            {displayTitle}
          </h2>

          {displaySubtitle && (
            <p className="text-lg sm:text-2xl text-[var(--text-secondary)] font-light mt-4 max-w-3xl leading-relaxed">
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Content Column */}
          <div className="lg:col-span-7 space-y-8 text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] backdrop-blur-md relative overflow-hidden">
              <p className="mb-4">{mainParagraph}</p>
              {secondaryParagraph && <p>{secondaryParagraph}</p>}
            </div>

            {bullets.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bullets.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] text-base mb-2">
                        {safeString(b.title, `ویژگی ${idx + 1}`)}
                      </h4>
                      <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed">
                        {safeString(b.desc)}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[#CD78B3]">
                      <Check className="w-3.5 h-3.5" />
                      <span>تأییدیه کیفی استاندارد</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface-card)] shadow-2xl group">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={imageUrl}
                  alt={displayTitle}
                  className="w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {imageCaption && (
                <div className="p-8 relative -mt-20 backdrop-blur-md bg-[var(--surface-card)]/90 border-t border-[var(--border)] rounded-b-3xl">
                  <span className="text-[11px] font-mono tracking-widest text-[#CD78B3] uppercase block mb-1">
                    Craftsmanship & Heritage
                  </span>
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    {imageCaption}
                  </h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
