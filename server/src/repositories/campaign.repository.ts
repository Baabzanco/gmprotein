import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { CampaignDTO } from "../../../shared/types";

const defaultCampaign: CampaignDTO = {
  id: "camp-summer-2026",
  title: "جشنواره استیک‌های لوکس باربیکیو و درای‌ایج",
  slug: "luxury-bbq-steak-festival",
  description: "بهره‌مندی از تخفیف ویژه تا ۲۰٪ روی تمام برش‌های ریب‌آی، تاماهاوک و فیله دستچین با بسته‌بندی خلأ استاندارد و ارسال اختصاصی تحت زنجیره سرد سراسر تهران.",
  image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  badge: "جشنواره فصلی تابستانه",
  startAt: new Date().toISOString(),
  endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
  sortOrder: 1,
  highlightDiscount: "۲۰٪ تخفیف ویژه برش‌های پرمیوم",
  features: [
    "تضمین کیفیت ۱۰۰٪ و کنترل کیفی تحت نظارت مستقیم دامپزشک",
    "برش و پاک‌سازی سفارشی مطابق درخواست سرآشپز یا خریدار خانگی",
    "ارسال رایگان برای سفارش‌های عمده سازمانی بالای ۲۰ کیلوگرم",
  ],
  ctaText: "مشاهده برش‌ها و استعلام قیمت",
  ctaLink: "#store-section",
  expiresAt: "۳۱ شهریور ۱۴۰۵",
};

let inMemoryCampaign: CampaignDTO = { ...defaultCampaign };

export class CampaignRepository {
  async getActive(): Promise<CampaignDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const camp = await prisma.campaign.findFirst({
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: "asc" },
          include: {
            campaignProducts: {
              include: { product: true },
            },
          },
        });

        if (camp) {
          return {
            id: camp.id,
            title: camp.title,
            slug: camp.slug,
            description: camp.description,
            image: camp.image,
            badge: camp.badge,
            startAt: camp.startAt?.toISOString() || "",
            endAt: camp.endAt?.toISOString() || "",
            isActive: camp.isActive,
            sortOrder: camp.sortOrder,
            highlightDiscount: defaultCampaign.highlightDiscount,
            features: defaultCampaign.features,
            ctaText: defaultCampaign.ctaText,
            ctaLink: defaultCampaign.ctaLink,
            expiresAt: defaultCampaign.expiresAt,
          };
        }
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryCampaign;
  }
}

export const campaignRepository = new CampaignRepository();
