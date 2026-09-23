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
import { StorePage } from "./components/store/StorePage";
import { ProductDetailPage } from "./components/products/ProductDetailPage";
import { CampaignSection } from "./components/sections/CampaignSection";
import { FAQSection } from "./components/sections/FAQSection";
import { ContactSection } from "./components/sections/ContactSection";
import { LatestBlogSection } from "./components/sections/LatestBlogSection";
import { BlogListPage } from "./components/blog/BlogListPage";
import { BlogPostPage } from "./components/blog/BlogPostPage";
import { Footer } from "./components/layout/Footer";
import { AdminRoot } from "./components/admin/AdminRoot";

function MainContent() {
  const { path } = useRouter();

  // If path starts with /admin, render the full-featured Management Dashboard
  if (path.startsWith("/admin")) {
    return <AdminRoot />;
  }

  // If path is /store or /products (Standalone Store experience)
  if (path === "/store" || path === "/store/" || path === "/products" || path === "/products/") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-[#CD78B3] selection:text-white transition-colors duration-200">
        <Header />
        <main className="flex-1 w-full pt-20">
          <StorePage />
        </main>
        <Footer />
      </div>
    );
  }

  // If path is /product/:slug or /products/:slug or /store/:slug (Standalone Product Detail Page)
  if (path.startsWith("/product/") || path.startsWith("/products/") || (path.startsWith("/store/") && path !== "/store/")) {
    const slug = path
      .replace(/^\/(product|products|store)\//, "")
      .split("?")[0]
      .split("#")[0];
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-[#CD78B3] selection:text-white transition-colors duration-200">
        <Header />
        <main className="flex-1 w-full pt-20">
          <ProductDetailPage slug={slug} />
        </main>
        <Footer />
      </div>
    );
  }

  // If path is /blog (Blog listing)
  if (path === "/blog" || path === "/blog/") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-[#CD78B3] selection:text-white transition-colors duration-200">
        <Header />
        <main className="flex-1 w-full pt-20">
          <BlogListPage />
        </main>
        <Footer />
      </div>
    );
  }

  // If path starts with /blog/:slug (Blog post article)
  if (path.startsWith("/blog/")) {
    const slug = path.replace(/^\/blog\//, "").split("?")[0].split("#")[0];
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-[#CD78B3] selection:text-white transition-colors duration-200">
        <Header />
        <main className="flex-1 w-full pt-20">
          <BlogPostPage slug={slug} />
        </main>
        <Footer />
      </div>
    );
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

        {/* 10. Latest Blog Posts (جدیدترین مقالات و اخبار) */}
        <LatestBlogSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export function App() {
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

export default App;
