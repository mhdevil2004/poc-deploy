"use client";

import { useState } from "react";
import { useRequireEmployeeAuth } from "../../hooks/useEmployeeAuth";
import { EmployeeSidebar } from "./EmployeeSidebar";
import { EmployeeHeader } from "./EmployeeHeader";

interface EmployeeLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function EmployeeLayout({ children, title, subtitle }: EmployeeLayoutProps) {
  const { employee, loading, isAuthenticated, logout } = useRequireEmployeeAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show nothing while checking auth (route guard in useRequireEmployeeAuth handles redirect)
  if (loading || !isAuthenticated || !employee) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full max-w-[100vw] overflow-hidden bg-slate-50 font-sans">
      {/* Ambient glow blobs — same design language as customer portal */}
      <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative flex h-full w-full max-w-[100vw] overflow-hidden">
        <EmployeeSidebar
          employee={employee}
          onLogout={logout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="relative z-10 min-w-0 flex-1 w-full overflow-y-auto overflow-x-hidden p-6 lg:p-8 no-scrollbar">
          <EmployeeHeader
            onMenuClick={() => setSidebarOpen(true)}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
