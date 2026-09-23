import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { CampaignDTO } from "../../../shared/types";

let inMemoryCampaigns: CampaignDTO[] = [
  {
    id: "camp-summer-2026",
    title: "جشنواره استیک‌های لوکس باربیکیو و درای‌ایج",
    slug: "luxury-bbq-steak-festival",
    description: "بهره‌مندی از تخفیف ویژه تا ۲۰٪ روی تمام برش‌های ریب‌آی، تاماهاوک و فیله دستچین با بسته‌بندی خلأ استاندارد و ارسال اختصاصی تحت زنجیره سرد سراسر تهران.",
    shortDescription: "تخفیف ویژه تا ۲۰٪ روی تمام برش‌های ریب‌آی و تاماهاوک",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    badge: "جشنواره فصلی تابستانه",
    ctaLabel: "مشاهده برش‌ها و استعلام قیمت",
    ctaLink: "#store-section",
    startAt: new Date(Date.now() - 86400000).toISOString(),
    endAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
    sortOrder: 1,
    highlightDiscount: "۲۰٪ تخفیف ویژه برش‌های پرمیوم",
    features: [
      "تضمین کیفیت ۱۰۰٪ و کنترل کیفی تحت نظارت مستقیم دامپزشک",
      "برش و پاک‌سازی سفارشی مطابق درخواست سرآشپز یا خریدار خانگی",
      "ارسال رایگان برای سفارش‌های عمده سازمانی بالای ۲۰ کیلوگرم",
    ],
    expiresAt: "۳۱ شهریور ۱۴۰۵",
  },
  {
    id: "camp-autumn-2026",
    title: "مجموعه پروتیینی ویژه هتل‌ها و رستوران‌های بزرگ",
    slug: "hotel-restaurant-supply",
    description: "تأمین مستمر وcontract بسته‌بندی اختصاصی با استاندارد HACCP برای هتل‌ها، تالارها و رستوران‌های زنجیره‌ای سراسر کشور.",
    shortDescription: "قرارداد تأمین مستمر با استاندارد HACCP",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80",
    badge: "تأمین سازمانی",
    ctaLabel: "درخواست پیش‌فاکتور عمده",
    ctaLink: "#quotation-section",
    startAt: new Date(Date.now() - 86400000).toISOString(),
    endAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    isActive: true,
    sortOrder: 2,
    highlightDiscount: "ارسال آزمایشی رایگان",
  },
];

export class CampaignRepository {
  async findAll(): Promise<CampaignDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const list = await prisma.campaign.findMany({
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        });
        return list.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          shortDescription: c.shortDescription,
          image: c.image,
          badge: c.badge,
          ctaLabel: c.ctaLabel,
          ctaLink: c.ctaLink,
          startAt: c.startAt ? c.startAt.toISOString() : "",
          endAt: c.endAt ? c.endAt.toISOString() : "",
          isActive: c.isActive,
          sortOrder: c.sortOrder,
          highlightDiscount: c.highlightDiscount || undefined,
        }));
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryCampaigns;
  }

  async getActive(): Promise<CampaignDTO[]> {
    const all = await this.findAll();
    const now = new Date();
    return all.filter((c) => {
      if (!c.isActive) return false;
      if (c.startAt && new Date(c.startAt) > now) return false;
      if (c.endAt && new Date(c.endAt) < now) return false;
      return true;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async create(data: {
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    image: string;
    badge: string;
    ctaLabel?: string;
    ctaLink?: string;
    highlightDiscount?: string;
    startAt?: string;
    endAt?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<CampaignDTO> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.campaign.create({
          data: {
            title: data.title,
            slug: data.slug,
            description: data.description,
            shortDescription: data.shortDescription,
            image: data.image,
            badge: data.badge || "جشنواره",
            ctaLabel: data.ctaLabel,
            ctaLink: data.ctaLink,
            highlightDiscount: data.highlightDiscount,
            startAt: data.startAt ? new Date(data.startAt) : null,
            endAt: data.endAt ? new Date(data.endAt) : null,
            isActive: data.isActive ?? true,
            sortOrder: data.sortOrder ?? 0,
          },
        });
        return {
          id: created.id,
          title: created.title,
          slug: created.slug,
          description: created.description,
          shortDescription: created.shortDescription,
          image: created.image,
          badge: created.badge,
          ctaLabel: created.ctaLabel,
          ctaLink: created.ctaLink,
          startAt: created.startAt ? created.startAt.toISOString() : "",
          endAt: created.endAt ? created.endAt.toISOString() : "",
          isActive: created.isActive,
          sortOrder: created.sortOrder,
          highlightDiscount: created.highlightDiscount || undefined,
        };
      } catch (err) {
        // Fallback
      }
    }

    const newCamp: CampaignDTO = {
      id: `camp-${Date.now()}`,
      title: data.title,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      image: data.image,
      badge: data.badge || "جشنواره",
      ctaLabel: data.ctaLabel,
      ctaLink: data.ctaLink,
      startAt: data.startAt || new Date().toISOString(),
      endAt: data.endAt || new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      highlightDiscount: data.highlightDiscount,
    };
    inMemoryCampaigns.unshift(newCamp);
    return newCamp;
  }

  async update(id: string, data: Partial<CampaignDTO>): Promise<CampaignDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updated = await prisma.campaign.update({
          where: { id },
          data: {
            title: data.title,
            slug: data.slug,
            description: data.description,
            shortDescription: data.shortDescription,
            image: data.image,
            badge: data.badge,
            ctaLabel: data.ctaLabel,
            ctaLink: data.ctaLink,
            highlightDiscount: data.highlightDiscount,
            startAt: data.startAt ? new Date(data.startAt) : undefined,
            endAt: data.endAt ? new Date(data.endAt) : undefined,
            isActive: data.isActive,
            sortOrder: data.sortOrder,
          },
        });
        return {
          id: updated.id,
          title: updated.title,
          slug: updated.slug,
          description: updated.description,
          shortDescription: updated.shortDescription,
          image: updated.image,
          badge: updated.badge,
          ctaLabel: updated.ctaLabel,
          ctaLink: updated.ctaLink,
          startAt: updated.startAt ? updated.startAt.toISOString() : "",
          endAt: updated.endAt ? updated.endAt.toISOString() : "",
          isActive: updated.isActive,
          sortOrder: updated.sortOrder,
          highlightDiscount: updated.highlightDiscount || undefined,
        };
      } catch (err) {
        // Fallback
      }
    }

    const idx = inMemoryCampaigns.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    inMemoryCampaigns[idx] = { ...inMemoryCampaigns[idx], ...data };
    return inMemoryCampaigns[idx];
  }

  async toggleStatus(id: string, isActive: boolean): Promise<CampaignDTO | null> {
    return this.update(id, { isActive });
  }

  async delete(id: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.campaign.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
        return true;
      } catch (err) {
        // Fallback
      }
    }

    const initialLen = inMemoryCampaigns.length;
    inMemoryCampaigns = inMemoryCampaigns.filter((c) => c.id !== id);
    return inMemoryCampaigns.length < initialLen;
  }
}

export const campaignRepository = new CampaignRepository();
