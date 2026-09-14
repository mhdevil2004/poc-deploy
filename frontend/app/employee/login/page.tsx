"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Briefcase,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useEmployeeAuth } from "../hooks/useEmployeeAuth";

// ── Role card definitions ──────────────────────────────────────────────────
const ROLE_CARDS = [
  {
    label: "Administrator",
    desc: "Full portal access & user management",
    icon: ShieldAlert,
    color: "from-violet-500 to-purple-600",
    ring: "ring-violet-500",
    bg: "bg-violet-500/10 border-violet-500/30",
    text: "text-violet-300",
    glow: "shadow-violet-500/30",
    empId: "EMP005",
    password: "Admin@1234",
  },
  {
    label: "Risk Officer",
    desc: "Risk analysis & assessment review",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600",
    ring: "ring-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-300",
    glow: "shadow-blue-500/30",
    empId: "EMP007",
    password: "Risk@1234",
  },
  {
    label: "Underwriter",
    desc: "Loan underwriting & credit decisions",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-300",
    glow: "shadow-emerald-500/30",
    empId: "EMP002",
    password: "Risk@1234",
  },
  {
    label: "Read-Only Auditor",
    desc: "View-only access for compliance audit",
    icon: Eye,
    color: "from-amber-500 to-orange-600",
    ring: "ring-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-300",
    glow: "shadow-amber-500/30",
    empId: "EMP009",
    password: "Audit@1234",
  },
];

// ── Additional demo accounts for power users ───────────────────────────────
const EXTRA_DEMO = [
  { id: "EMP001", name: "Ahmad Rizki", role: "Loan Officer", password: "Loan@1234" },
  { id: "EMP003", name: "Budi Hartono", role: "Branch Manager", password: "Branch@1234" },
];

export default function EmployeeLoginPage() {
  const { login, loading } = useEmployeeAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(employeeId, password);
  };

  const selectRole = (card: (typeof ROLE_CARDS)[number]) => {
    setSelectedRole(card.label);
    setEmployeeId(card.empId);
    setPassword(card.password);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-900 overflow-hidden px-4 py-10">
      {/* Ambient orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />

      <div className="relative w-full max-w-lg z-10">
        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Header strip */}
          <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/25 border-b border-slate-700/50 px-8 py-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-extrabold text-xl tracking-tight leading-tight">Fintilla</p>
                <p className="text-blue-300/80 text-[10px] font-bold tracking-wide uppercase leading-tight">
                  Bank Portal
                </p>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">BankPortal Sign In</h1>
            <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              Secure access for authorized bank employees
            </p>
          </div>

          {/* Role selection */}
          <div className="px-8 pt-6 pb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              Select Your Role
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLE_CARDS.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedRole === card.label;
                return (
                  <button
                    key={card.label}
                    type="button"
                    onClick={() => selectRole(card)}
                    className={`flex items-start gap-2.5 px-3 py-3 rounded-2xl border text-left transition-all duration-200 group
                      ${isSelected
                        ? `${card.bg} ring-2 ${card.ring} ring-offset-0 scale-[1.02] shadow-lg ${card.glow}`
                        : "bg-slate-800/50 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/80"
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 shadow-md ${card.glow} transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className={`text-[11px] font-bold leading-tight transition-colors ${isSelected ? card.text : "text-slate-300 group-hover:text-white"}`}>
                        {card.label}
                      </p>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{card.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedRole && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span><span className="text-emerald-400 font-semibold">{selectedRole}</span> selected — credentials auto-filled below</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-8 my-1 border-t border-slate-700/40" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-5 space-y-4">
            {/* Employee ID */}
            <div className="space-y-1.5">
              <label htmlFor="emp-id" className="text-sm font-semibold text-slate-300">
                Employee ID
              </label>
              <input
                id="emp-id"
                type="text"
                autoComplete="username"
                placeholder="e.g. EMP001"
                value={employeeId}
                onChange={(e) => { setEmployeeId(e.target.value); setSelectedRole(null); }}
                required
                className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="emp-password" className="text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="emp-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-900/60 border border-slate-600/60 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In button */}
            <button
              id="employee-signin-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In & Continue to MFA
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Extra demo accounts */}
          <div className="px-8 pb-7">
            <button
              id="demo-accounts-toggle"
              type="button"
              onClick={() => setShowExtra(!showExtra)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors border border-slate-700/60 rounded-xl px-4 py-3 bg-slate-900/40"
            >
              <span>More Demo Accounts (POC)</span>
              {showExtra ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showExtra && (
              <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {EXTRA_DEMO.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setEmployeeId(acc.id);
                      setPassword(acc.password);
                      setSelectedRole(null);
                      setShowExtra(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700/40 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all text-left group"
                  >
                    <div>
                      <p className="text-slate-200 text-xs font-semibold group-hover:text-white transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-0.5">{acc.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-[10px] font-mono">{acc.id}</p>
                      <p className="text-blue-500/70 text-[10px] mt-0.5 group-hover:text-blue-400 transition-colors">
                        Click to fill →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center mt-5 text-slate-500 text-xs">
          Not an employee?{" "}
          <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Return to Fintilla Home
          </Link>
        </p>
      </div>
    </div>
  );
}
