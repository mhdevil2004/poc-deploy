"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminSidebar } from "./layout/AdminSidebar";
import { AdminHeader } from "./layout/AdminHeader";
import { useRequireAdminAuth } from "../hooks/useAdminAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, logout } = useRequireAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Browser storage is unavailable during the server render. Keep this state
  // brief and explicit instead of leaving an apparently stuck blank spinner.
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500">Checking admin session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Admin sign-in required</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Your admin session is missing or has expired. Sign in and complete MFA to open the portal.
        </p>
        <Link href="/admin/login" className="mt-5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
          Go to Admin Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0 relative z-20">
        <AdminSidebar user={user} onLogout={logout} />
      </div>

      {/* Sidebar - Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar user={user} onLogout={logout} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} onMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
