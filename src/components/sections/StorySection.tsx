import React from "react";
import { Award, Compass, Sparkles, Check } from "lucide-react";

export const StorySection: React.FC = () => {
  return (
    <section
      id="story-section"
      className="relative w-full bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 sm:py-36 px-6 sm:px-12 border-t border-[var(--border)] overflow-hidden"
    >
      {/* Editorial ambient background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 w-[600px] h-[600px] bg-[#124A57]/15 rounded-full blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-10 w-[500px] h-[500px] bg-[#CD78B3]/10 rounded-full blur-[160px]"
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Overline & Title */}
        <div className="flex flex-col items-start mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs sm:text-sm text-[#CD78B3] mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium tracking-wide">روایت اصالت و هنر پروتئین</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight sm:leading-snug max-w-4xl">
            داستان پروتئین گلمحمدی
          </h2>

          <p className="text-lg sm:text-2xl text-[var(--text-secondary)] font-light mt-4 max-w-3xl leading-relaxed">
            تلاقی تجربه چند ده‌ساله در صنعت گوشت با دانش نوین زنجیره سرد و قصابی کلاسیک.
          </p>
        </div>

        {/* Editorial Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Narrative Paragraphs */}
          <div className="lg:col-span-7 space-y-8 text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] backdrop-blur-md relative overflow-hidden">
              <span className="text-[120px] font-serif text-[var(--color-primary)]/10 absolute -top-10 left-4 select-none pointer-events-none leading-none">
                PG
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-4">
                تعهد به برترین استاندارد کشتار و سلامت
              </h3>
              <p className="mb-4">
                مسیر پروتئین گلمحمدی از یک باور بنیادین آغاز شد: <strong className="text-[var(--text-primary)] font-semibold">«کیفیت گوشت سر میز غذا، حاصل احترام به تک‌تک مراحل زیست، تغذیه و فرآوری دام است»</strong>. با درک نیاز رو به رشد مصرف‌کنندگان فهیم و رستوران‌های برتر کشور به گوشت استاندارد، ما ساختاری یکپارچه را بنا نهادیم تا فاصله‌ی میان مزارع کنترل‌شده تا آشپزخانه را به امن‌ترین و شفاف‌ترین شیوه بپیماییم.
              </p>
              <p>
                در این مجموعه، هر دام نه بر پایه کمیت، بلکه بر اساس شاخص‌های دقیق سلامت بیولوژیکی، سن مناسب کشتار و نسبت ایده‌آل بافت چربی میان‌عضلانی انتخاب می‌شود. این نگاه دقیق تضمین می‌کند که طعم اصیل و بافت ترد گوشت در هنگام طبخ حفظ گردد.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] mb-4 shadow-sm">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[var(--text-primary)] text-base mb-2">توسعه و فناوری نوین توزیع</h4>
                  <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed">
                    گذر از سیستم‌های سنتی به سامانه‌های مکانیزه توزیع با پایش لحظه‌ای دما، تحولی نو در رساندن محصولات تازه به دست مشتریان رقم زده است.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[#CD78B3]">
                  <Check className="w-3.5 h-3.5" />
                  <span>پایش پیوسته ترموگرافی</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] mb-4 shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[var(--text-primary)] text-base mb-2">هنر قصابی و استیک‌های تخصصی</h4>
                  <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed">
                    استفاده از استادکاران مجرب قصابی جهت اجرای برش‌های آرتسیان بین‌المللی متناسب با استانداردهای سرآشپزان جهان.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[#CD78B3]">
                  <Check className="w-3.5 h-3.5" />
                  <span>برش‌های سفارشی میلی‌متری</span>
                </div>
              </div>
            </div>

            <p className="text-[var(--text-muted)] text-sm sm:text-base border-r-2 border-[#CD78B3] pr-4">
              ما افتخار می‌کنیم که امروز، نام گلمحمدی به امضای اطمینان خانواده‌ها، ضیافت‌های فاخر و خوشنام‌ترین مطبخ‌های شهری بدل شده است.
            </p>
          </div>

          {/* Right Column: Editorial Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface-card)] shadow-2xl group">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
                  alt="Fine Butchery Craftsmanship"
                  className="w-full h-full object-cover object-center filter contrast-[1.05] brightness-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Editorial Caption Tag */}
              <div className="p-8 relative -mt-20 backdrop-blur-md bg-[var(--surface-card)]/90 border-t border-[var(--border)] rounded-b-3xl">
                <span className="text-[11px] font-mono tracking-widest text-[#CD78B3] uppercase block mb-1">
                  Craftsmanship & Heritage
                </span>
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  دقت در جزئیات، اصالت در طعم
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                  از دستچین کردن لاشه تا بسته‌بندی در محفظه‌های استاندارد بهداشتی، هیچ مصالحه‌ای در کیفیت وجود ندارد.
                </p>
              </div>
            </div>

            {/* Floating Brand Badge */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-[#124A57] border border-[#CD78B3]/50 p-4 rounded-2xl shadow-xl items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/30 border border-[#CD78B3]/30 flex items-center justify-center text-[#CD78B3] font-bold text-sm">
                PG
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white block">کیفیت پایدار</span>
                <span className="text-[10px] text-slate-200 block">زنجیره سرد از مبدأ تا مقصد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
