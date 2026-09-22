export type Theme = "dark" | "light";

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  pricePerKg?: number;
  discount?: number;
  available: boolean;
  cutType?: string;
  origin?: string;
  recommendedFor?: string;
}

export interface AchievementItem {
  id: string;
  value: number;
  suffix?: string;
  label: string;
  description: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  category: string;
  logoText: string;
  subtitle: string;
}

export interface CooperationStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface SeasonalCampaign {
  title: string;
  badge: string;
  tagline: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  highlightDiscount: string;
  features: string[];
  expiresAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface QuotationRequestPayload {
  productId: string;
  productName: string;
  weightKg: number;
  quantityPackages: number;
  customerName: string;
  phone: string;
  companyName?: string;
  notes?: string;
}

export interface ContactRequestPayload {
  fullName: string;
  phone: string;
  companyName?: string;
  subject: string;
  message: string;
}
