import React, { useState, useEffect } from "react";
import { CustomerItem } from "../../types";
import { landingService } from "../../services";
import { Building2, ShieldCheck, Star } from "lucide-react";

export const CustomersSection: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);

  useEffect(() => {
    landingService.getCustomers().then(setCustomers);
  }, []);

  return (
    <section
      id="customers"
      className="py-24 bg-[var(--bg-primary)] text-[var(--text-primary)] border-t border-[var(--border)] relative"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-bg)] text-xs text-[#CD78B3] mb-3 border border-[var(--badge-border)]">
              <Building2 className="w-3.5 h-3.5" />
              <span>مشتریان و شرکای تجاری</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              مشتریان ما
            </h2>
          </div>

          <p className="text-sm text-[var(--text-secondary)] font-light max-w-md">
            افتخار همراهی با برترین هتل‌های پنج‌ستاره، رستوران‌های بنام، سازمان‌ها و سرآشپزان صاحب‌سبک کشور
          </p>
        </div>

        {/* Elegant Customer Grid with Monogram & Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <div
              key={c.id}
              id={`customer-badge-${c.id}`}
              className="group p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#CD78B3]/60 transition-all duration-300 hover:shadow-xl shadow-[var(--card-shadow)] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-6">
                {/* Minimalist Monogram / Logo Mark */}
                <div className="w-14 h-14 rounded-xl bg-[var(--surface-card-alt)] border border-[var(--border)] group-hover:border-[#CD78B3]/50 flex items-center justify-center font-mono font-bold text-[var(--text-secondary)] group-hover:text-[#CD78B3] transition-colors shadow-inner">
                  {c.logoText.slice(0, 2)}
                </div>

                <div className="flex items-center gap-1 text-[#CD78B3] text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#CD78B3]" />
                  <span className="font-mono text-[11px]">B2B VIP</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono tracking-widest text-[#CD78B3] uppercase block mb-1">
                  {c.logoText}
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 transition-colors">
                  {c.name}
                </h3>
                <span className="inline-block text-[11px] text-[var(--text-muted)] bg-[var(--tag-bg)] px-2.5 py-0.5 rounded-full mb-3">
                  {c.category}
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed border-t border-[var(--border)] pt-3">
                  {c.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Endorsement Sub-bar */}
        <div className="mt-14 p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#CD78B3] shrink-0" />
            <span>قراردادهای رسمی تأمین متمرکز، فاکتور معتبر و ارسال روزانه با دیتالاگر سلامت دما</span>
          </div>
          <a
            href="#cooperation"
            className="text-[var(--text-primary)] hover:text-[#CD78B3] font-medium transition-colors underline underline-offset-4"
          >
            آشنایی با شرایط همکاری تجاری
          </a>
        </div>
      </div>
    </section>
  );
};
