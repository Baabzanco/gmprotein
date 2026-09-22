import {
  AchievementItem,
  CustomerItem,
  CooperationStep,
  SeasonalCampaign,
  FAQItem,
} from "../types";
import {
  achievementsData,
  customersData,
  cooperationStepsData,
  seasonalCampaignData,
  faqData,
} from "../data/landingData";

export const landingService = {
  async getAchievements(): Promise<AchievementItem[]> {
    try {
      const res = await fetch("/api/v1/landing/achievements");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((a: any, index: number) => ({
            id: a.id || `ach-${index}`,
            value: parseInt(a.value.replace(/[^0-9]/g, ""), 10) || achievementsData[index]?.value || 10,
            suffix: a.suffix || a.value.replace(/[0-9]/g, "") || "+",
            label: a.label,
            description: achievementsData[index]?.description || "",
          }));
        }
      }
    } catch (err) {
      // Fallback
    }
    return achievementsData;
  },

  async getCustomers(): Promise<CustomerItem[]> {
    try {
      const res = await fetch("/api/v1/landing/customers");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((c: any, index: number) => ({
            id: c.id || `cust-${index}`,
            name: c.name,
            category: customersData[index]?.category || "رستوران و هتل",
            logoText: c.name.slice(0, 3),
            subtitle: c.description || customersData[index]?.subtitle || "",
          }));
        }
      }
    } catch (err) {
      // Fallback
    }
    return customersData;
  },

  async getCooperationSteps(): Promise<CooperationStep[]> {
    try {
      const res = await fetch("/api/v1/landing/cooperation-steps");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((s: any, index: number) => ({
            stepNumber: `۰${s.stepNumber || index + 1}`,
            title: s.title,
            subtitle: cooperationStepsData[index]?.subtitle || "مرحله " + (index + 1),
            description: s.description,
          }));
        }
      }
    } catch (err) {
      // Fallback
    }
    return cooperationStepsData;
  },

  async getSeasonalCampaign(): Promise<SeasonalCampaign> {
    try {
      const res = await fetch("/api/v1/landing/campaign");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const c = json.data;
          return {
            title: c.title,
            badge: c.badge || "جشنواره فصلی",
            tagline: c.tagline || seasonalCampaignData.tagline,
            description: c.description,
            image: c.image || seasonalCampaignData.image,
            ctaText: c.ctaText || "مشاهده برش‌ها و استعلام قیمت",
            ctaLink: c.ctaLink || "#store-section",
            highlightDiscount: c.highlightDiscount || "۲۰٪ تخفیف ویژه برش‌های پرمیوم",
            features: c.features || seasonalCampaignData.features,
            expiresAt: c.expiresAt || seasonalCampaignData.expiresAt,
          };
        }
      }
    } catch (err) {
      // Fallback
    }
    return seasonalCampaignData;
  },

  async getFAQ(): Promise<FAQItem[]> {
    try {
      const res = await fetch("/api/v1/landing/faqs");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((f: any) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.category || "عمومی",
          }));
        }
      }
    } catch (err) {
      // Fallback
    }
    return faqData;
  },

  async getSettings(): Promise<Record<string, any>> {
    try {
      const res = await fetch("/api/v1/landing/settings");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      // Fallback
    }
    return {};
  },
};
