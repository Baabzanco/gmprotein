import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import {
  FaqDTO,
  CustomerPartnerDTO,
  AchievementDTO,
  CooperationStepDTO,
  SiteSettingDTO,
} from "../../../shared/types";

const defaultFaqs: FaqDTO[] = [
  {
    id: "faq-1",
    question: "آیا امکان سفارش‌سازی ضخامت و وزن برش‌های استیک وجود دارد؟",
    answer: "بله، در پروتئین گلمحمدی تمامی برش‌ها توسط قصاب‌های متخصص و با تجهیزات آلمانی، دقیقاً مطابق درخواست شما (مثلاً استیک ۲، ۳ یا ۴ سانتی‌متری) به صورت گرم یا درای‌ایج آماده‌سازی و در بسته‌بندی خلأ تحویل می‌گردد.",
    category: "سفارش و تحویل",
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: "faq-2",
    question: "زنجیره سرد تحویل گوشت چگونه تضمین می‌شود؟",
    answer: "تمام فرآیند از لحظه کشتار و خروج از سالن‌های تحت نظارت تا لحظه تحویل به مشتری در ناوگان اختصاصی مجهز به یونیت‌های برودتی با سنسورهای ثبت دما (تله‌متریک) بین صفر تا ۴ درجه سانتی‌گراد کنترل می‌شود.",
    category: "کیفیت و سلامت",
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: "faq-3",
    question: "حداقل سفارش برای صدور پیش‌فاکتور رسمی تجاری چقدر است؟",
    answer: "برای مشتریان تجاری (رستوران‌ها، هتل‌ها و ارگان‌ها) حداقل حجم سفارش برای فاکتور رسمی ۵ کیلوگرم است. برای خریداران خانگی و بوتیک نیز امکان سفارش بسته‌های ۲ تا ۵ کیلویی فراهم است.",
    category: "پیش‌فاکتور و خرید",
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: "faq-4",
    question: "تفاوت گوشت درای‌ایج (Dry-Aged) با گوشت معمولی در چیست؟",
    answer: "در فرآیند درای‌ایج، لاشه یا برش در دمای صفر تا ۲ درجه سانتی‌گراد و رطوبت ۸۵٪ به مدت ۲۱ تا ۴۵ روز نگهداری می‌شود. آنزیم‌های طبیعی بافت فیبرها را شکسته و رطوبت سطحی تبخیر شده تا طعم گوشت به اوج غلظت و لطافت برسد.",
    category: "تخصصی و استیک",
    sortOrder: 4,
    isPublished: true,
  },
];

const defaultCustomers: CustomerPartnerDTO[] = [
  {
    id: "cust-1",
    name: "هتل بین‌المللی اسپیناس پالاس",
    logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80",
    description: "تأمین انحصاری گوشت قرمز و استیک‌های VIP رستوران‌های دیبا و لاتون",
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: "cust-2",
    name: "رستوران‌های شاندیز جردن",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80",
    description: "تأمین روزانه شیشلیک دستچین و دنده بره جوان",
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: "cust-3",
    name: "استیک‌هاوس مم‌مد استیک تجریش",
    logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    description: "تأمین برش‌های فوق‌سنگین تاماهاوک، پورترهاوس و ریب‌آی",
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: "cust-4",
    name: "مجموعه کافه رستوران‌های سام سنتر",
    logo: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=200&q=80",
    description: "تأمین فیله گوساله بدون چربی و برگرهای دستی مرینیت",
    sortOrder: 4,
    isPublished: true,
  },
];

const defaultAchievements: AchievementDTO[] = [
  { id: "ach-1", label: "سال سابقه درخشان در صنعت پروتئین", value: "۱۸+", suffix: "سال", sortOrder: 1, isPublished: true },
  { id: "ach-2", label: "رستوران، هتل و مجموعه لوکس طرف قرارداد", value: "۱۴۰+", suffix: "مجموعه", sortOrder: 2, isPublished: true },
  { id: "ach-3", label: "تن تحویل موفق گوشت ممتاز در سال گذشته", value: "۶۵۰+", suffix: "تن", sortOrder: 3, isPublished: true },
  { id: "ach-4", label: "رضایت مشتریان خانگی و حرفه‌ای", value: "۹۹.۴٪", suffix: "رضایت", sortOrder: 4, isPublished: true },
];

