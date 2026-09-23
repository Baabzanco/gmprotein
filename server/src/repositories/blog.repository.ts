import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import {
  BlogPostDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogPostStatus,
  BlogPostQueryOptions,
} from "../../../shared/types";

// Seed Blog Categories
let inMemoryBlogCategories: BlogCategoryDTO[] = [
  {
    id: "bcat-cuts",
    name: "برش‌های تخصصی استیک",
    slug: "steak-cuts",
    description: "معرفی و مشخصات انواع کات‌های استیک، ماربلینگ و عیارسنجی رستورانی",
    isActive: true,
    postCount: 2,
    createdAt: new Date("2026-08-01").toISOString(),
    updatedAt: new Date("2026-08-01").toISOString(),
  },
  {
    id: "bcat-aging",
    name: "فرآوری و درای‌ایجینگ",
    slug: "dry-aging-processing",
    description: "فنون کهنه‌سازی خشک، رطوبت‌سنجی و بهبود بافت پروتئین در سردخانه",
    isActive: true,
    postCount: 1,
    createdAt: new Date("2026-08-05").toISOString(),
    updatedAt: new Date("2026-08-05").toISOString(),
  },
  {
    id: "bcat-coldchain",
    name: "زنجیره سرد و استانداردهای HACCP",
    slug: "cold-chain-haccp",
    description: "استانداردهای بهداشتی دیتالاگر، حفظ دمای منفی ۱۸ درجه و کنترل کیفی",
    isActive: true,
    postCount: 1,
    createdAt: new Date("2026-08-10").toISOString(),
    updatedAt: new Date("2026-08-10").toISOString(),
  },
  {
    id: "bcat-market",
    name: "تحلیل بازار و تأمین سازمانی",
    slug: "market-analysis",
    description: "گزارش‌های ماهانه قیمت، ترندهای مصرف پروتئین هتل‌ها و مدیریت هزینه‌ها",
    isActive: true,
    postCount: 0,
    createdAt: new Date("2026-08-15").toISOString(),
    updatedAt: new Date("2026-08-15").toISOString(),
  },
];

// Seed Blog Tags
let inMemoryBlogTags: BlogTagDTO[] = [
  { id: "btag-ribeye", name: "ریب‌آی", slug: "ribeye", createdAt: new Date("2026-08-01").toISOString() },
  { id: "btag-tomahawk", name: "تاماهاوک", slug: "tomahawk", createdAt: new Date("2026-08-01").toISOString() },
  { id: "btag-dryage", name: "درای‌ایج", slug: "dry-age", createdAt: new Date("2026-08-01").toISOString() },
  { id: "btag-haccp", name: "گواهی بهداشت", slug: "haccp", createdAt: new Date("2026-08-01").toISOString() },
  { id: "btag-coldchain", name: "زنجیره سرد", slug: "cold-chain", createdAt: new Date("2026-08-01").toISOString() },
  { id: "btag-restaurant", name: "تجهیز رستوران", slug: "restaurant-supply", createdAt: new Date("2026-08-01").toISOString() },
];

