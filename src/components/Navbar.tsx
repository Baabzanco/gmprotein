import React, { useState, useEffect } from "react";
import { siteConfig } from "../config/siteConfig";
import { Phone, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B1E24]/85 backdrop-blur-md border-b border-[#124A57]/60 py-3 shadow-lg shadow-black/20"
          : "bg-gradient-to-b from-[#0B1E24]/80 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Brand Name / Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#124A57] border border-[#CD78B3]/50 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
            <span className="text-[#CD78B3]">PG</span>
          </div>
          <div className="text-right">
            <span className="text-base sm:text-lg font-extrabold text-white block tracking-tight">
              {siteConfig.brandNameFa}
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-light tracking-widest uppercase">
              Gourmet Protein Boutique
            </span>
          </div>
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
          <a
            href="#hero-scroll-section"
            className="hover:text-[#CD78B3] transition-colors"
          >
            تجربه سینمایی
          </a>
          <a
            href="#story-section"
            className="hover:text-[#CD78B3] transition-colors"
          >
            داستان ما
          </a>
          <a
            href="#products"
            className="hover:text-[#CD78B3] transition-colors"
          >
            محصولات منتخب
          </a>
          <a
            href="#standards"
            className="hover:text-[#CD78B3] transition-colors"
          >
            استانداردهای کیفی
          </a>
          <a
            href="#contact"
            className="hover:text-[#CD78B3] transition-colors"
          >
            تماس و شعب
          </a>
        </nav>

        {/* CTA Phone Button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="tel:02122000000"
            id="nav-call-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#124A57] hover:bg-[#195665] border border-[#CD78B3]/40 text-xs font-semibold text-white transition-all shadow-md active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-[#CD78B3]" />
            <span>سفارش تلفنی و مشاوره</span>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="mobile-menu-toggle"
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 rounded-lg bg-[#124A57]/60 text-slate-200 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden bg-[#0B1E24]/95 backdrop-blur-xl border-b border-[#124A57] px-6 py-6 flex flex-col gap-4 text-sm font-medium text-slate-200 shadow-2xl"
        >
          <a
            href="#hero-scroll-section"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-white/5"
          >
            تجربه سینمایی
          </a>
          <a
            href="#story-section"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-white/5"
          >
            داستان ما
          </a>
          <a
            href="#products"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-white/5"
          >
            محصولات منتخب
          </a>
          <a
            href="#standards"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2 border-b border-white/5"
          >
            استانداردهای کیفی
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#CD78B3] py-2"
          >
            تماس و شعب
          </a>
          <div className="pt-2">
            <a
              href="tel:02122000000"
              className="w-full justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#124A57] border border-[#CD78B3]/50 text-xs font-semibold text-white"
            >
              <Phone className="w-4 h-4 text-[#CD78B3]" />
              <span>تماس و سفارش</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
