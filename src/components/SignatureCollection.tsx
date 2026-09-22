import React, { useState } from "react";
import { Sparkles, Check, ChevronLeft } from "lucide-react";

interface ProductItem {
  id: string;
  nameFa: string;
  nameEn: string;
  category: "beef" | "lamb" | "poultry" | "marinated";
  desc: string;
  cutType: string;
  freshness: string;
}

const PRODUCTS: ProductItem[] = [
  {
    id: "cut-ribeye",
    nameFa: "استیک ریب‌آی ممتاز (Ribeye Steak)",
    nameEn: "Prime Ribeye Steak",
    category: "beef",
    desc: "ماربلینگ بی‌نظیر با چربی درون‌بافتی جهت دستیابی به حداکثر تردی و طعم لذیذ کاراملی در پخت استیک.",
    cutType: "راسته با استخوان / بدون استخوان",
    freshness: "کشتار روز و بیژن‌های سردخانه‌ای استریل",
  },
  {
    id: "cut-tenderloin",
    nameFa: "فیله گوساله دستچین (Tenderloin)",
    nameEn: "Selected Beef Tenderloin",
    category: "beef",
    desc: "نرم‌ترین و لطیف‌ترین بخش گوشت راسته، کاملاً عاری از چربی اضافه، ایده‌آل برای استیک مینیون و بفتک مجلسی.",
    cutType: "برش استوانه‌ای خالص",
    freshness: "بسته‌بندی وکیوم تحت خلاء",
  },
  {
    id: "cut-shashlik",
    nameFa: "دنده گوسفندی شاندیزی (Lamb Chops)",
    nameEn: "Artisanal Lamb Chops",
    category: "lamb",
    desc: "تهیه شده از بره‌های جوان نژاد شال و سنگسر، برش خورده با اره استخوان‌بر دقیق برای کباب شیشلیک درباری.",
    cutType: "دنده شاندیزی ۶ تکه",
    freshness: "زنجیره سرمایش ۴ درجه سانتی‌گراد",
  },
  {
    id: "cut-lamb-shank",
    nameFa: "ماهیچه گوسفندی مخصوص چلو گوشت",
    nameEn: "Fresh Lamb Shank",
    category: "lamb",
    desc: "بافت لطیف و ژلاتینی با عطر طبیعی گوشت تازه، ایده‌آل برای باقالی‌پلو با ماهیچه سنتی و خورش‌های فاخر ایرانی.",
    cutType: "ماهیچه کامل با استخوان مغزدار",
    freshness: "تحویل روزانه در پک بهداشتی",
  },
  {
    id: "cut-marinated-steak",
    nameFa: "استیک طعم‌دار رزماری و کره سیر",
    nameEn: "Rosemary & Garlic Butter Steak",
    category: "marinated",
    desc: "مرینیت شده به مدت ۲۴ ساعت در سس انحصاری سرآشپز با روغن زیتون فرابکر، دانه‌های فلفل سیاه و رزماری وحشی.",
    cutType: "استیک بیف خوابانده شده",
    freshness: "آماده طبخ فوری در تابه یا گریل",
  },
  {
    id: "cut-chicken-breast",
    nameFa: "فیله مرغ ارگانیک طعم‌دار زعفرانی",
    nameEn: "Saffron Marinated Tender Chicken",
    category: "poultry",
    desc: "برش‌های یکدست فیله مرغ عاری از هورمون و آنتی‌بیوتیک، مرینیت شده با زعفران قائنات و آبلیموی تازه جهرم.",
    cutType: "فیله خالص بدون استخوان و پوست",
    freshness: "تازگی حداکثری و آماده سیخ‌گیری",
  },
];

export const SignatureCollection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section id="products" className="py-24 bg-[#08171C] text-slate-100 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#124A57]/60 text-xs text-[#CD78B3] mb-3 border border-[#124A57]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مجموعه برش‌های برگزیده</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              برش‌های ممتاز پروتئین گلمحمدی
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "همه محصولات" },
              { id: "beef", label: "گوساله و استیک" },
              { id: "lamb", label: "گوسفندی" },
              { id: "poultry", label: "ماکیان و مرغ" },
              { id: "marinated", label: "آماده طبخ مرینیت" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeCategory === tab.id
                    ? "bg-[#CD78B3] text-white shadow-md shadow-[#CD78B3]/25"
                    : "bg-[#0e272f] hover:bg-[#124A57] text-slate-300 border border-[#184550]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              id={`product-card-${item.id}`}
              className="group flex flex-col justify-between rounded-2xl bg-[#0b1e24] border border-[#184550] hover:border-[#CD78B3]/60 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#124A57]/20"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono tracking-wider text-[#CD78B3] uppercase">
                    {item.nameEn}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#124A57]/60 text-slate-300 border border-[#124A57]">
                    {item.cutType}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#CD78B3] transition-colors">
                  {item.nameFa}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-light mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#184550]/70 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>{item.freshness}</span>
                </div>

                <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1">
                  مشاوره برش
                  <ChevronLeft className="w-3.5 h-3.5 text-[#CD78B3]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