// Seed Blog Posts
let inMemoryBlogPosts: BlogPostDTO[] = [
  {
    id: "post-1",
    title: "راهنمای جامع برش‌های استیک لوکس: از ریب‌آی تا تاماهاوک",
    slug: "luxury-steak-cuts-guide",
    excerpt: "بررسی تخصصی درجه مرمرینگی (Marbling)، ضخامت برش و بهترین روش‌های طبخ استیک در منوی رستوران‌های سطح بالا.",
    content: `<h2>اهمیت انتخاب برش استاندارد در رضایت مشتریان رستوران</h2>
<p>یکی از ارکان اصلی موفقیت سرآشپزان استیک‌هاوس، انتخاب برش‌های یکنواخت با توزیع چربی درون‌بافتی (Marbling Score) مناسب است. برش ریب‌آی به واسطه مغز چربی لطیف در مرکز آن، طعم آبدار و کم‌نظیری تولید می‌کند.</p>

<h3>ویژگی‌های کلیدی تاماهاوک ممتاز</h3>
<p>استیک تاماهاوک که در واقع همان ریب‌آی همراه با استخوان دنده بلند و سوهان‌خورده (French trimmed) است، نه تنها از حیث جلوه بصری شکوه خاصی به میز پذیرایی می‌بخشد، بلکه طعم مغز استخوان در زمان گریل به گوشت منتقل می‌گردد.</p>

<ul>
  <li><strong>ماربلینگ:</strong> حداقل درجه BMS 4 تا 7 برای دستیابی به بافت کره‌ای</li>
  <li><strong>ضخامت بهینه:</strong> بین ۳.۵ الی ۵ سانتی‌متر جهت گریل دورو و پخت مدیوم‌رِر</li>
  <li><strong>بسته‌بندی:</strong> وکیوم اسکین در اتمسفر کنترل شده بدون تماس با رطوبت آزاد</li>
</ul>

<h3>پیشنهاد پروتئین گلمحمدی برای سرآشپزان</h3>
<p>ما با سورتینگ دستچین لاشه‌های نرینه درجه یک و برش با اره نواری فوق‌دقیق، انحراف وزنی برش‌ها را به کمتر از ۵٪ رسانده‌ایم تا کنترل هزینه (Food Cost) برای رستوران‌داران شفاف و اقتصادی بماند.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    authorId: "usr-admin-pg",
    authorName: "مهندس گلمحمدی (مدیر کنترل کیفیت)",
    publishedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    categories: [inMemoryBlogCategories[0]],
    tags: [inMemoryBlogTags[0], inMemoryBlogTags[1], inMemoryBlogTags[5]],
    seoTitle: "راهنمای جامع برش‌های استیک لوکس | ریب‌آی و تاماهاوک پروتئین گلمحمدی",
    seoDescription: "بررسی تخصصی ماربلینگ، برش استاندارد ریب‌آی، تاماهاوک و فیله گوساله مخصوص رستوران‌ها و هتل‌های پنج‌ستاره با تضمین زنجیره سرد.",
    seoKeywords: "استیک ریب‌آی, تاماهاوک, خرید عمده گوشت استیک, پروتئین گلمحمدی, کات‌های گوشت رستورانی",
    canonicalUrl: "https://golmohamadi.com/blog/luxury-steak-cuts-guide",
    ogTitle: "راهنمای جامع برش‌های استیک لوکس برای سرآشپزان",
    ogDescription: "بررسی فنی تفاوت ریب‌آی، تاماهاوک و تی‌بون استیک با استانداردهای B2B پروتئین گلمحمدی.",
    ogImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date("2026-08-10").toISOString(),
    updatedAt: new Date("2026-08-10").toISOString(),
  },
  {
    id: "post-2",
    title: "اصول درای‌ایجینگ (Dry Aging) گوشت قرمز در سردخانه‌های صنعتی",
    slug: "dry-aging-meat-principles",
    excerpt: "چگونه کهنه‌سازی کنترل‌شده در دمای صفر تا دو درجه با کنترل دقیق رطوبت و جریان هوا، طعمی افسانه‌ای به گوشت گوساله می‌بخشد؟",
    content: `<h2>فرآیند بیوشیمیایی کهنه‌سازی خشک</h2>
<p>در فرآیند درای‌ایج، آنزیم‌های طبیعی گوشت (کالپین‌ها و کاتپسین‌ها) پروتئین‌های سخت بافت همبند کلاژن را تجزیه می‌کنند. همزمان تبخیر تدریجی رطوبت اضافی بافت باعث تغلیظ طعم گوشتی و ایجاد نوت‌های آجیلی و خامه‌ای می‌شود.</p>

<h3>شرایط بحرانی اتاق درای‌ایج پروتئین گلمحمدی</h3>
<ul>
  <li><strong>دما:</strong> بین ۱.۰ الی ۱.۵ درجه سانتی‌گراد بدون نوسان</li>
  <li><strong>رطوبت نسبی:</strong> بین ۷۵٪ تا ۸۵٪ با گردش هوای لمینار یکنواخت</li>
  <li><strong>دیواره‌های نمک هیمالیا:</strong> جهت تنظیم هوای استریل و یونیزاسیون محیط</li>
  <li><strong>دوره رسیدگی:</strong> از ۲۱ روز تا ۴۵ روز بر اساس سفارش اختصاصی سرآشپز</li>
</ul>

<p>پس از اتمام دوره، لایه خشکیده بیرونی (Crust) با دقت میلی‌متری تراشیده شده و هسته فوق‌العاده نرم و پرطعم استیک آماده برش‌زنی و ارسال مستقیم به رستوران‌های همکار می‌گردد.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    authorId: "usr-admin-pg",
    authorName: "تیم فنی پروتئین گلمحمدی",
    publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    categories: [inMemoryBlogCategories[1]],
    tags: [inMemoryBlogTags[2], inMemoryBlogTags[5]],
    seoTitle: "اصول درای‌ایجینگ و کهنه‌سازی گوشت قرمز | سردخانه تخصصی گلمحمدی",
    seoDescription: "آشنایی با متد درای‌ایج (Dry Aging)، کنترل رطوبت و نمک هیمالیا برای تولید نرم‌ترین و پرطعم‌ترین استیک‌های رستورانی در ایران.",
    seoKeywords: "درای ایج, استیک کهنه شده, dry aged steak, تامین گوشت رستوران, پروتئین گلمحمدی",
    canonicalUrl: "https://golmohamadi.com/blog/dry-aging-meat-principles",
    ogTitle: "اصول درای‌ایجینگ گوشت قرمز در سردخانه‌های صنعتی",
    ogDescription: "چگونه کهنه‌سازی خشک طعمی بی‌نظیر به استیک‌های لوکس رستورانی می‌بخشد؟",
    ogImage: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date("2026-08-15").toISOString(),
    updatedAt: new Date("2026-08-15").toISOString(),
  },
  {
    id: "post-3",
    title: "استانداردهای بهداشتی زنجیره سرد در تأمین پروتئین هتل‌ها و رستوران‌ها",
    slug: "cold-chain-standards-hotels-restaurants",
    excerpt: "نقش حیاتی دیتالاگرهای آنلاین و ناوگان یخچالی در حفظ تازگی، جلوگیری از فساد بیولوژیک و رعایت استانداردهای HACCP در توزیع پروتئین.",
    content: `<h2>چرا شکستن زنجیره سرد غیرقابل جبران است؟</h2>
<p>حتی افزایش دمای چند درجه‌ای گوشت در زمان بارگیری یا تخلیه می‌تواند به فعال‌شدن باکتری‌های سرماستیز و ترشیدگی بافت منجر گردد. در پروتئین گلمحمدی تمامی مراحل از سالن بسته‌بندی مکانیزه تا خودروهای حمل مجهز به سنسورهای مانیتورینگ لحظه‌ای دما هستند.</p>

<h3>چک‌لیست تحویل بار به مسئول انبار هتل:</h3>
<ol>
  <li>پرینت دمای محفظه خودرو در طول مسیر (حداکثر دمای مجاز ۴+ درجه برای گوشت گرم و ۱۸- برای منجمد)</li>
  <li>بررسی گواهی حمل دامپزشکی معتبر و بارکد ردیابی سلامت لاشه</li>
  <li>سالم بودن وکیوم و عدم وجود خونابه در بسته‌بندی‌های بهداشتی</li>
  <li>تطبیق وزن و انطباق برگه باسکول دیجیتال با فاکتور رسمی شرکت</li>
</ol>`,
    featuredImage: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    authorId: "usr-admin-pg",
    authorName: "دکتر م. کریمی (مسئول فنی دامپزشکی)",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    categories: [inMemoryBlogCategories[2]],
    tags: [inMemoryBlogTags[3], inMemoryBlogTags[4], inMemoryBlogTags[5]],
    seoTitle: "استاندارد زنجیره سرد و HACCP در تامین گوشت رستوران | پروتئین گلمحمدی",
    seoDescription: "راهنمای نظارت بر زنجیره سرد، دیتالاگر دمایی و چک‌لیست بازرسی گوشت تحویلی به هتل‌ها و رستوران‌ها.",
    seoKeywords: "زنجیره سرد, haccp گوشت, حمل گوشت یخچالی, بازرسی بهداشت گوشت, پخش عمده پروتئین",
    canonicalUrl: "https://golmohamadi.com/blog/cold-chain-standards-hotels-restaurants",
    ogTitle: "استانداردهای زنجیره سرد در تأمین پروتئین هتل‌ها",
    ogDescription: "پایش لحظه‌ای برودت تا منفی ۱۸ درجه و کنترل کیفی ناوگان اختصاصی پروتئین گلمحمدی.",
    ogImage: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date("2026-08-20").toISOString(),
    updatedAt: new Date("2026-08-20").toISOString(),
  },
  {
    id: "post-4",
    title: "بررسی روند قیمت و عرضه پروتئین قرمز در بازار عمده پاییز ۱۴۰۵",
    slug: "market-trends-meat-supply-autumn-2026",
    excerpt: "پیش‌بینی تغییرات نرخ عرضه دام زنده، نهاده‌ها و توصیه‌های کاربردی به هتل‌داران جهت انعقاد قراردادهای تأمین پایدار فصلی.",
    content: `<h2>گزارش تحلیلی بازار پروتئین برای پاییز ۱۴۰۵</h2>
<p>با ورود به فصل پاییز و افزایش تقاضای تالارهای پذیرایی و رستوران‌ها، بررسی دقیق منابع تأمین و نوسانات فصلی قیمت گوشت قرمز برای سرپرستان خرید هتل‌ها اهمیت دوچندان پیدا کرده است.</p>
<p>این پیش‌نویس به زودی پس از تکمیل آمارهای دامپزشکی استان و نهایی‌سازی شاخص‌های فصلی منتشر خواهد شد.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1200&q=80",
    status: "DRAFT",
    authorId: "usr-admin-pg",
    authorName: "واحد تحقیقات بازار گلمحمدی",
    publishedAt: null,
    categories: [inMemoryBlogCategories[3]],
    tags: [inMemoryBlogTags[5]],
    seoTitle: "پیش‌بینی بازار عمده گوشت قرمز پاییز ۱۴۰۵",
    seoDescription: "گزارش تحلیلی اختصاصی قیمت گوشت و توصیه‌های خرید عمده سازمانی.",
    createdAt: new Date("2026-09-01").toISOString(),
    updatedAt: new Date("2026-09-01").toISOString(),
  },
  {
    id: "post-5",
    title: "تجهیزات و فناوری‌های نوین بسته‌بندی تحت گاز محافظ (MAP)",
    slug: "map-packaging-innovations",
    excerpt: "چگونه بسته‌بندی در اتمسفر اصلاح‌شده طول عمر ماندگاری گوشت گرم گوساله و گوسفند را بدون نیاز به مواد نگهدارنده دو برابر می‌کند؟",
    content: `<h2>فناوری بسته‌بندی اتمسفر اصلاح‌شده (MAP) چیست؟</h2>
<p>در روش MAP ترکیب هوای داخل بسته‌بندی با گازهای طبیعی خالص نظیر اکسیژن، دی‌اکسید کربن و نیتروژن جایگزین می‌شود تا رشد میکروارگانیسم‌ها مهار شده و رنگ قرمز درخشان میوگلوبین حفظ شود.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    authorId: "usr-admin-pg",
    authorName: "دپارتمان R&D گلمحمدی",
    // Scheduled in future (2 days from now)
    publishedAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    categories: [inMemoryBlogCategories[2]],
    tags: [inMemoryBlogTags[3]],
    seoTitle: "فناوری بسته‌بندی گوشت MAP در پروتئین گلمحمدی",
    seoDescription: "بررسی تکنولوژی افزایش ماندگاری گوشت با گازهای محافظ در بسته‌بندی مدرن.",
    createdAt: new Date("2026-09-10").toISOString(),
    updatedAt: new Date("2026-09-10").toISOString(),
  },
];

