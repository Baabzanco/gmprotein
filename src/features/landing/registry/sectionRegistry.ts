import { SectionDefinition } from "../types";
import { SECTION_TYPES } from "./sectionTypes";
import { HeroSection } from "../components/sections/HeroSection";
import { HeroVideoSection } from "../components/sections/HeroVideoSection";
import { SplitContentSection } from "../components/sections/SplitContentSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { StatsSection } from "../components/sections/StatsSection";
import { ProductShowcaseSection } from "../components/sections/ProductShowcaseSection";
import { FAQSection } from "../components/sections/FAQSection";
import { CTASection } from "../components/sections/CTASection";
import { BannerSection } from "../components/sections/BannerSection";

export class SectionRegistry {
  private definitions = new Map<string, SectionDefinition>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // 1. Standard Hero
    this.register({
      type: SECTION_TYPES.HERO,
      label: "هیرو استاندارد",
      description: "بخش معرفی اصلی با تصویر پس‌زمینه، عنوان، زیرعنوان و دکمه‌های اقدام",
      component: HeroSection,
    });

    // 2. Cinematic Video Hero
    this.register({
      type: SECTION_TYPES.HERO_VIDEO,
      label: "هیرو ویدیویی سینمایی",
      description: "ویدیوی تعاملی تمام صفحه با کنترل اسکرول ۶۰ فریم و خط پیشرفت",
      component: HeroVideoSection,
    });

    // 3. Split Content / Editorial
    this.register({
      type: SECTION_TYPES.SPLIT_CONTENT,
      label: "محتوای دو ستونه (روایت و تصویر)",
      description: "چیدمان دو ستونه داستان، ویژگی‌ها و تصویر شاخص با زیرنویس",
      component: SplitContentSection,
    });

    // Alias STORY to SplitContentSection
    this.register({
      type: SECTION_TYPES.STORY,
      label: "روایت و داستان برند",
      description: "معرفی پیشینه و ارزش‌های بنیادین مجموعه",
      component: SplitContentSection,
    });

    // 4. Features & Advantages
    this.register({
      type: SECTION_TYPES.FEATURES,
      label: "مزایا و ویژگی‌ها",
      description: "کارت‌های شبکه‌ای از نقاط قوت و استانداردهای کیفی",
      component: FeaturesSection,
    });

    // 5. Statistics / Achievements
    this.register({
      type: SECTION_TYPES.STATS,
      label: "آمار و دستاوردها",
      description: "شمارنده‌ها و شاخص‌های آماری موفقیت مجموعه",
      component: StatsSection,
    });

    // 6. Product Showcase / Catalog Teaser
    this.register({
      type: SECTION_TYPES.PRODUCT_SHOWCASE,
      label: "ویترین محصولات و فروشگاه",
      description: "نمایش دسته‌بندی‌ها و کاتالوگ محصولات با فرم پیش‌فاکتور",
      component: ProductShowcaseSection,
    });

    // Alias CATEGORIES to ProductShowcaseSection
    this.register({
      type: SECTION_TYPES.CATEGORIES,
      label: "دسته‌بندی‌های محصولات",
      description: "بخش نمایش دسته‌های کالایی",
      component: ProductShowcaseSection,
    });

    // 7. Interactive FAQ
    this.register({
      type: SECTION_TYPES.FAQ,
      label: "پرسش‌های متداول",
      description: "لیست آکاردئونی سوالات و پاسخ‌های پرتکرار مشتریان",
      component: FAQSection,
    });

    // 8. Call To Action (CTA)
    this.register({
      type: SECTION_TYPES.CTA,
      label: "فراخوان اقدام (CTA)",
      description: "باکس جذاب ترغیب به ثبت استعلام و تماس تجاری",
      component: CTASection,
    });

    // 9. Promotional Banner
    this.register({
      type: SECTION_TYPES.BANNER,
      label: "بنر اطلاع‌رسانی و تخفیف",
      description: "نوار باریک افقی جهت اعلام جشنواره‌ها و اطلاعیه‌ها",
      component: BannerSection,
    });
  }

  /**
   * Registers a new section type definition.
   */
  register(definition: SectionDefinition): void {
    this.definitions.set(definition.type.toUpperCase(), definition);
  }

  /**
   * Retrieves a section definition by its type.
   */
  get(type: string): SectionDefinition | undefined {
    if (!type) return undefined;
    return this.definitions.get(type.toUpperCase());
  }

  /**
   * Checks if a section type is registered.
   */
  has(type: string): boolean {
    if (!type) return false;
    return this.definitions.has(type.toUpperCase());
  }

  /**
   * Returns all registered section definitions.
   */
  getAll(): SectionDefinition[] {
    return Array.from(this.definitions.values());
  }
}

export const sectionRegistry = new SectionRegistry();
