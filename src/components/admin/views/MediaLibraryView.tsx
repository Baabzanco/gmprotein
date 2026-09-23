import React, { useState, useEffect, useRef } from "react";
import { adminService } from "../../../services/adminService";
import { formatPersianNumber, toPersianDigits } from "../../../utils/formatters";
import { useAdminToast } from "../ui/AdminToast";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  Info,
  Filter,
  Grid,
  List,
  Eye,
  RefreshCw,
  X,
  FileSpreadsheet,
  Film
} from "lucide-react";

interface MediaItem {
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
  createdAt: string;
  updatedAt: string;
  referencedBy?: string[];
}

export const MediaLibraryView: React.FC = () => {
  const { showSuccess, showError } = useAdminToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selected Media Details Modal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [usageReferences, setUsageReferences] = useState<string[]>([]);
  const [loadingUsage, setLoadingUsage] = useState<boolean>(false);
  const [editAlt, setEditAlt] = useState<string>("");
  const [editCaption, setEditCaption] = useState<string>("");
  const [isSavingMeta, setIsSavingMeta] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState<string>("");
  const [uploadCaption, setUploadCaption] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal
  const [deleteModalItem, setDeleteModalItem] = useState<MediaItem | null>(null);
  const [deleteReferences, setDeleteReferences] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await adminService.getMediaList({
        search: searchQuery || undefined,
        mediaType: typeFilter !== "ALL" ? typeFilter : undefined,
      });
      setItems(res || []);
      setTotalCount(res?.length || 0);
    } catch (err: any) {
      showError(err.message || "خطا در دریافت لیست رسانه‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  const handleOpenDetails = async (item: MediaItem) => {
    setSelectedItem(item);
    setEditAlt(item.alt || "");
    setEditCaption(item.caption || "");
    setUsageReferences([]);
    setLoadingUsage(true);

    try {
      const res = await adminService.checkMediaUsage(item.id);
      setUsageReferences(res.references || []);
    } catch (err) {
      // safe fallback
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!selectedItem) return;
    setIsSavingMeta(true);
    try {
      const updated = await adminService.updateMedia(selectedItem.id, {
        alt: editAlt,
        caption: editCaption,
      });
      showSuccess("مشخصات متادیتا با موفقیت بروزرسانی شد");
      setSelectedItem({ ...selectedItem, alt: editAlt, caption: editCaption });
      setItems(items.map((m) => (m.id === selectedItem.id ? { ...m, alt: editAlt, caption: editCaption } : m)));
    } catch (err: any) {
      showError(err.message || "خطا در بروزرسانی متادیتا");
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = window.location.origin + (url.startsWith("/") ? url : "/" + url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    showSuccess("آدرس فایل در حافظه کپی شد");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError("");

    try {
      const created = await adminService.uploadMedia(
        uploadFile,
        { alt: uploadAlt, caption: uploadCaption },
        (p) => setUploadProgress(p)
      );

      showSuccess(`فایل «${uploadFile.name}» با موفقیت بارگذاری شد`);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadAlt("");
      setUploadCaption("");
      fetchMedia();
    } catch (err: any) {
      setUploadError(err.message || "خطا در بارگذاری فایل");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenDelete = async (item: MediaItem) => {
    setDeleteModalItem(item);
    setDeleteReferences([]);
    try {
      const res = await adminService.checkMediaUsage(item.id);
      setDeleteReferences(res.references || []);
    } catch {}
  };

  const handleConfirmDelete = async (force = false) => {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    try {
      await adminService.deleteMedia(deleteModalItem.id, force);
      showSuccess("فایل رسانه‌ای با موفقیت حذف گردید");
      setDeleteModalItem(null);
      if (selectedItem?.id === deleteModalItem.id) {
        setSelectedItem(null);
      }
      fetchMedia();
    } catch (err: any) {
      showError(err.message || "خطا در حذف فایل");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 بایت";
    const k = 1024;
    const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return toPersianDigits(parseFloat((bytes / Math.pow(k, i)).toFixed(1))) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-[#CD78B3]" />
            <span>کتابخانه چندرسانه‌ای متمرکز</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مدیریت تصاویر، ویدیوهای هیروسکشن و فایل‌های مستندات همراه با ردیابی خودکار پیوندها و امنیت حذف
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMedia()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="بروزرسانی لیست"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#CD78B3]" : ""}`} />
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#124A57] hover:bg-[#185e6f] text-white text-xs font-bold transition-all shadow-md shadow-[#124A57]/20 flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>بارگذاری رسانه جدید</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام فایل یا عنوان..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#CD78B3]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "همه فایل‌ها" },
            { id: "IMAGE", label: "تصاویر" },
            { id: "VIDEO", label: "ویدیوها" },
            { id: "DOCUMENT", label: "اسناد" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === tab.id
                  ? "bg-[#CD78B3] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 mr-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "grid" ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-400"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "list" ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-400"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid or List */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#CD78B3]/20 border-t-[#CD78B3] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">در حال دریافت و پایش رسانه‌ها...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">هیچ فایلی در این دسته یافت نشد</p>
          <p className="text-xs text-slate-400">می‌توانید اولین فایل را با دکمه بارگذاری اضافه کنید.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => {
            const isVid = item.mediaType === "VIDEO";
            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetails(item)}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-[#CD78B3] hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                  {isVid ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                      <Film className="w-8 h-8 text-[#CD78B3] mb-1" />
                      <span className="text-[10px] font-mono">ویدیو MP4</span>
                    </div>
                  ) : item.mediaType === "IMAGE" ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-slate-400" />
                  )}

                  {/* Badge */}
                  <span className="absolute bottom-2 left-2 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white font-mono backdrop-blur-xs">
                    {formatBytes(item.size)}
                  </span>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block text-right" title={item.filename}>
                    {item.filename}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{item.extension.toUpperCase()}</span>
                    <span className="text-[9px]">{new Date(item.createdAt).toLocaleDateString("fa-IR")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-3">پیش‌نمایش</th>
                <th className="p-3">نام فایل</th>
                <th className="p-3">نوع</th>
                <th className="p-3">اندازه</th>
                <th className="p-3">تاریخ بارگذاری</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 w-16">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                      {item.mediaType === "IMAGE" ? (
                        <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
                      ) : item.mediaType === "VIDEO" ? (
                        <Film className="w-5 h-5 text-[#CD78B3]" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.filename}</td>
                  <td className="p-3 font-mono text-slate-500">{item.mimeType}</td>
                  <td className="p-3 font-mono">{formatBytes(item.size)}</td>
                  <td className="p-3 text-slate-400">{new Date(item.createdAt).toLocaleDateString("fa-IR")}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenDetails(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#124A57] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="مشاهده جزئیات"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(item.url)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#CD78B3] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="کپی آدرس"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Media Details Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#CD78B3]" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">مشخصات و مدیریت فایل رسانه‌ای</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="aspect-16/9 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
              {selectedItem.mediaType === "VIDEO" ? (
                <video src={selectedItem.url} controls className="w-full h-full max-h-64 object-contain" />
              ) : selectedItem.mediaType === "IMAGE" ? (
                <img src={selectedItem.url} alt={selectedItem.alt || ""} className="max-h-64 object-contain" />
              ) : (
                <FileText className="w-16 h-16 text-slate-600" />
              )}
            </div>

            {/* Metadata Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">اندازه فایل:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{formatBytes(selectedItem.size)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">فرمت:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedItem.extension}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">نوع مدیا:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.mediaType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">تاریخ ایجاد:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(selectedItem.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>

            {/* URL Copy Bar */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">آدرس مستقیم دسترسی (URL):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  dir="ltr"
                  value={selectedItem.url}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-mono"
                />
                <button
                  onClick={() => handleCopyUrl(selectedItem.url)}
                  className="px-4 py-2 rounded-xl bg-[#124A57] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl ? "کپی شد" : "کپی آدرس"}</span>
                </button>
              </div>
            </div>

            {/* Usage Analysis Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#CD78B3]" />
                  <span>پیوندها و وضعیت استفاده در سامانه:</span>
                </span>
                {loadingUsage && <span className="text-[10px] text-slate-400 font-normal">در حال بررسی...</span>}
              </div>

              {usageReferences.length > 0 ? (
                <div className="space-y-1 pt-1">
                  <p className="text-xs text-amber-500 font-medium">
                    این فایل در بخش‌های زیر پیوند خورده است:
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside pr-1">
                    {usageReferences.map((ref, idx) => (
                      <li key={idx} className="font-semibold">{ref}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-emerald-500 font-medium">
                  این فایل در حال حاضر در هیچ بخشی از سامانه پیوند ندارد و حذف آن بی‌خطر است.
                </p>
              )}
            </div>

            {/* Editable Meta Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  متن جایگزین تصویر (Alt Text):
                </label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="توضیح کوتاه تصویر برای سئو و دسترس‌پذیری..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#CD78B3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  توضیحات تکمیلی (Caption):
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="توضیحات اختیاری..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#CD78B3]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleOpenDelete(selectedItem)}
                className="px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف فایل</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  disabled={isSavingMeta}
                  className="px-5 py-2.5 rounded-xl bg-[#CD78B3] hover:bg-[#b8619e] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMeta ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#CD78B3]" />
                <span>بارگذاری فایل جدید در کتابخانه رسانه</span>
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleStartUpload} className="space-y-4">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#CD78B3] rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-slate-50 dark:bg-slate-800/40"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadFile(e.target.files[0]);
                      setUploadAlt(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="hidden"
                  accept="image/*,video/*,application/pdf"
                />

                <Upload className="w-8 h-8 text-[#CD78B3] mx-auto" />
                {uploadFile ? (
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {uploadFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatBytes(uploadFile.size)}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      کلیک کنید یا فایل را به اینجا بکشید
                    </span>
                    <span className="text-[10px] text-slate-400">
                      فرمت‌های مجاز: JPG, PNG, WEBP, MP4, WEBM (حداکثر ۱۰۰ مگابایت برای ویدیو، ۱۵ مگابایت برای تصویر)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  متن جایگزین (Alt Text):
                </label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="عنوان فارسی یا انگلیسی فایل..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#CD78B3]"
                />
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>در حال بارگذاری و پردازش روی سرور...</span>
                    <span>{toPersianDigits(uploadProgress)}٪</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-[#CD78B3] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="px-5 py-2 rounded-xl bg-[#124A57] hover:bg-[#185e6f] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? "در حال ارسال..." : "شروع بارگذاری"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Deletion Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">تأیید حذف فایل رسانه‌ای</h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{deleteModalItem.filename}</p>
              </div>
            </div>

            {deleteReferences.length > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>هشدار: فایل دارای پیوند فعال است!</span>
                </div>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  این فایل در حال حاضر در بخش‌های زیر استفاده می‌شود:
                </p>
                <ul className="list-disc list-inside font-semibold text-slate-800 dark:text-slate-200">
                  {deleteReferences.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500 pt-1">
                  حذف این فایل ممکن است باعث نمایش تصویر شکسته در بخش‌های بالا گردد.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                آیا از حذف دائم این فایل از سرور و پایگاه داده اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deleteReferences.length > 0)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "در حال حذف..." : deleteReferences.length > 0 ? "حذف اجباری (Force)" : "تأیید و حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
