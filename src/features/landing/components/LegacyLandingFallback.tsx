import React from "react";
import { ScrollVideoHero } from "../../../components/ScrollVideoHero";
import { StorySection } from "../../../components/sections/StorySection";
import { AchievementsSection } from "../../../components/sections/AchievementsSection";
import { CustomersSection } from "../../../components/sections/CustomersSection";
import { HowWeWorkSection } from "../../../components/sections/HowWeWorkSection";
import { StoreSection } from "../../../components/sections/StoreSection";
import { CampaignSection } from "../../../components/sections/CampaignSection";
import { FAQSection } from "../../../components/sections/FAQSection";
import { ContactSection } from "../../../components/sections/ContactSection";
import { LatestBlogSection } from "../../../components/sections/LatestBlogSection";

/**
 * Temporary Compatibility Fallback
 * 
 * IMPORTANT:
 * This component is an isolated backward-compatibility adapter.
 * It is rendered when the `LandingSection` database table is empty or while transitioning
 * from legacy static/custom sections to the dynamic Landing Section CMS.
 * It ensures the live website remains 100% complete and operational during Phase 2B.
 */
export const LegacyLandingFallback: React.FC = () => {
  return (
    <>
      {/* 1. Cinematic Hero */}
      <ScrollVideoHero />

      {/* 2. Brand Story (داستان پروتئین گلمحمدی) */}
      <StorySection />

      {/* 3. Achievements (دستاوردهای ما) */}
      <AchievementsSection />

      {/* 4. Customers (مشتریان ما) */}
      <CustomersSection />

      {/* 5. How We Work (شیوه همکاری با ما) */}
      <HowWeWorkSection />

      {/* 6. Online Store (فروشگاه اینترنتی با فرم استعلام پیش‌فاکتور) */}
      <StoreSection />

      {/* 7. Seasonal Campaign (پیشنهادهای ویژه فصل) */}
      <CampaignSection />

      {/* 8. FAQ (سوالات متداول) */}
      <FAQSection />

      {/* 9. Contact Request (درخواست تماس) */}
      <ContactSection />

      {/* 10. Latest Blog Posts (جدیدترین مقالات و اخبار) */}
      <LatestBlogSection />
    </>
  );
};
