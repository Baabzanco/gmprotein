import React, { useState, useEffect } from "react";
import { useRouter } from "../../context/RouterContext";
import { blogService } from "../../services/blogService";
import { BlogPostDTO } from "../../../shared/types";
import { applySeoMetadata } from "../../utils/seo";
import {
  Calendar,
  Clock,
  Tag,
  Share2,
  ChevronRight,
  ArrowLeft,
  Check,
  Building,
  User,
  ShieldCheck,
  PhoneCall,
  Sparkles,
} from "lucide-react";

interface BlogPostPageProps {
  slug: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const [post, setPost] = useState<BlogPostDTO | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);

    blogService
      .getPostBySlug(slug)
      .then((res) => {
        if (!isMounted) return;
        if (!res || !res.post) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const currentPost = res.post;
        setPost(currentPost);
        setLoading(false);

        // If server indicated an alias/redirect, update window history cleanly
        if (res.redirectedTo && res.redirectedTo !== slug) {
          window.history.replaceState({}, "", `/blog/${res.redirectedTo}`);
        }

        // Apply Dynamic Page SEO Metadata & JSON-LD Structured Data
        const canonical = currentPost.canonicalUrl || `${window.location.origin}/blog/${currentPost.slug}`;
        applySeoMetadata({
          title: currentPost.seoTitle || `${currentPost.title} | پروتئین گلمحمدی`,
          description: currentPost.seoDescription || currentPost.excerpt || "",
          keywords: currentPost.seoKeywords || undefined,
          canonicalUrl: canonical,
          ogTitle: currentPost.ogTitle || currentPost.title,
          ogDescription: currentPost.ogDescription || currentPost.excerpt || "",
          ogImage: currentPost.ogImage || currentPost.featuredImage || undefined,
          ogType: "article",
          publishedTime: currentPost.publishedAt || undefined,
          modifiedTime: currentPost.updatedAt || undefined,
          author: currentPost.authorName || "پروتئین گلمحمدی",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": canonical,
            },
            headline: currentPost.title,
            description: currentPost.seoDescription || currentPost.excerpt || "",
            image: currentPost.ogImage || currentPost.featuredImage || undefined,
            author: {
              "@type": "Person",
              name: currentPost.authorName || "پروتئین گلمحمدی",
            },
            publisher: {
              "@type": "Organization",
              name: "پروتئین گلمحمدی",
              logo: {
                "@type": "ImageObject",
                url: "https://golmohamadi.com/assets/logo.png",
              },
            },
            datePublished: currentPost.publishedAt || undefined,
            dateModified: currentPost.updatedAt || undefined,
          },
        });

        // Fetch related posts (latest excluding current)
        blogService.getLatestPosts(4).then((all) => {
          if (isMounted) {
            setRelatedPosts(all.filter((p) => p.id !== currentPost.id).slice(0, 3));
          }
        });
      })
      .catch(() => {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 animate-pulse">
          <div className="h-6 bg-[var(--border-subtle)] rounded w-1/4" />
          <div className="h-12 bg-[var(--border-subtle)] rounded w-3/4" />
          <div className="h-96 bg-[var(--border-subtle)] rounded-3xl" />
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-[var(--border-subtle)] rounded w-full" />
            <div className="h-4 bg-[var(--border-subtle)] rounded w-5/6" />
            <div className="h-4 bg-[var(--border-subtle)] rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center pt-20 px-4">
        <div className="text-center max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8 rounded-3xl shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 font-black text-2xl">
            ۴۰۴
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">مقاله مورد نظر یافت نشد</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
            این مقاله ممکن است حذف شده باشد، هنوز منتشر نشده باشد یا آدرس وارد شده نادرست باشد.
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="px-6 py-2.5 rounded-xl bg-[#124A57] text-white text-sm font-semibold hover:bg-[#0e3b46] transition-colors cursor-pointer"
          >
            مشاهده وبلاگ تخصصی
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-28 pb-20 selection:bg-[#CD78B3] selection:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-[var(--text-secondary)] mb-8 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigate("/")} className="hover:text-[var(--primary)] transition-colors cursor-pointer">
            صفحه نخست
          </button>
          <span>/</span>
          <button onClick={() => navigate("/blog")} className="hover:text-[var(--primary)] transition-colors cursor-pointer">
            وبلاگ
          </button>
          {post.categories && post.categories.length > 0 && (
            <>
              <span>/</span>
              <button
                onClick={() => navigate(`/blog?category=${post.categories[0].slug}`)}
                className="hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                {post.categories[0].name}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium truncate max-w-[200px] sm:max-w-none">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          {post.categories && post.categories.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#124A57]/10 text-[#124A57] text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{post.categories[0].name}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Author & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#124A57] text-white flex items-center justify-center font-bold text-xs">
                  {post.authorName ? post.authorName.charAt(0) : "گ"}
                </div>
                <span className="font-medium text-[var(--text-primary)]">{post.authorName || "دپارتمان پروتئین گلمحمدی"}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#124A57]" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#CD78B3]" />
                <span>۵ دقیقه مطالعه</span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                title="کپی لینک مقاله"
                className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "کپی شد!" : "اشتراک‌گذاری"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-lg border border-[var(--border-subtle)]">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Lead Excerpt */}
        {post.excerpt && (
          <div className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed bg-[var(--bg-secondary)] border-r-4 border-[#124A57] p-6 rounded-2xl mb-8">
            {post.excerpt}
          </div>
        )}

        {/* Article Body Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-[var(--text-primary)] leading-relaxed space-y-6 text-base sm:text-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#CD78B3]" />
              برچسب‌ها:
            </span>
            {post.tags.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[#124A57] transition-colors"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}

        {/* B2B Consultation CTA Box */}
        <div className="mt-12 bg-gradient-to-r from-[#124A57] to-[#0a2f38] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#CD78B3]" />
              <span>تأمین مستقیم و زنجیره سرد استاندارد</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black">
              نیاز به تأمین استیک و گوشت سازمانی برای رستوران یا هتل دارید؟
            </h3>
            <p className="text-white/80 text-sm max-w-xl">
              کارشناسان فروش سازمانی پروتئین گلمحمدی آماده ارائه مشاوره، کاتالوگ قیمت و ارسال نمونه تست با استاندارد HACCP هستند.
            </p>
          </div>
          <button
            onClick={() => {
              navigate("/#contact-section");
            }}
            className="px-6 py-3 rounded-xl bg-white text-[#124A57] font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-[#124A57]" />
            درخواست مشاوره و استعلام
          </button>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                سایر مقالات تخصصی
              </h3>
              <button
                onClick={() => navigate("/blog")}
                className="text-sm font-semibold text-[#124A57] hover:underline flex items-center gap-1 cursor-pointer"
              >
                مشاهده همه
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/blog/${r.slug}`)}
                  className="bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:border-[#124A57] transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-40 overflow-hidden bg-slate-900">
                    <img
                      src={r.featuredImage || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[#124A57] transition-colors line-clamp-2 mb-2">
                      {r.title}
                    </h4>
                    <span className="text-xs text-[#124A57] font-semibold mt-2">
                      مطالعه مقاله ←
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
