import React, { useState, useEffect, useRef } from "react";
import { AchievementItem } from "../../types";
import { landingService } from "../../services";
import { TrendingUp } from "lucide-react";

export const AchievementsSection: React.FC = () => {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [inView, setInView] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    landingService.getAchievements().then((data) => setItems(data));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="achievements"
      ref={sectionRef}
      className="py-24 sm:py-32 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-t border-[var(--border)] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs text-[#CD78B3] mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>شاخص‌های اطمینان و تعهد</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
            دستاوردهای ما
          </h2>

          <p className="text-[var(--text-secondary)] text-sm sm:text-base font-light max-w-xl mt-3">
            کارنامه ما در تأمین پایدار، رضایت مشتریان و رعایت سختگیرانه‌ترین معیارهای بهداشتی
          </p>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <CounterCard
              key={item.id}
              item={item}
              triggerAnimation={inView}
              delay={idx * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface CounterCardProps {
  item: AchievementItem;
  triggerAnimation: boolean;
  delay: number;
}

const CounterCard: React.FC<CounterCardProps> = ({ item, triggerAnimation, delay }) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (!triggerAnimation) return;

    let start = 0;
    const end = item.value;
    const duration = 1600; // ms
    const startTime = performance.now();

    const timer = setTimeout(() => {
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * end);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(end);
        }
      };
      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timer);
  }, [triggerAnimation, item.value, delay]);

  return (
    <div
      id={`achievement-card-${item.id}`}
      className="p-8 rounded-3xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#CD78B3]/60 transition-all duration-300 flex flex-col justify-between group shadow-[var(--card-shadow)] hover:shadow-xl"
    >
      <div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight font-mono group-hover:text-[#CD78B3] transition-colors">
            {displayValue}
          </span>
          {item.suffix && (
            <span className="text-lg font-bold text-[#CD78B3] font-sans">
              {item.suffix}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{item.label}</h3>

        <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <span className="w-8 h-1 bg-[#124A57] rounded-full group-hover:bg-[#CD78B3] transition-colors" />
        <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">VERIFIED</span>
      </div>
    </div>
  );
};
