import React, { useEffect, useState } from "react";
import { useRouter } from "../../context/RouterContext";
import { blogService } from "../../services/blogService";
import { BlogPostDTO } from "../../../shared/types";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const LatestBlogSection: React.FC = () => {
  const { navigate } = useRouter();
  const [posts, setPosts] = useState<BlogPostDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    blogService
      .getLatestPosts(3)
      .then((items) => {
        if (isMounted) {
          setPosts(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Gracefully hide section if no published posts exist
  if (!loading && posts.length === 0) {
    return null;
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        month: "long",
        day: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="blog-section" className="py-24 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)] relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#124A57]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#CD78B3]/5 rounded-full blur-3xl pointer-events-none translate-y-1/3 translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#124A57]/10 text-[#124A57] dark:text-[#56BAC9] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>دانشنامه و مقالات تخصصی</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              تازه‌ترین یادداشت‌های صنعت پروتئین و استیک
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] text-base max-w-2xl leading-relaxed">
              راهنمای کاربردی انتخاب انواع برش‌های گوشت قرمز، مدیریت نگهداری در دمای استاندارد و اسرار آماده‌سازی استیک‌های درای‌ایج.
            </p>
          </div>

          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[#124A57] text-[var(--text-primary)] text-sm font-semibold hover:bg-[#124A57] hover:text-white transition-all duration-200 cursor-pointer self-start md:self-auto shadow-sm"
          >
            <span>مشاهده تمام مقالات وبلاگ</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[var(--bg-primary)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] animate-pulse"
              >
                <div className="h-48 bg-[var(--border-subtle)]" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-[var(--border-subtle)] rounded w-1/3" />
                  <div className="h-6 bg-[var(--border-subtle)] rounded w-4/5" />
                  <div className="h-4 bg-[var(--border-subtle)] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group bg-[var(--bg-primary)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:border-[#124A57]/60 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image & Badge */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={
                      post.featuredImage ||
                      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {post.categories && post.categories.length > 0 && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#124A57]/90 backdrop-blur-md text-white text-xs font-medium shadow-sm">
                      {post.categories[0].name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#124A57]" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#CD78B3]" />
                      ۵ دقیقه
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#124A57] transition-colors line-clamp-2 mb-3 leading-snug">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>

                  {/* CTA link */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      {post.authorName || "تیم محتوا"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#124A57] group-hover:translate-x-[-4px] transition-transform">
                      مطالعه یادداشت
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