const defaultSteps: CooperationStepDTO[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "ثبت نیاز و استعلام برخط",
    description: "انتخاب برش‌های مورد نظر در کاتالوگ یا ثبت مشخصات و وزن تقریبی در فرم پیش‌فاکتور",
    icon: "FileCheck2",
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: "step-2",
    stepNumber: 2,
    title: "تأییدیه کیفی و فنی",
    description: "تماس کارشناس بازرگانی و ارسال فاکتور رسمی با قید درجه ماربلینگ و روز کشتار",
    icon: "CheckCircle",
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: "step-3",
    stepNumber: 3,
    title: "قصابی و بسته‌بندی خلأ",
    description: "برش اختصاصی توسط سرقصاب و بسته‌بندی بهداشتی ضد اکسیداسیون تحت اتمسفر اصلاح‌شده (MAP)",
    icon: "Boxes",
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: "step-4",
    stepNumber: 4,
    title: "تحویل با زنجیره سرد",
    description: "ارسال سریع با خودروهای یخچال‌دار اختصاصی و تحویل در محل رستوران یا منزل با تاییدیه بارنامه",
    icon: "Truck",
    sortOrder: 4,
    isPublished: true,
  },
];

const defaultSettings: SiteSettingDTO[] = [
  { id: "set-1", key: "siteName", value: "پروتئین گلمحمدی", type: "string", isPublic: true, updatedAt: new Date().toISOString() },
  { id: "set-2", key: "siteDescription", value: "مرکز تخصصی تأمین گوشت و برش‌های ممتاز استیک با زنجیره سرد استاندارد", type: "string", isPublic: true, updatedAt: new Date().toISOString() },
  { id: "set-3", key: "phone", value: "02122000000", type: "string", isPublic: true, updatedAt: new Date().toISOString() },
  { id: "set-4", key: "email", value: "info@golmohamadi.com", type: "string", isPublic: true, updatedAt: new Date().toISOString() },
  { id: "set-5", key: "heroVideoUrl", value: "https://golmohamadi.com/wp-content/uploads/2026/09/Create-A-Single-Continuous-Cin-3.mp4", type: "string", isPublic: true, updatedAt: new Date().toISOString() },
  { id: "set-6", key: "defaultTheme", value: "dark", type: "string", isPublic: true, updatedAt: new Date().toISOString() },
];

export class LandingRepository {
  async getFaqs(): Promise<FaqDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const items = await prisma.fAQ.findMany({
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
        });
        return items.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category,
          sortOrder: f.sortOrder,
          isPublished: f.isPublished,
        }));
      } catch (err) {}
    }
    return defaultFaqs;
  }

  async getCustomers(): Promise<CustomerPartnerDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const items = await prisma.customerPartner.findMany({
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
        });
        return items.map((c) => ({
          id: c.id,
          name: c.name,
          logo: c.logo,
          website: c.website,
          description: c.description,
          sortOrder: c.sortOrder,
          isPublished: c.isPublished,
        }));
      } catch (err) {}
    }
    return defaultCustomers;
  }

  async getAchievements(): Promise<AchievementDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const items = await prisma.achievement.findMany({
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
        });
        return items.map((a) => ({
          id: a.id,
          label: a.label,
          value: a.value,
          suffix: a.suffix,
          sortOrder: a.sortOrder,
          isPublished: a.isPublished,
        }));
      } catch (err) {}
    }
    return defaultAchievements;
  }

  async getCooperationSteps(): Promise<CooperationStepDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const items = await prisma.cooperationStep.findMany({
          where: { isPublished: true },
          orderBy: { stepNumber: "asc" },
        });
        return items.map((s) => ({
          id: s.id,
          stepNumber: s.stepNumber,
          title: s.title,
          description: s.description,
          icon: s.icon,
          sortOrder: s.sortOrder,
          isPublished: s.isPublished,
        }));
      } catch (err) {}
    }
    return defaultSteps;
  }

  async getPublicSettings(): Promise<Record<string, any>> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const items = await prisma.siteSetting.findMany({
          where: { isPublic: true },
        });
        return items.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, any>);
      } catch (err) {}
    }
    return defaultSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);
  }
}

export const landingRepository = new LandingRepository();
