import React, { useState, useEffect } from "react";
import { CooperationStep } from "../../types";
import { landingService } from "../../services";
import { ArrowLeft, CheckCircle2, GitMerge } from "lucide-react";

export const HowWeWorkSection: React.FC = () => {
  const [steps, setSteps] = useState<CooperationStep[]>([]);

  useEffect(() => {
    landingService.getCooperationSteps().then(setSteps);
  }, []);

  return (
    <section
      id="cooperation"
      className="py-24 sm:py-32 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-t border-[var(--border)] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs text-[#CD78B3] mb-4">
            <GitMerge className="w-3.5 h-3.5" />
            <span>مراحل شفاف و حرفه‌ای تأمین</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
            شیوه همکاری با ما
          </h2>

          <p className="text-[var(--text-secondary)] text-sm sm:text-base font-light max-w-xl mt-3">
            یک مسیر ساختاریافته از نیازسنجی اولیه و انتخاب برش‌های سفارشی تا تحویل پیوسته با بالاترین استاندارد بهداشتی
          </p>
        </div>

        {/* Horizontal Editorial Timeline (Desktop) & Vertical Timeline (Mobile) */}
        <div className="relative">
          {/* Subtle connecting line for desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-20 left-12 right-12 h-0.5 bg-gradient-to-r from-[#124A57]/30 via-[#CD78B3]/60 to-[#124A57]/30 z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={step.stepNumber}
                id={`cooperation-step-${step.stepNumber}`}
                className="group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#CD78B3]/60 transition-all duration-300 shadow-[var(--card-shadow)] hover:shadow-2xl"
              >
                <div>
                  {/* Step Monogram / Number Indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#CD78B3] group-hover:scale-110 transition-transform inline-block">
                      {step.stepNumber}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#124A57] flex items-center justify-center text-white text-xs font-mono shadow-sm">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-[#CD78B3] transition-colors">
                    {step.title}
                  </h3>

                  <span className="text-xs font-medium text-[var(--text-secondary)] block mb-3">
                    {step.subtitle}
                  </span>

                  <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CD78B3]" />
                  <span>استاندارد عملیاتی گلمحمدی</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#124A57] hover:bg-[#1a5b6a] border border-[#CD78B3]/50 text-white text-sm font-semibold transition-all shadow-xl hover:shadow-[#CD78B3]/20 active:scale-95 cursor-pointer"
          >
            <span>شروع گفتگو و درخواست مشاوره تجاری</span>
            <ArrowLeft className="w-4 h-4 text-[#CD78B3]" />
          </a>
        </div>
      </div>
    </section>
  );
};
