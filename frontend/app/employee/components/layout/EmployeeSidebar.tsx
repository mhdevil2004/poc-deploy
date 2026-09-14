"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  CreditCard,
  Settings,
  LogOut,
  Landmark,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  ActivitySquare,
  ChevronDown,
  AlertOctagon,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/formatters";
import { getAllowedSections, type NavSection } from "../../lib/permissions";
import type { Employee } from "../../types";
import { useTranslation } from "@/i18n";

interface EmployeeSidebarProps {
  employee: Employee;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_CONFIG: {
  section: NavSection;
  href: string;
  icon: React.ElementType;
  labelId: string;
  labelEn: string;
  children?: { section: NavSection; href: string; labelId: string; labelEn: string }[];
}[] = [
  { section: "dashboard", href: "/employee/dashboard", icon: LayoutDashboard, labelId: "Dashboard", labelEn: "Dashboard" },
  { section: "customers", href: "/employee/customers", icon: Users, labelId: "Nasabah", labelEn: "Customers" },
  {
    section: "assessments",
    href: "/employee/assessments",
    icon: ClipboardList,
    labelId: "Penilaian",
    labelEn: "Assessments",
    children: [
      { section: "assessments", href: "/employee/assessments", labelId: "Semua Penilaian", labelEn: "All Assessments" },
      { section: "manual-review", href: "/employee/assessments/manual-review", labelId: "Manual Review", labelEn: "Manual Review" },
    ],
  },
  { section: "lending", href: "/employee/lending", icon: CreditCard, labelId: "Pembiayaan", labelEn: "Financing" },
  { section: "risk", href: "/employee/risk", icon: ShieldAlert, labelId: "Analisis Risiko", labelEn: "Risk Analysis" },
  { section: "configuration", href: "/employee/configuration", icon: Settings, labelId: "Konfigurasi", labelEn: "Configuration" },
  { section: "reports", href: "/employee/reports", icon: FileBarChart, labelId: "Laporan", labelEn: "Reports" },
  { section: "activity", href: "/employee/activity", icon: ActivitySquare, labelId: "Aktivitas / Audit", labelEn: "Activity / Audit" },
];

export function EmployeeSidebar({ employee, onLogout, isOpen, onClose }: EmployeeSidebarProps) {
  const pathname = usePathname();
  const allowedSections = getAllowedSections(employee.role);
  const [assessmentsOpen, setAssessmentsOpen] = useState(
    pathname?.startsWith("/employee/assessments") ?? false
  );
  const { language, setLanguage } = useTranslation();

  const visibleNavItems = NAV_CONFIG.filter((item) =>
    allowedSections.includes(item.section)
  );

  const isActive = (href: string) => {
    if (href === "/employee/dashboard") return pathname === "/employee/dashboard";
    if (href === "/employee/assessments") return pathname === "/employee/assessments";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static top-0 left-0 z-50 h-full w-64 flex-shrink-0 flex flex-col",
          "bg-slate-900 border-r border-slate-800",
          "transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight leading-tight">Fintilla</p>
            <p className="text-slate-400 text-[10px] font-medium tracking-wide uppercase leading-tight">
              Lender Portal
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/80">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isAssessmentsParent = item.children && item.section === "assessments";
            const hasChildren = !!item.children;
            const childAllowed = hasChildren && item.children!.some(c =>
              c.section === "assessments" ? allowedSections.includes("assessments") : allowedSections.includes(c.section)
            );

            if (isAssessmentsParent && childAllowed) {
              const isParentActive = pathname?.startsWith("/employee/assessments") ?? false;
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setAssessmentsOpen(v => !v)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      isParentActive
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isParentActive ? "text-blue-400" : "text-slate-500")} strokeWidth={1.75} />
                    <span className="flex-1 text-left">{language === "en" ? item.labelEn : item.labelId}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", assessmentsOpen ? "rotate-180" : "")} />
                  </button>
                  {assessmentsOpen && (
                    <div className="ml-7 mt-0.5 space-y-0.5 border-l border-slate-700 pl-3">
                      {item.children!.map((child) => {
                        if (!allowedSections.includes(child.section)) return null;
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all",
                              childActive
                                ? "text-blue-400 bg-blue-600/10"
                                : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
                            )}
                          >
                            {child.section === "manual-review" && (
                              <AlertOctagon className="w-3 h-3 flex-shrink-0" />
                            )}
                            {language === "en" ? child.labelEn : child.labelId}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                  strokeWidth={1.75}
                />
                <span>{language === "en" ? item.labelEn : item.labelId}</span>
                {active && (
                  <ChevronRight className="ml-auto w-3.5 h-3.5 text-blue-400/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher */}
        <div className="px-4 py-3 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{language === "en" ? "Language" : "Bahasa"}</span>
          </div>
          <div className="flex gap-1.5">
            {(["id", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  language === l
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-500 bg-slate-800 hover:bg-slate-700 hover:text-slate-200"
                )}
              >
                {l === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}
              </button>
            ))}
          </div>
        </div>

        {/* Employee profile + logout */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-slate-100 text-xs font-semibold truncate">{employee.name}</p>
              <p className="text-slate-500 text-[10px] truncate">{employee.role}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            {language === "en" ? "Sign Out" : "Keluar"}
          </button>
        </div>
      </aside>
    </>
  );
}
