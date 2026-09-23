import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { Flame, ArrowLeft, Check, Clock, ChevronRight, ChevronLeft } from "lucide-react";

export const CampaignSection: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    adminService.getPublicActiveCampaigns()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCampaigns(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!campaigns || campaigns.length === 0) return null;

  const campaign = campaigns[currentIndex] || campaigns[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  return (
    <section
      id="campaign-section"
      className="py-24 bg-[var(--bg-primary)] text-[var(--text-primary)] border-t border-[var(--border)] relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 bg-[#CD78B3]/15 rounded-full blur-[120px]"
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#124A57] via-[#0E353E] to-[#08171C] border border-[#CD78B3]/40 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-radial from-[#CD78B3]/15 to-transparent blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-[#CD78B3]/50 text-xs text-[#CD78B3] backdrop-blur-md">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{campaign.badge || "جشنواره ویژه"}</span>
                </div>

                {campaigns.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/80 transition-colors cursor-pointer"
                      title="قبلی"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-300 font-mono">
                      {currentIndex + 1} / {campaigns.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/80 transition-colors cursor-pointer"
                      title="بعدی"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {campaign.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-200 font-light leading-relaxed max-w-xl">
                {campaign.description}
              </p>

              {campaign.features && campaign.features.length > 0 && (
                <ul className="space-y-3 pt-2">
                  {campaign.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-[#CD78B3]/30 border border-[#CD78B3] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#CD78B3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href={campaign.ctaLink || "#store-section"}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#CD78B3] hover:bg-[#b8619e] text-white font-bold text-sm transition-all shadow-xl shadow-[#CD78B3]/30 active:scale-95 cursor-pointer"
                >
                  <span>{campaign.ctaLabel || "مشاهده و استعلام"}</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>

                {campaign.endAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-200 bg-black/40 border border-white/15 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-[#CD78B3]" />
                    <span>مهلت اعتبار: تا {new Date(campaign.endAt).toLocaleDateString("fa-IR")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden border border-[#CD78B3]/40 shadow-2xl relative group aspect-[4/3]">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 right-6 left-6 text-right">
                  <span className="text-[11px] font-mono tracking-widest text-[#CD78B3] uppercase block mb-1">
                    Special Seasonal Offer
                  </span>
                  <span className="text-lg font-bold text-white block">
                    {campaign.highlightDiscount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
