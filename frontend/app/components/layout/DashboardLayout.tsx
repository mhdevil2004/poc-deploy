"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { AccessDenied } from "@/components/AccessDenied";
import { useAuth } from "@/hooks/useAuth";
import { hasAccess } from "@/lib/permissions";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showRightPanel?: boolean;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  showRightPanel = false,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Wait for auth to hydrate before checking permissions
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Route-level access check
  if (user && !hasAccess(user.role, pathname)) {
    return <AccessDenied />;
  }

  return (
    <div className="relative h-screen w-full max-w-[100vw] overflow-hidden bg-slate-50 font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative flex h-full w-full max-w-[100vw] overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="relative z-10 min-w-0 flex-1 w-full max-w-[100vw] overflow-y-auto overflow-x-hidden p-6 lg:p-8 no-scrollbar">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            title={title}
            subtitle={subtitle}
          />
          {children}
        </main>

        {showRightPanel && <RightPanel />}
      </div>
    </div>
  );
}
