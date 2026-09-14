"use client";

import { useState } from "react";
import { Bell, Menu, ShieldCheck, Landmark, Activity, Lock, ChevronDown, User, LogOut } from "lucide-react";
import { useRequireEmployeeAuth } from "../../hooks/useEmployeeAuth";
import { useTranslation } from "@/i18n";

interface EmployeeHeaderProps {
  onMenuClick: () => void;
}

export function EmployeeHeader({ onMenuClick }: EmployeeHeaderProps) {
  const { employee, logout } = useRequireEmployeeAuth();
  const { language, setLanguage, t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 shadow-sm">
      {/* Left side: Hamburger menu (mobile) + Premium System Status UX */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Portal Branding & Live Engine Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-sm border border-slate-800">
            <Landmark className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold tracking-wide">Fintilla</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-bold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Assessment Engine Active</span>
          </div>
        </div>
      </div>

      {/* Right side: Security Clearance, Language, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* MFA Verified Security Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/80 border border-blue-200/60 rounded-xl text-[10px] font-bold text-blue-700">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>MFA VERIFIED</span>
        </div>

        {/* Language Switcher */}
        <div className="flex bg-slate-100/90 backdrop-blur-xl p-1 rounded-xl shadow-inner border border-slate-200/60">
          <button
            onClick={() => setLanguage("id")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              language === "id"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              language === "en"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            EN
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell className="w-4.5 h-4.5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Employee Profile Dropdown */}
        {employee && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-100/80 rounded-xl transition-all border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left leading-none">
                <p className="text-xs font-bold text-slate-800">{employee.name}</p>
                <p className="text-[10px] font-semibold text-blue-600 mt-0.5">{employee.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{employee.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{employee.employeeId}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    {employee.role}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
