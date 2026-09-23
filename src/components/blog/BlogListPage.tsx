import React, { useState, useEffect } from "react";
import { useRouter } from "../../context/RouterContext";
import { blogService } from "../../services/blogService";
import { BlogPostDTO, BlogCategoryDTO } from "../../../shared/types";
import { applySeoMetadata } from "../../utils/seo";
import {
  Calendar,
  Clock,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const BlogListPage: React.FC = () => {
  const { navigate } = useRouter();
  const [posts, setPosts] = useState<BlogPostDTO[]>([]);
  const [categories, setCategories] = useState<BlogCategoryDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Set Page SEO Metadata
  useEffect(() => {
    applySeoMetadata({
      title: "وبلاگ تخصصی پروتئین گلمحمدی | مقالات تخصصی برش گوشت و زنجیره سرد",
      description: "مقالات، آموزش‌ها و راهنمای تخصصی انتخاب برش‌های استیک، درای‌ایجینگ، استانداردهای بهداشتی HACCP و تأمین پروتئین هتل‌ها و رستوران‌ها.",
      keywords: "وبلاگ گوشت, مقالات استیک, درای ایج, ریب آی, تاماهاوک, haccp گوشت, پروتئین گلمحمدی",
      canonicalUrl: "https://golmohamadi.com/blog",
      ogTitle: "وبلاگ تخصصی پروتئین گلمحمدی",
      ogDescription: "راهنمای جامع سرآشپزان و مدیران هتل‌ها برای خرید عمده و استانداردهای پخت گوشت قرمز.",
      ogType: "website",
    });
  }, []);

  // Fetch categories once
  useEffect(() => {
    blogService.getCategories().then((cats) => setCategories(cats));
  }, []);

  // Fetch posts on filter change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    blogService
      .getPublishedPosts({
        page: currentPage,
        limit: 9,
        categorySlug: selectedCategory || undefined,
        search: searchQuery || undefined,
      })
      .then((res) => {
        if (isMounted) {
          setPosts(res.posts);
          setTotalPages(res.totalPages);
          setTotalPosts(res.total);
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
  }, [currentPage, selectedCategory, searchQuery]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug === selectedCategory ? "" : slug);
    setCurrentPage(1);
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-28 pb-20 selection:bg-[#CD78B3] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-8">
          <button
            onClick={() => navigate("/")}
            className="hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            صفحه نخست
          </button>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium">وبلاگ تخصصی</span>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>دانشنامه و مقالات علمی صنعت پروتئین</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4">
            یادداشت‌های تخصصی قصابی، استیک و مدیریت هورکا
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
            راهنمای عملی سرآشپزان، مدیران هتل‌ها و رستوران‌های برتر برای انتخاب برش‌های ممتاز، کهنه‌سازی درای‌ایج و نظارت بر زنجیره سرد.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 md:p-6 mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => handleCategorySelect("")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedCategory === ""
                    ? "bg-[#124A57] text-white shadow-md"
                    : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/80 border border-[var(--border-subtle)]"
                }`}
              >
                همه مقالات ({totalPosts})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-[#124A57] text-white shadow-md"
                      : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/80 border border-[var(--border-subtle)]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="جستجو در مقالات..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl pr-10 pl-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#124A57] transition-colors"
              />
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute right-3 top-3" />
            </div>
          </div>
        </div>

        {/* Blog Post Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] animate-pulse"
              >
                <div className="h-52 bg-[var(--border-subtle)]" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-[var(--border-subtle)] rounded w-1/3" />
                  <div className="h-6 bg-[var(--border-subtle)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--border-subtle)] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)] p-8">
            <BookOpen className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              مقاله‌ای مطابق با جستجوی شما یافت نشد
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              می‌توانید عبارت جستجو را پاک کنید یا دسته‌بندی دیگری را انتخاب فرمایید.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#124A57] text-white text-sm font-semibold hover:bg-[#0e3b46] transition-colors cursor-pointer"
            >
              مشاهده تمام مقالات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:border-[#124A57]/50 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Featured Image */}
                <div className="relative h-56 overflow-hidden bg-slate-900">
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

                  {/* Category Badge */}
                  {post.categories && post.categories.length > 0 && (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#124A57]/90 backdrop-blur-md text-white text-xs font-semibold shadow-sm">
                      {post.categories[0].name}
                    </span>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Meta Bar: Date & Author */}
                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#124A57]" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#CD78B3]" />
                      ۵ دقیقه مطالعه
                    </span>
                  </div>

                  {/* Post Title */}
                  <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] group-hover:text-[#124A57] transition-colors line-clamp-2 mb-3 leading-snug">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-6 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>

                  {/* Footer / Tags & Read More */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      {post.tags && post.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#CD78B3]" />
                          {post.tags[0].name}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#124A57] group-hover:translate-x-[-4px] transition-transform">
                      مطالعه مقاله
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#124A57] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-[var(--text-secondary)] px-4">
              صفحه {currentPage} از {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#124A57] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
