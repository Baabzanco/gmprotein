import React from "react";
import { siteConfig } from "../config/siteConfig";
import { MapPin, Phone, Clock, Instagram } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#061216] text-slate-300 border-t border-[#124A57]/60 pt-16 pb-12 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#124A57] border border-[#CD78B3]/50 flex items-center justify-center font-bold text-white text-xs">
                <span className="text-[#CD78B3]">PG</span>
              </div>
              <span className="font-extrabold text-white text-lg tracking-wide">
                {siteConfig.brandNameFa}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-light leading-relaxed max-w-md mb-6">
              ارائه‌دهنده باکیفیت‌ترین برش‌های گوشت تازه، مرغ ارگانیک و فرآورده‌های پروتئینی دستچین با استانداردهای بین‌المللی قصابی مدرن در تهران.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#124A57]/50 hover:bg-[#124A57] border border-[#184550] flex items-center justify-center text-slate-300 hover:text-[#CD78B3] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="tel:02122000000"
                aria-label="Phone"
                className="w-9 h-9 rounded-full bg-[#124A57]/50 hover:bg-[#124A57] border border-[#184550] flex items-center justify-center text-slate-300 hover:text-[#CD78B3] transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Contact Details */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 border-b border-[#124A57] pb-2">
              ارتباط با ما
            </h4>
            <ul className="space-y-3 text-xs text-slate-400 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#CD78B3] shrink-0 mt-0.5" />
                <span>تهران، خیابان ولیعصر، نرسیده به میدان تجریش، بوتیک پروتئین گلمحمدی</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#CD78B3] shrink-0" />
                <span dir="ltr">021 - 2200 0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#CD78B3] shrink-0" />
                <span>همه‌روزه از ساعت ۸:۳۰ صبح تا ۲۲:۰۰</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 border-b border-[#124A57] pb-2">
              دسترسی سریع
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#hero-scroll-section" className="hover:text-[#CD78B3] transition-colors">
                  تجربه سینمایی هدر
                </a>
              </li>
              <li>
                <a href="#story-section" className="hover:text-[#CD78B3] transition-colors">
                  روایت اصالت و داستان ما
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-[#CD78B3] transition-colors">
                  برش‌های استیک و گوسفندی
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-[#CD78B3] transition-colors">
                  معیارها و گواهینامه‌های کیفی
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-light gap-4">
          <p>© {new Date().getFullYear()} تمامی حقوق محفوظ است • {siteConfig.brandNameFa}</p>
          <span className="text-[11px] text-slate-600 font-mono tracking-wider">
            {siteConfig.brandName} • Fine Meats & Protein
          </span>
        </div>
      </div>
    </footer>
  );
};
