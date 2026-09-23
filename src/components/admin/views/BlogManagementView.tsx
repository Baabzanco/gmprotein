import React, { useState, useEffect, useRef } from "react";
import { blogService } from "../../../services/blogService";
import {
  BlogPostDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogPostStatus,
} from "../../../../shared/types";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Archive,
  Image as ImageIcon,
  Upload,
  Globe,
  Share2,
  Sparkles,
  Layers,
  Tag as TagIcon,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export const BlogManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "categories" | "tags">("posts");

  // Posts State
  const [posts, setPosts] = useState<BlogPostDTO[]>([]);
  const [categories, setCategories] = useState<BlogCategoryDTO[]>([]);
  const [tags, setTags] = useState<BlogTagDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    status: BlogPostStatus;
    publishedAt: string;
    categoryIds: string[];
    tagNames: string[];
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  }>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    status: "DRAFT",
    publishedAt: "",
    categoryIds: [],
    tagNames: [],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [savingPost, setSavingPost] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState<string>("");

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState<boolean>(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<{ name: string; slug: string; description: string; isActive: boolean }>({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  // Tag Modal State
  const [tagModalOpen, setTagModalOpen] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>("");

  // Delete Confirmation State
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "post" | "category";
    id: string;
    title: string;
  }>({ open: false, type: "post", id: "", title: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await blogService.getAdminPosts({
        page: currentPage,
        limit: 10,
        status: (statusFilter as BlogPostStatus) || undefined,
        categorySlug: categoryFilter || undefined,
        search: searchQuery || undefined,
      });
      setPosts(res.posts);
      setTotalPages(res.totalPages);
      setTotalPosts(res.total);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndTags = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        blogService.getAdminCategories(),
        blogService.getAdminTags(),
      ]);
      setCategories(cats);
      setTags(tgs);
    } catch (e) {}
  };

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  useEffect(() => {
    if (activeTab === "posts") {
      loadPosts();
    }
  }, [currentPage, statusFilter, categoryFilter, searchQuery, activeTab]);

  const handleOpenCreate = () => {
    setEditingPostId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      status: "DRAFT",
      publishedAt: new Date().toISOString().slice(0, 16),
      categoryIds: categories.length > 0 ? [categories[0].id] : [],
      tagNames: [],
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = async (post: BlogPostDTO) => {
    setEditingPostId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featuredImage: post.featuredImage || "",
      status: post.status,
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : "",
      categoryIds: post.categories ? post.categories.map((c) => c.id) : [],
      tagNames: post.tags ? post.tags.map((t) => t.name) : [],
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywords: post.seoKeywords || "",
      canonicalUrl: post.canonicalUrl || "",
      ogTitle: post.ogTitle || "",
      ogDescription: post.ogDescription || "",
      ogImage: post.ogImage || "",
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await blogService.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        featuredImage: res.url,
        ogImage: prev.ogImage || res.url,
      }));
    } catch (err: any) {
      alert(err.message || "خطا در بارگذاری تصویر");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("عنوان مقاله الزامی است");
      return;
    }
    if (!formData.content.trim()) {
      setFormError("متن محتوای مقاله الزامی است");
      return;
    }

    setSavingPost(true);
    setFormError(null);
    try {
      if (editingPostId) {
        await blogService.updatePost(editingPostId, formData);
      } else {
        await blogService.createPost(formData);
      }
      setEditorOpen(false);
      loadPosts();
    } catch (err: any) {
      setFormError(err.message || "خطا در ذخیره‌سازی مقاله");
    } finally {
      setSavingPost(false);
    }
  };

  const handleToggleStatus = async (post: BlogPostDTO) => {
    const newStatus: BlogPostStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await blogService.updatePostStatus(post.id, newStatus);
      loadPosts();
    } catch (err: any) {
      alert(err.message || "خطا در تغییر وضعیت مقاله");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteDialog.type === "post") {
        await blogService.deletePost(deleteDialog.id);
        loadPosts();
      } else if (deleteDialog.type === "category") {
        await blogService.deleteCategory(deleteDialog.id);
        loadCategoriesAndTags();
      }
      setDeleteDialog({ open: false, type: "post", id: "", title: "" });
    } catch (err: any) {
      alert(err.message || "خطا در عملیات حذف");
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await blogService.updateCategory(editingCatId, catForm);
      } else {
        await blogService.createCategory(catForm);
      }
      setCatModalOpen(false);
      loadCategoriesAndTags();
    } catch (err: any) {
      alert(err.message || "خطا در ذخیره دسته‌بندی");
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await blogService.createTag(newTagName.trim());
      setNewTagName("");
      setTagModalOpen(false);
      loadCategoriesAndTags();
    } catch (err: any) {
      alert(err.message || "خطا در ایجاد برچسب");
    }
  };

  const addTagToForm = (tagName: string) => {
    if (!tagName.trim()) return;
    const clean = tagName.trim();
    if (!formData.tagNames.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        tagNames: [...prev.tagNames, clean],
      }));
    }
    setNewTagInput("");
  };

  const removeTagFromForm = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      tagNames: prev.tagNames.filter((t) => t !== tagName),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e272f] border border-[#184550] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-[#CD78B3] text-xs font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>سیستم مدیریت وبلاگ و سئو (Phase 4)</span>
          </div>
          <h1 className="text-2xl font-black text-white">مدیریت مقالات، دسته‌ها و تنظیمات سئو</h1>
          <p className="text-slate-400 text-xs mt-1">
            انتشار مقالات تخصصی، بهینه‌سازی متاتگ‌های Open Graph و نقشه سایت با ساختار استاندارد Schema.org
          </p>
        </div>

        {/* Tab Switcher & CTA */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0a1e24] p-1 rounded-xl border border-[#184550]">
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "posts" ? "bg-[#124A57] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              مقالات ({totalPosts})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "categories" ? "bg-[#124A57] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              دسته‌بندی‌ها ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "tags" ? "bg-[#124A57] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              برچسب‌ها ({tags.length})
            </button>
          </div>

          {activeTab === "posts" && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CD78B3] hover:bg-[#b8619e] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>مقاله جدید</span>
            </button>
          )}

          {activeTab === "categories" && (
            <button
              onClick={() => {
                setEditingCatId(null);
                setCatForm({ name: "", slug: "", description: "", isActive: true });
                setCatModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CD78B3] hover:bg-[#b8619e] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>دسته‌بندی جدید</span>
            </button>
          )}

          {activeTab === "tags" && (
            <button
              onClick={() => {
                setNewTagName("");
                setTagModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CD78B3] hover:bg-[#b8619e] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>برچسب جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: POSTS LIST */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#0e272f] border border-[#184550] p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="جستجو در عنوان یا متن..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-[#124A57]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#124A57]"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="PUBLISHED">منتشر شده</option>
                <option value="DRAFT">پیش‌نویس</option>
                <option value="ARCHIVED">بایگانی شده</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#124A57]"
              >
                <option value="">همه دسته‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-[#0e272f] border border-[#184550] rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">در حال بارگذاری مقالات...</div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                مقاله‌ای با این مشخصات یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#08181c] text-slate-400 uppercase border-b border-[#184550]">
                    <tr>
                      <th className="p-4">تصویر</th>
                      <th className="p-4">عنوان و اسلاگ</th>
                      <th className="p-4">دسته‌بندی</th>
                      <th className="p-4">نویسنده</th>
                      <th className="p-4">وضعیت</th>
                      <th className="p-4">تاریخ انتشار</th>
                      <th className="p-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#184550]/50 text-slate-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-[#124A57]/10 transition-colors">
                        <td className="p-4 w-16">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-[#184550]">
                            <img
                              src={post.featuredImage || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80"}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-white text-sm line-clamp-1">{post.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                            /blog/{post.slug}
                          </div>
                        </td>
                        <td className="p-4">
                          {post.categories && post.categories.length > 0 ? (
                            <span className="px-2.5 py-1 rounded-md bg-[#124A57]/60 text-teal-300 text-[11px]">
                              {post.categories[0].name}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-300">{post.authorName || "مدیر محتوا"}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            title="برای تغییر وضعیت کلیک کنید"
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1.5 w-fit ${
                              post.status === "PUBLISHED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                            }`}
                          >
                            {post.status === "PUBLISHED" ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>منتشر شده</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>پیش‌نویس</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString("fa-IR")
                            : "نامشخص"}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="مشاهده در سایت"
                              className="p-1.5 rounded-lg bg-[#0a1e24] hover:bg-[#124A57] text-slate-400 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleOpenEdit(post)}
                              title="ویرایش مقاله"
                              className="p-1.5 rounded-lg bg-[#0a1e24] hover:bg-[#124A57] text-teal-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: "post",
                                  id: post.id,
                                  title: post.title,
                                })
                              }
                              title="حذف مقاله"
                              className="p-1.5 rounded-lg bg-[#0a1e24] hover:bg-red-900/40 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#184550] flex items-center justify-between text-xs text-slate-400">
                <span>
                  نمایش صفحه {currentPage} از {totalPages} (کل مقالات: {totalPosts})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-[#184550] disabled:opacity-30 hover:bg-[#124A57] text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-[#184550] disabled:opacity-30 hover:bg-[#124A57] text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES LIST */}
      {activeTab === "categories" && (
        <div className="bg-[#0e272f] border border-[#184550] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">دسته‌بندی‌های وبلاگ</h3>
            <span className="text-xs text-slate-400">تعداد کل: {categories.length} دسته</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#0a1e24] border border-[#184550] rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{cat.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#124A57] text-teal-300">
                      {cat.postCount || 0} مقاله
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mb-2">اسلاگ: {cat.slug}</div>
                  {cat.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#184550]">
                  <button
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setCatForm({
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description || "",
                        isActive: cat.isActive !== false,
                      });
                      setCatModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-[#0e272f] hover:bg-[#124A57] text-teal-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ویرایش</span>
                  </button>
                  <button
                    onClick={() =>
                      setDeleteDialog({
                        open: true,
                        type: "category",
                        id: cat.id,
                        title: cat.name,
                      })
                    }
                    className="p-1.5 rounded-lg bg-[#0e272f] hover:bg-red-900/40 text-red-400 hover:text-red-200 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TAGS LIST */}
      {activeTab === "tags" && (
        <div className="bg-[#0e272f] border border-[#184550] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">برچسب‌های مقالات</h3>
            <span className="text-xs text-slate-400">تعداد کل: {tags.length} برچسب</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {tags.map((tg) => (
              <div
                key={tg.id}
                className="bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300"
              >
                <TagIcon className="w-3.5 h-3.5 text-[#CD78B3]" />
                <span>{tg.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({tg.postCount || 0})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: POST EDITOR */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0e272f] border border-[#184550] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#184550] pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#CD78B3]" />
                <h2 className="text-xl font-bold text-white">
                  {editingPostId ? "ویرایش مقاله" : "نگارش مقاله جدید"}
                </h2>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0a1e24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePost} className="space-y-6">
              {/* Row 1: Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    عنوان مقاله <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: راهنمای جامع خرید استیک ریب‌آی..."
                    className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CD78B3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    اسلاگ یکتا (URL Slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="اختیاری (خودکار از عنوان تولید می‌شود)"
                    className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CD78B3] font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Row 2: Category, Status, PublishedAt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">دسته‌بندی</label>
                  <select
                    value={formData.categoryIds[0] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryIds: e.target.value ? [e.target.value] : [] })
                    }
                    className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#CD78B3]"
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">وضعیت انتشار</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as BlogPostStatus })
                    }
                    className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#CD78B3]"
                  >
                    <option value="DRAFT">پیش‌نویس (Draft)</option>
                    <option value="PUBLISHED">منتشر شده (Published)</option>
                    <option value="ARCHIVED">بایگانی شده (Archived)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">زمان انتشار</label>
                  <input
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#CD78B3]"
                  />
                </div>
              </div>

              {/* Row 3: Featured Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">تصویر شاخص مقاله</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0a1e24] p-4 rounded-xl border border-[#184550]">
                  {formData.featuredImage ? (
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-24 h-20 object-cover rounded-lg border border-[#184550]"
                    />
                  ) : (
                    <div className="w-24 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-[#184550]">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="آدرس اینترنتی تصویر شاخص..."
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      className="w-full bg-[#0e272f] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 rounded-lg bg-[#124A57] hover:bg-[#1a5b6a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? "در حال بارگذاری..." : "آپلود تصویر از رایانه"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  خلاصه یا چکیده مقاله (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="خلاصه‌ای جذاب برای نمایش در کارت‌های وبلاگ و توضیحات سئو..."
                  className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CD78B3]"
                />
              </div>

              {/* Row 5: Content Body */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  متن اصلی مقاله (پشتیبانی از تگ‌های استاندارد HTML یا پاراگراف‌ها){" "}
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<p>متن تخصصی خود را در اینجا بنویسید...</p>"
                  className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CD78B3] font-mono leading-relaxed"
                />
              </div>

              {/* Row 6: Tags Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">برچسب‌ها</label>
                <div className="flex flex-wrap items-center gap-2 bg-[#0a1e24] p-3 rounded-xl border border-[#184550]">
                  {formData.tagNames.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#124A57] text-white text-xs flex items-center gap-1.5"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTagFromForm(tag)}
                        className="hover:text-red-300 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="برچسب جدید..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTagToForm(newTagInput);
                        }
                      }}
                      className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-28"
                    />
                    <button
                      type="button"
                      onClick={() => addTagToForm(newTagInput)}
                      className="text-xs text-teal-400 font-bold px-2 py-0.5 rounded hover:bg-[#124A57] cursor-pointer"
                    >
                      + افزودن
                    </button>
                  </div>
                </div>
              </div>

              {/* SEO & OpenGraph Accordion */}
              <div className="bg-[#0a1e24] border border-[#184550] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-teal-400 text-sm font-bold border-b border-[#184550] pb-3">
                  <Globe className="w-4 h-4" />
                  <span>تنظیمات پیشرفته سئو (SEO) و اشتراک‌گذاری اجتماعی (Open Graph)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      عنوان متا (SEO Title)
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder={formData.title || "عنوان در نتایج گوگل"}
                      className="w-full bg-[#0e272f] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      آدرس کانونیکال (Canonical URL)
                    </label>
                    <input
                      type="text"
                      value={formData.canonicalUrl}
                      onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      placeholder={`https://golmohamadi.com/blog/${formData.slug || "slug"}`}
                      className="w-full bg-[#0e272f] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    توضیحات متا (SEO Description)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder={formData.excerpt || "توضیحات حداکثر ۱۶۰ کاراکتری برای نتایج گوگل..."}
                    className="w-full bg-[#0e272f] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    کلمات کلیدی (Keywords با کاما جدا شود)
                  </label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="گوشت گرم, استیک ریب آی, درای ایج, تامین رستوران"
                    className="w-full bg-[#0e272f] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#184550]">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#184550] text-slate-300 hover:bg-[#0a1e24] text-xs font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={savingPost}
                  className="px-6 py-2.5 rounded-xl bg-[#CD78B3] hover:bg-[#b8619e] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingPost ? "در حال ذخیره‌سازی..." : "ذخیره مقاله"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY CREATION/EDIT */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e272f] border border-[#184550] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#184550] pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingCatId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نام دسته‌بندی</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسلاگ لاتین یکتا</label>
                <input
                  type="text"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  placeholder="مثال: steak-cuts"
                  className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">توضیحات</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#184550] text-slate-300 text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#CD78B3] text-white text-xs font-bold"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAG CREATION */}
      {tagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e272f] border border-[#184550] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm">افزودن برچسب جدید</h3>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نام برچسب</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ریب‌آی"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full bg-[#0a1e24] border border-[#184550] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTagModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#184550] text-slate-300 text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#CD78B3] text-white text-xs font-bold"
                >
                  ثبت برچسب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e272f] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">تأیید حذف</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              آیا از حذف {deleteDialog.type === "post" ? "مقاله" : "دسته‌بندی"} «
              <span className="text-red-400 font-bold">{deleteDialog.title}</span>» اطمینان دارید؟ این
              عملیات غیرقابل بازگشت است.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteDialog({ open: false, type: "post", id: "", title: "" })}
                className="px-4 py-2 rounded-xl border border-[#184550] text-slate-300 text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
