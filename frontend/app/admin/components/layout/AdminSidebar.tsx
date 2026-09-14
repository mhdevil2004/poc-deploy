"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, BookOpen, LogOut, Landmark, Globe } from "lucide-react";
import type { AdminUser } from "../../../admin-data/mockAdminUsers";
import { useTranslation } from "@/i18n";

interface AdminSidebarProps {
  user: AdminUser;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { href: "/admin/assessments", icon: ClipboardList, labelEn: "Assessments", labelId: "Penilaian" },
  { href: "/admin/audit", icon: BookOpen, labelEn: "Audit Log", labelId: "Log Audit" },
];

export function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const { language, setLanguage } = useTranslation();

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const label = (en: string, id: string) => (language === "en" ? en : id);

  return (
    <aside className="fixed lg:static top-0 left-0 z-50 h-full w-64 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Landmark className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-tight leading-tight">Fintilla</p>
          <p className="text-violet-400/80 text-[10px] font-medium tracking-wide uppercase leading-tight">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="bg-slate-800/80 rounded-xl px-3 py-2">
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-0.5">
            {language === "en" ? "Signed in as" : "Masuk sebagai"}
          </p>
          <p className="text-white text-xs font-bold truncate">{user.name}</p>
          <p className="text-violet-400 text-[10px] mt-0.5">{user.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${active ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`}
                strokeWidth={1.75}
              />
              <span>{label(item.labelEn, item.labelId)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Language switcher */}
      <div className="px-4 py-3 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            {language === "en" ? "Language" : "Bahasa"}
          </span>
        </div>
        <div className="flex gap-1.5">
          {(["id", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                language === l
                  ? "bg-violet-600 text-white shadow"
                  : "text-slate-500 bg-slate-800 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              {l === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          {language === "en" ? "Sign Out" : "Keluar"}
        </button>
      </div>
    </aside>
  );
}
