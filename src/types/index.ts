export type Theme = "dark" | "light";

export interface ProductFeature {
  id?: string;
  productId?: string;
  name: string;
  value: string;
  sortOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: string;
  categoryId?: string;
  sku?: string;
  image: string;
  description: string;
  shortDescription?: string;
  pricePerKg?: number;
  basePrice?: number;
  effectivePrice?: number;
  unit?: string;
  minimumOrder?: number;
  discount?: number;
  available: boolean;
  isAvailable?: boolean;
  isFeatured?: boolean;
  cutType?: string;
  origin?: string;
  recommendedFor?: string;
  allowCustomWeight?: boolean;
  features?: ProductFeature[];
  images?: { id?: string; url: string; isPrimary?: boolean; sortOrder?: number }[];
  packageOptions?: { id?: string; weightKg: number; label: string; isDefault?: boolean; sortOrder?: number; isActive?: boolean }[];
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  url: string;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  alt?: string | null;
  caption?: string | null;
  referencedBy?: string[];
  createdAt: string;
  updatedAt: string;
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
