import React, { useState, useEffect } from "react";
import { siteConfig } from "../../config/siteConfig";
import { Phone, Menu, X, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "../common/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

export const Header: React.FC = () => {
  const [isPastHero, setIsPastHero] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      // Detect when scrolled past initial hero video
      const scrollY = window.scrollY;
      const heroSection = document.getElementById("hero-scroll-section");
      if (heroSection) {
        // Transition header styling as soon as user progresses into landing page
        if (scrollY > window.innerHeight * 1.5) {
          setIsPastHero(true);
        } else {
          setIsPastHero(false);
        }
      } else {
        setIsPastHero(scrollY > 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isPastHero
          ? isDark
            ? "bg-[#0B1E24]/90 backdrop-blur-xl border-b border-[#124A57]/80 py-3 shadow-xl shadow-black/30"
            : "bg-[#F7F5F2]/92 backdrop-blur-xl border-b border-[rgba(18,74,87,0.12)] py-3 shadow-sm shadow-[rgba(18,74,87,0.06)]"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
        {/* Brand Monogram & Name */}
        <a href="#" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-full bg-[#124A57] border border-[#CD78B3]/60 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
            <span className="text-[#CD78B3]">PG</span>
          </div>
          <div className="text-right">
            <span
              className={`text-base sm:text-lg font-extrabold block tracking-tight transition-colors ${
                isPastHero
                  ? isDark
                    ? "text-white"
                    : "text-[#124A57]"
                  : "text-white drop-shadow"
              }`}
            >
              {siteConfig.brandNameFa}
            </span>
            <span
              className={`text-[10px] block -mt-1 font-light tracking-widest uppercase font-mono ${
                isPastHero
                  ? isDark
                    ? "text-slate-400"
                    : "text-[#53656A]"
                  : "text-slate-300"
              }`}
            >
              Protein Golmohammadi
            </span>
          </div>
        </a>

        {/* Desktop Navigation Items */}
        <nav
          className={`hidden lg:flex items-center gap-7 text-xs sm:text-sm font-medium transition-colors ${
            isPastHero
              ? isDark
                ? "text-slate-200"
                : "text-[#124A57]"
              : "text-white/90 drop-shadow"
          }`}
        >
          <a
            href="#hero-scroll-section"
            className="hover:text-[#CD78B3] transition-colors"
          >
            خانه
          </a>
          <a
            href="#story-section"
            className="hover:text-[#CD78B3] transition-colors"
          >
            داستان ما
          </a>
          <a
            href="#store-section"
            className="hover:text-[#CD78B3] transition-colors"
          >
            محصولات
          </a>
          <a
            href="#cooperation"
            className="hover:text-[#CD78B3] transition-colors"
          >
            شیوه همکاری
          </a>
          <a
            href="#faq-section"
            className="hover:text-[#CD78B3] transition-colors"
          >
            سوالات متداول
          </a>
          <a
            href="#contact"
            className="hover:text-[#CD78B3] transition-colors"
          >
            تماس با ما
          </a>
        </nav>

        {/* Header CTA Buttons & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          <a
            href="#store-section"
            id="header-cta-store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CD78B3] hover:bg-[#b8619e] text-white text-xs font-bold transition-all shadow-md shadow-[#CD78B3]/25 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>فروشگاه</span>
          </a>

          <a
            href="tel:02122000000"
            id="header-cta-phone"
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-medium transition-all ${
              isPastHero && !isDark
                ? "bg-white hover:bg-slate-50 border-[rgba(18,74,87,0.18)] text-[#124A57]"
                : "bg-[#124A57] hover:bg-[#1a5b6a] border-[#184550] text-white"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#CD78B3]" />
            <span dir="ltr">021 - 2200 0000</span>
          </a>
        </div>

        {/* Mobile Actions: Theme Toggle + Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-btn"
            aria-label="منوی ناوبری"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isPastHero && !isDark
                ? "bg-white border border-[rgba(18,74,87,0.15)] text-[#124A57]"
                : "bg-[#124A57]/70 text-slate-200 hover:text-white"
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className={`lg:hidden backdrop-blur-2xl border-b px-6 py-8 flex flex-col gap-4 text-sm font-medium shadow-2xl animate-fadeIn ${
            isDark
              ? "bg-[#08171C]/98 border-[#184550] text-slate-200"
              : "bg-[#FFFFFF]/98 border-[rgba(18,74,87,0.12)] text-[#124A57]"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10">
            <span className="text-xs font-bold">پوسته نمایش:</span>
            <ThemeToggle showLabel={true} />
          </div>

          <a
            href="#hero-scroll-section"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-current/5"
          >
            خانه (تجربه سینمایی)
          </a>
          <a
            href="#story-section"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-current/5"
          >
            داستان ما
          </a>
          <a
            href="#store-section"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-current/5"
          >
            محصولات
          </a>
          <a
            href="#cooperation"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-current/5"
          >
            شیوه همکاری
          </a>
          <a
            href="#faq-section"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-current/5"
          >
            سوالات متداول
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2"
          >
            تماس با ما
          </a>

          <div className="pt-4 flex flex-col gap-3">
            <a
              href="#store-section"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full justify-center inline-flex items-center gap-2 py-3 rounded-full bg-[#CD78B3] text-white text-xs font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ورود به فروشگاه اینترنتی</span>
            </a>
            <a
              href="tel:02122000000"
              className="w-full justify-center inline-flex items-center gap-2 py-3 rounded-full bg-[#124A57] text-white text-xs font-medium"
            >
              <Phone className="w-4 h-4 text-[#CD78B3]" />
              <span>تماس مستقیم با واحد سفارشات</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
