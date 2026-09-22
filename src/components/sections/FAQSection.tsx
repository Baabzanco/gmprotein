import React, { useState, useEffect } from "react";
import { FAQItem } from "../../types";
import { landingService } from "../../services";
import { HelpCircle, ChevronDown } from "lucide-react";

export const FAQSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<string | null>("faq-quote");

  useEffect(() => {
    landingService.getFAQ().then(setFaqs);
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq-section"
      className="py-24 sm:py-32 bg-[var(--bg-primary)] text-[var(--text-primary)] border-t border-[var(--border)] relative"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs text-[#CD78B3] mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>شفافیت و پاسخ به پرسش‌ها</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
            سوالات متداول
          </h2>

          <p className="text-[var(--text-secondary)] text-sm sm:text-base font-light max-w-xl mt-3">
            پاسخ‌های شفاف درباره فرآیند استعلام قیمت، صدور پیش‌فاکتور، کنترل زنجیره سرد و نحوه عقد قراردادهای تأمین
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full text-right p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]/50 cursor-pointer"
                >
                  <span className="font-bold text-base sm:text-lg text-[var(--text-primary)]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[#CD78B3] shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 bg-[#CD78B3] text-white border-transparent"
                        : "bg-[var(--surface-card-alt)]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-item-${faq.id}`}
                    className="px-6 pb-6 sm:px-7 sm:pb-7 text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed border-t border-[var(--border)] pt-4 animate-fadeIn"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional support contact note */}
        <div className="mt-12 text-center text-xs text-[var(--text-muted)]">
          سوال دیگری دارید که در لیست بالا نیست؟{" "}
          <a
            href="#contact"
            className="text-[#CD78B3] font-medium hover:underline underline-offset-4"
          >
            با کارشناسان پشتیبانی و فروش در ارتباط باشید
          </a>
        </div>
      </div>
    </section>
  );
};