// Tracking old slug redirects: oldSlug -> currentSlug
const slugRedirects: Record<string, string> = {};

export class BlogRepository {
  // -------------------------------------------------------------
  // Public Blog Queries
  // -------------------------------------------------------------

  async findAllPublished(options: BlogPostQueryOptions = {}): Promise<{
    posts: BlogPostDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = {
          status: "PUBLISHED",
          publishedAt: { lte: now },
        };

        if (options.categorySlug) {
          where.categories = {
            some: { category: { slug: options.categorySlug } },
          };
        }

        if (options.tagSlug) {
          where.tags = {
            some: { tag: { slug: options.tagSlug } },
          };
        }

        if (options.search) {
          where.OR = [
            { title: { contains: options.search, mode: "insensitive" } },
            { excerpt: { contains: options.search, mode: "insensitive" } },
            { content: { contains: options.search, mode: "insensitive" } },
          ];
        }

        const [total, dbPosts] = await Promise.all([
          prisma.blogPost.count({ where }),
          prisma.blogPost.findMany({
            where,
            include: {
              author: { select: { id: true, firstName: true, lastName: true } },
              categories: { include: { category: true } },
              tags: { include: { tag: true } },
            },
            orderBy: { publishedAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
        ]);

        const posts = dbPosts.map((p) => this.mapPrismaToDTO(p));
        return {
          posts,
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        };
      } catch (err) {
        // Fallback to in-memory
      }
    }

    // In-memory fallback
    const nowTime = now.getTime();
    let filtered = inMemoryBlogPosts.filter((p) => {
      if (p.status !== "PUBLISHED") return false;
      if (!p.publishedAt) return false;
      const pubTime = new Date(p.publishedAt).getTime();
      if (pubTime > nowTime) return false; // Scheduled in future, do not show

      if (options.categorySlug) {
        const hasCat = p.categories.some((c) => c.slug === options.categorySlug);
        if (!hasCat) return false;
      }

      if (options.tagSlug) {
        const hasTag = p.tags.some((t) => t.slug === options.tagSlug);
        if (!hasTag) return false;
      }

      if (options.search) {
        const s = options.search.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(s) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(s)) ||
          p.content.toLowerCase().includes(s);
        if (!matches) return false;
      }

      return true;
    });

    // Sort published descending
    filtered.sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      posts: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getLatestPublished(limit: number = 3): Promise<BlogPostDTO[]> {
    const result = await this.findAllPublished({ page: 1, limit });
    return result.posts;
  }

  async getPublishedBySlug(slug: string): Promise<{ post: BlogPostDTO | null; redirectedTo?: string }> {
    // Check if slug has an alias/redirect
    const resolvedSlug = slugRedirects[slug] || slug;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const post = await prisma.blogPost.findUnique({
          where: { slug: resolvedSlug },
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            categories: { include: { category: true } },
            tags: { include: { tag: true } },
          },
        });

        if (post && post.status === "PUBLISHED" && post.publishedAt && post.publishedAt <= new Date()) {
          return {
            post: this.mapPrismaToDTO(post),
            redirectedTo: resolvedSlug !== slug ? resolvedSlug : undefined,
          };
        }
        return { post: null };
      } catch (err) {
        // Fallback
      }
    }

    const post = inMemoryBlogPosts.find((p) => p.slug === resolvedSlug);
    if (!post) return { post: null };

    if (post.status !== "PUBLISHED") return { post: null };
    if (!post.publishedAt || new Date(post.publishedAt).getTime() > Date.now()) {
      return { post: null };
    }

    return {
      post,
      redirectedTo: resolvedSlug !== slug ? resolvedSlug : undefined,
    };
  }

  // -------------------------------------------------------------
  // Admin Blog Queries
  // -------------------------------------------------------------

  async findAllAdmin(options: BlogPostQueryOptions = {}): Promise<{
    posts: BlogPostDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 15;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = {};

        if (options.status) {
          where.status = options.status;
        }

        if (options.categorySlug) {
          where.categories = {
            some: { category: { slug: options.categorySlug } },
          };
        }

        if (options.search) {
          where.OR = [
            { title: { contains: options.search, mode: "insensitive" } },
            { excerpt: { contains: options.search, mode: "insensitive" } },
          ];
        }

        const [total, dbPosts] = await Promise.all([
          prisma.blogPost.count({ where }),
          prisma.blogPost.findMany({
            where,
            include: {
              author: { select: { id: true, firstName: true, lastName: true } },
              categories: { include: { category: true } },
              tags: { include: { tag: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
        ]);

        return {
          posts: dbPosts.map((p) => this.mapPrismaToDTO(p)),
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        };
      } catch (err) {
        // Fallback
      }
    }

    let filtered = [...inMemoryBlogPosts];

    if (options.status) {
      filtered = filtered.filter((p) => p.status === options.status);
    }

    if (options.categorySlug) {
      filtered = filtered.filter((p) => p.categories.some((c) => c.slug === options.categorySlug));
    }

    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(s))
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      posts: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<BlogPostDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const p = await prisma.blogPost.findUnique({
          where: { id },
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            categories: { include: { category: true } },
            tags: { include: { tag: true } },
          },
        });
        if (p) return this.mapPrismaToDTO(p);
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryBlogPosts.find((p) => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<BlogPostDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const p = await prisma.blogPost.findUnique({
          where: { slug },
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            categories: { include: { category: true } },
            tags: { include: { tag: true } },
          },
        });
        if (p) return this.mapPrismaToDTO(p);
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryBlogPosts.find((p) => p.slug === slug) || null;
  }

  async create(data: {
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    featuredImage?: string | null;
    status: BlogPostStatus;
    publishedAt?: string | null;
    authorId?: string | null;
    authorName?: string | null;
    categoryIds?: string[];
    tagNames?: string[];
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
  }): Promise<BlogPostDTO> {
    const id = `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();

    // Resolve categories
    const categories: BlogCategoryDTO[] = [];
    if (data.categoryIds && data.categoryIds.length > 0) {
      for (const catId of data.categoryIds) {
        const cat = await this.findCategoryById(catId);
        if (cat) categories.push(cat);
      }
    }

    // Resolve tags
    const tags: BlogTagDTO[] = [];
    if (data.tagNames && data.tagNames.length > 0) {
      for (const tName of data.tagNames) {
        const tag = await this.findOrCreateTag(tName);
        tags.push(tag);
      }
    }

    const newPost: BlogPostDTO = {
      id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content,
      featuredImage: data.featuredImage || null,
      status: data.status,
      publishedAt: data.publishedAt || null,
      authorId: data.authorId || null,
      authorName: data.authorName || "مدیر محتوا",
      categoryIds: categories.map((c) => c.id),
      categories,
      tagIds: tags.map((t) => t.id),
      tags,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywords: data.seoKeywords || null,
      canonicalUrl: data.canonicalUrl || null,
      ogTitle: data.ogTitle || null,
      ogDescription: data.ogDescription || null,
      ogImage: data.ogImage || null,
      createdAt: now,
      updatedAt: now,
    };

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.blogPost.create({
          data: {
            id,
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || null,
            content: data.content,
            featuredImage: data.featuredImage || null,
            status: data.status,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
            authorId: data.authorId || null,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            seoKeywords: data.seoKeywords || null,
            canonicalUrl: data.canonicalUrl || null,
            ogTitle: data.ogTitle || null,
            ogDescription: data.ogDescription || null,
            ogImage: data.ogImage || null,
            categories: {
              create: categories.map((c) => ({ categoryId: c.id })),
            },
            tags: {
              create: tags.map((t) => ({ tagId: t.id })),
            },
          },
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            categories: { include: { category: true } },
            tags: { include: { tag: true } },
          },
        });
        inMemoryBlogPosts.unshift(this.mapPrismaToDTO(created));
        return this.mapPrismaToDTO(created);
      } catch (err) {
        // Fallback
      }
    }

    inMemoryBlogPosts.unshift(newPost);
    return newPost;
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      excerpt?: string | null;
      content: string;
      featuredImage?: string | null;
      status: BlogPostStatus;
      publishedAt?: string | null;
      categoryIds?: string[];
      tagNames?: string[];
      seoTitle?: string | null;
      seoDescription?: string | null;
      seoKeywords?: string | null;
      canonicalUrl?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
    }>
  ): Promise<BlogPostDTO | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    // Track old slug redirect if slug changes
    if (data.slug && data.slug !== existing.slug) {
      slugRedirects[existing.slug] = data.slug;
    }

    const now = new Date().toISOString();

    // Resolve categories if provided
    let categories = existing.categories;
    if (data.categoryIds !== undefined) {
      categories = [];
      for (const catId of data.categoryIds) {
        const c = await this.findCategoryById(catId);
        if (c) categories.push(c);
      }
    }

    // Resolve tags if provided
    let tags = existing.tags;
    if (data.tagNames !== undefined) {
      tags = [];
      for (const tName of data.tagNames) {
        const t = await this.findOrCreateTag(tName);
        tags.push(t);
      }
    }

    const updatedPost: BlogPostDTO = {
      ...existing,
      ...data,
      categories,
      tags,
      categoryIds: categories.map((c) => c.id),
      tagIds: tags.map((t) => t.id),
      updatedAt: now,
    };

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updateData: any = {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: data.featuredImage,
          status: data.status,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
          canonicalUrl: data.canonicalUrl,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImage: data.ogImage,
          updatedAt: new Date(),
        };

        if (data.publishedAt !== undefined) {
          updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
        }

        if (data.categoryIds !== undefined) {
          await prisma.blogPostCategory.deleteMany({ where: { postId: id } });
          updateData.categories = {
            create: categories.map((c) => ({ categoryId: c.id })),
          };
        }

        if (data.tagNames !== undefined) {
          await prisma.blogPostTag.deleteMany({ where: { postId: id } });
          updateData.tags = {
            create: tags.map((t) => ({ tagId: t.id })),
          };
        }

        const res = await prisma.blogPost.update({
          where: { id },
          data: updateData,
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            categories: { include: { category: true } },
            tags: { include: { tag: true } },
          },
        });

        const dto = this.mapPrismaToDTO(res);
        const idx = inMemoryBlogPosts.findIndex((p) => p.id === id);
        if (idx !== -1) inMemoryBlogPosts[idx] = dto;
        return dto;
      } catch (err) {
        // Fallback
      }
    }

    const idx = inMemoryBlogPosts.findIndex((p) => p.id === id);
    if (idx !== -1) inMemoryBlogPosts[idx] = updatedPost;
    return updatedPost;
  }

  async delete(id: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.blogPost.delete({ where: { id } });
      } catch (err) {
        // Fallback
      }
    }
    const idx = inMemoryBlogPosts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      inMemoryBlogPosts.splice(idx, 1);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------

  async findAllCategories(): Promise<BlogCategoryDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const cats = await prisma.blogCategory.findMany({
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { posts: true },
            },
          },
        });
        return cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          isActive: (c as any).isActive ?? true,
          postCount: c._count.posts,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));
      } catch (err) {
        // Fallback
      }
    }

    return inMemoryBlogCategories.map((c) => {
      const count = inMemoryBlogPosts.filter(
        (p) => p.status === "PUBLISHED" && p.categories.some((cat) => cat.id === c.id)
      ).length;
      return { ...c, postCount: count };
    });
  }

  async findCategoryById(id: string): Promise<BlogCategoryDTO | null> {
    const all = await this.findAllCategories();
    return all.find((c) => c.id === id) || null;
  }

  async findCategoryBySlug(slug: string): Promise<BlogCategoryDTO | null> {
    const all = await this.findAllCategories();
    return all.find((c) => c.slug === slug) || null;
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string | null;
    isActive?: boolean;
  }): Promise<BlogCategoryDTO> {
    const id = `bcat-${Date.now()}`;
    const now = new Date().toISOString();

    const cat: BlogCategoryDTO = {
      id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      postCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.blogCategory.create({
          data: {
            id,
            name: data.name,
            slug: data.slug,
            description: data.description || null,
            isActive: cat.isActive,
          },
        });
        return {
          id: created.id,
          name: created.name,
          slug: created.slug,
          description: created.description,
          isActive: (created as any).isActive ?? true,
          postCount: 0,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }

    inMemoryBlogCategories.push(cat);
    return cat;
  }

  async updateCategory(
    id: string,
    data: Partial<{ name: string; slug: string; description?: string | null; isActive?: boolean }>
  ): Promise<BlogCategoryDTO | null> {
    const existing = await this.findCategoryById(id);
    if (!existing) return null;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const updated = await prisma.blogCategory.update({
          where: { id },
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            isActive: data.isActive,
          },
        });
        return {
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          description: updated.description,
          isActive: (updated as any).isActive ?? true,
          postCount: existing.postCount || 0,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }

    const idx = inMemoryBlogCategories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      inMemoryBlogCategories[idx] = {
        ...inMemoryBlogCategories[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return inMemoryBlogCategories[idx];
    }
    return null;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    // Check if posts exist
    const postsWithCategory = inMemoryBlogPosts.filter((p) =>
      p.categories.some((c) => c.id === id)
    );

    if (postsWithCategory.length > 0) {
      return {
        success: false,
        error: `این دسته‌بندی دارای ${postsWithCategory.length} مقاله است و امکان حذف مستقیم آن وجود ندارد. ابتدا دسته‌بندی مقالات را تغییر دهید.`,
      };
    }

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const count = await prisma.blogPostCategory.count({ where: { categoryId: id } });
        if (count > 0) {
          return {
            success: false,
            error: `این دسته‌بندی دارای ${count} مقاله در پایگاه داده است و امکان حذف مستقیم آن وجود ندارد.`,
          };
        }
        await prisma.blogCategory.delete({ where: { id } });
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const idx = inMemoryBlogCategories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      inMemoryBlogCategories.splice(idx, 1);
      return { success: true };
    }
    return { success: true };
  }

  // -------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------

  async findAllTags(): Promise<BlogTagDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const tags = await prisma.blogTag.findMany({ orderBy: { name: "asc" } });
        return tags.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          createdAt: t.createdAt.toISOString(),
        }));
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryBlogTags;
  }

  async findOrCreateTag(name: string): Promise<BlogTagDTO> {
    const trimmed = name.trim();
    const slug = trimmed
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "");

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        let tag = await prisma.blogTag.findFirst({
          where: { OR: [{ name: trimmed }, { slug }] },
        });
        if (!tag) {
          tag = await prisma.blogTag.create({
            data: {
              id: `btag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: trimmed,
              slug: slug || `tag-${Date.now()}`,
            },
          });
        }
        return {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          createdAt: tag.createdAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }

    let existing = inMemoryBlogTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() || t.slug === slug
    );
    if (!existing) {
      existing = {
        id: `btag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: trimmed,
        slug: slug || `tag-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      inMemoryBlogTags.push(existing);
    }
    return existing;
  }

  // Helper
  private mapPrismaToDTO(p: any): BlogPostDTO {
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      featuredImage: p.featuredImage,
      status: p.status as BlogPostStatus,
      authorId: p.authorId,
      authorName: p.author ? `${p.author.firstName} ${p.author.lastName}` : "مدیر سیستم",
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      categoryIds: p.categories ? p.categories.map((c: any) => c.category.id) : [],
      categories: p.categories
        ? p.categories.map((c: any) => ({
            id: c.category.id,
            name: c.category.name,
            slug: c.category.slug,
            description: c.category.description,
            isActive: c.category.isActive ?? true,
            createdAt: c.category.createdAt.toISOString(),
            updatedAt: c.category.updatedAt.toISOString(),
          }))
        : [],
      tagIds: p.tags ? p.tags.map((t: any) => t.tag.id) : [],
      tags: p.tags
        ? p.tags.map((t: any) => ({
            id: t.tag.id,
            name: t.tag.name,
            slug: t.tag.slug,
            createdAt: t.tag.createdAt.toISOString(),
          }))
        : [],
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      seoKeywords: p.seoKeywords,
      canonicalUrl: p.canonicalUrl,
      ogTitle: p.ogTitle,
      ogDescription: p.ogDescription,
      ogImage: p.ogImage,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }
}

export const blogRepository = new BlogRepository();
