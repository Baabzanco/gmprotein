import React from "react";
import { useRouter } from "../../context/RouterContext";
import { useAuth } from "../../context/AuthContext";
import { AdminLayout } from "./layout/AdminLayout";
import { AdminLoginView } from "./views/AdminLoginView";
import { DashboardHomeView } from "./views/DashboardHomeView";
import { ProductsManagementView } from "./views/ProductsManagementView";
import { CategoriesManagementView } from "./views/CategoriesManagementView";
import { PriceManagementView } from "./views/PriceManagementView";
import { DiscountsManagementView } from "./views/DiscountsManagementView";
import { CampaignsManagementView } from "./views/CampaignsManagementView";
import { ContactsManagementView } from "./views/ContactsManagementView";
import { ContentManagementView } from "./views/ContentManagementView";
import { BlogManagementView } from "./views/BlogManagementView";
import { MediaLibraryView } from "./views/MediaLibraryView";
import { UsersManagementView } from "./views/UsersManagementView";
import { RolesPermissionsView } from "./views/RolesPermissionsView";
import { ReportsManagementView } from "./views/ReportsManagementView";
import { AuditLogsView } from "./views/AuditLogsView";
import { SystemLogsView } from "./views/SystemLogsView";
import { SettingsView } from "./views/SettingsView";
import { RefreshCw } from "lucide-react";

export const AdminRoot: React.FC = () => {
  const { path } = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // If session is verifying from localStorage / cookie:
  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#071318] flex flex-col items-center justify-center p-4 text-slate-200"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#124A57] border border-[#CD78B3]/50 flex items-center justify-center font-black text-[#CD78B3] mb-4 animate-pulse">
          PG
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#CD78B3]" />
          <span>در حال اعتبارسنجی نشست امنیتی...</span>
        </div>
      </div>
    );
  }

  // If not logged in, always render the Admin Login View
  if (!isAuthenticated) {
    return <AdminLoginView />;
  }

  // Route sub-views
  const renderCurrentView = () => {
    if (path.startsWith("/admin/products")) return <ProductsManagementView />;
    if (path.startsWith("/admin/categories")) return <CategoriesManagementView />;
    if (path.startsWith("/admin/prices")) return <PriceManagementView />;
    if (path.startsWith("/admin/discounts")) return <DiscountsManagementView />;
    if (path.startsWith("/admin/campaigns")) return <CampaignsManagementView />;
    if (path.startsWith("/admin/contacts")) return <ContactsManagementView />;
    if (path.startsWith("/admin/content")) return <ContentManagementView />;
    if (path.startsWith("/admin/blog")) return <BlogManagementView />;
    if (path.startsWith("/admin/media")) return <MediaLibraryView />;
    if (path.startsWith("/admin/users")) return <UsersManagementView />;
    if (path.startsWith("/admin/roles")) return <RolesPermissionsView />;
    if (path.startsWith("/admin/reports")) return <ReportsManagementView />;
    if (path.startsWith("/admin/audit-logs")) return <AuditLogsView />;
    if (path.startsWith("/admin/system-logs")) return <SystemLogsView />;
    if (path.startsWith("/admin/settings")) return <SettingsView />;
    return <DashboardHomeView />;
  };

  return <AdminLayout>{renderCurrentView()}</AdminLayout>;
};
