/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { RouterProvider, useRouter } from "./context/RouterContext";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/layout/Header";
import { ScrollVideoHero } from "./components/ScrollVideoHero";
import { StorySection } from "./components/sections/StorySection";
import { AchievementsSection } from "./components/sections/AchievementsSection";
import { CustomersSection } from "./components/sections/CustomersSection";
import { HowWeWorkSection } from "./components/sections/HowWeWorkSection";
import { StoreSection } from "./components/sections/StoreSection";
import { CampaignSection } from "./components/sections/CampaignSection";
import { FAQSection } from "./components/sections/FAQSection";
import { ContactSection } from "./components/sections/ContactSection";
import { Footer } from "./components/layout/Footer";
import { AdminRoot } from "./components/admin/AdminRoot";

function MainContent() {
  const { path } = useRouter();

  // If path starts with /admin, render the full-featured Management Dashboard
  if (path.startsWith("/admin")) {
    return <AdminRoot />;
  }

  // Otherwise, render the complete public website with cinematic video hero & all sections preserved
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-[#CD78B3] selection:text-white transition-colors duration-200">
      {/* 
        Header:
        - Transparent & minimal over the cinematic hero
        - Solid backdrop-blur & refined navigation when scrolling past hero
        - Includes high-end Theme Toggle (Sun/Moon)
      */}
      <Header />

      {/* Main Content Area structured in exact requested sequence */}
      <main className="flex-1 w-full">
        {/* 1. Cinematic Hero (ScrollVideoHero preserved with full behavior) */}
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
      </main>

      {/* 10. Footer (فوتر مجلل با کپی‌رایت، ناوبری و اطلاعات تماس) */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AuthProvider>
          <MainContent />
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}
