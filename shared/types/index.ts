// Shared TypeScript types for Protein Golmohammadi platform

export type RoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CONTENT_MANAGER"
  | "PRODUCT_MANAGER"
  | "SALES_MANAGER"
  | "SUPPORT"
  | "VIEWER";

export type PermissionAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "MANAGE";

export type QuotationStatus =
  | "PENDING"
  | "REVIEWING"
  | "QUOTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type ContactRequestStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type NavigationLocation = "HEADER" | "FOOTER" | "MOBILE" | "SIDEBAR";

// Standard API Response Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    timestamp?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PermissionDTO {
  id: string;
  code: string;
  action: string;
  resource: string;
  category?: string;
  description?: string | null;
}

export interface RoleDTO {
  id: string;
  name: string;
  title?: string;
  description?: string | null;
  isSystem: boolean;
  permissions: string[];
  permissionDetails?: PermissionDTO[];
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  status: "ACTIVE" | "SUSPENDED";
  lastLoginAt?: string | null;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: CategoryDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPackageOptionDTO {
  id: string;
  productId?: string;
  weightKg: number;
  label: string;
  isDefault?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFeatureDTO {
  id?: string;
  productId?: string;
  name: string;
  value: string;
  sortOrder?: number;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  sku: string;
  categoryId: string;
  category?: CategoryDTO;
  basePrice: number;
  effectivePrice: number;
  discountPercentage?: number | null;
  unit: string;
  minimumOrder: number;
  allowCustomWeight?: boolean;
  packageOptions?: ProductPackageOptionDTO[];
  features?: ProductFeatureDTO[];
  isAvailable: boolean;
  isFeatured: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images: {
    id: string;
    url: string;
    alt?: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaDTO {
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

export interface CampaignDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  image: string;
  badge: string;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  startAt: string;
  endAt: string;
  isActive: boolean;
  sortOrder: number;
  highlightDiscount?: string;
  features?: string[];
  ctaText?: string;
  expiresAt?: string;
  products?: ProductDTO[];
}

export interface QuotationRequestDTO {
  id: string;
  customerName: string;
  companyName?: string | null;
  phone: string;
  email?: string | null;
  notes?: string | null;
  status: QuotationStatus;
  followupStatus: "NEEDS_FOLLOW_UP" | "FOLLOWED_UP";
  followedUpAt?: string | null;
  followedUpById?: string | null;
  followedUpByName?: string | null;
  items: {
    id?: string;
    productId: string;
    productName?: string;
    requestedWeight: number;
    quantity: number;
    unit: string;
    notes?: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequestDTO {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  subject: string;
  message: string;
  status: ContactRequestStatus;
  createdAt: string;
}

export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface CustomerPartnerDTO {
  id: string;
  name: string;
  logo: string;
  website?: string | null;
  description?: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface AchievementDTO {
  id: string;
  label: string;
  value: string;
  suffix?: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface CooperationStepDTO {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface SiteSettingDTO {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  type: string;
  isPublic: boolean;
  updatedAt: string;
}

// -------------------------------------------------------------
// BLOG TYPES (PHASE 4)
// -------------------------------------------------------------

export interface BlogCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTagDTO {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
  createdAt: string;
}

export interface BlogPostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  status: BlogPostStatus; // DRAFT, PUBLISHED, ARCHIVED
  authorId?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  categoryIds?: string[];
  categories: BlogCategoryDTO[];
  tagIds?: string[];
  tags: BlogTagDTO[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostQueryOptions {
  page?: number;
  limit?: number;
  status?: BlogPostStatus;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}

