"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Banknote,
  ShieldAlert,
  Settings,
  FileBarChart,
  ClipboardCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/formatters";
import { useTranslation, LanguageToggle } from "@/i18n";
import { getNavItemsForRole, roleToKey } from "@/lib/permissions";
import type { TranslationKey } from "@/i18n";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon map — keyed by the icon name string in permissions.ts
const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Users,
  ClipboardList,
  Banknote,
  ShieldAlert,
  Settings,
  FileBarChart,
  ClipboardCheck,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  // Get role-filtered nav items
  const navItems = getNavItemsForRole(user?.role);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed lg:static top-0 left-0 z-50 h-full w-[72px] bg-white/70 backdrop-blur-xl border-r border-white flex flex-col items-center py-6 flex-shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* macOS traffic lights */}
        <div className="flex items-center gap-1.5 mb-10">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>

        {/* Navigation — role-filtered */}
        <nav className="flex flex-col items-center gap-7 flex-1">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || Home;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={t(item.labelKey as TranslationKey)}
                aria-label={t(item.labelKey as TranslationKey)}
                className="relative flex items-center"
              >
                {active && (
                  <div className="absolute -left-3 w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    active ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  )}
                  strokeWidth={1.5}
                />
              </Link>
            );
          })}
        </nav>

        {/* Language toggle */}
        <div className="mb-4">
          <LanguageToggle className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5 hover:text-slate-700 transition-colors" />
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title={t("nav.logout")}
          aria-label={t("nav.logout")}
          className="mb-4 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Avatar / role indicator */}
        <div
          className="w-10 h-10 relative rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          title={user ? t(`roles.${roleToKey(user.role)}` as TranslationKey) : ""}
        >
          <Image src="/images/fintilla.jpg" alt="Fintilla" width={40} height={40} className="object-cover" />
        </div>
      </aside>
    </>
  );
}
