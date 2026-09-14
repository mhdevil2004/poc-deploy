"use client";

import { Menu, Search, Bell } from "lucide-react";
import type { AdminUser } from "../../../admin-data/mockAdminUsers";
import { useTranslation } from "@/i18n";

interface AdminHeaderProps {
  user: AdminUser;
  onMobileMenu: () => void;
}

export function AdminHeader({ user, onMobileMenu }: AdminHeaderProps) {
  const { language } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 h-16 shadow-sm shadow-slate-100/50">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMobileMenu}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 flex items-center justify-start lg:ml-0 ml-4 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <input
              type="text"
              placeholder={language === "en" ? "Search anywhere..." : "Cari di mana saja..."}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4 lg:gap-6 ml-auto">
          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile snippet */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-violet-700">
                {user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
