import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminToastContainer } from "../ui/AdminToast";
import { adminService } from "../../../services/adminService";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [stats, setStats] = useState<any>({
    pendingQuotations: 0,
    newContacts: 0,
    databaseConnected: true,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCounters = async () => {
      try {
        const data = await adminService.getDashboardStats();
        if (isMounted && data) {
          setStats(data);
        }
      } catch (err) {
        // Safe silent fallback
      }
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 30000); // Poll counters every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        pendingQuotationsCount={stats.pendingQuotations}
        newContactsCount={stats.newContacts}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:mr-20" : "lg:mr-72"
        }`}
      >
        <AdminHeader
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          databaseConnected={stats.databaseConnected}
          pendingQuotationsCount={stats.pendingQuotations}
          newContactsCount={stats.newContacts}
        />

        <main className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      <AdminToastContainer />
    </div>
  );
};
