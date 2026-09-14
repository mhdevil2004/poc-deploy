"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Landmark,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Users,
  Eye,
  Briefcase,
} from "lucide-react";
import { mockSSOLogin } from "../../admin-lib/auth";
import { MOCK_ADMIN_USERS } from "../../admin-data/mockAdminUsers";
import { useTranslation } from "@/i18n";

const ROLES = [
  {
    icon: ShieldAlert,
    label: "Administrator",
    desc: "Full portal access & user management",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    bg: "bg-violet-500/10 border-violet-500/20",
    text: "text-violet-300",
  },
  {
    icon: Briefcase,
    label: "Risk Officer",
    desc: "Risk analysis & assessment review",
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/30",
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-300",
  },
  {
    icon: ShieldCheck,
    label: "Underwriter",
    desc: "Loan underwriting & decision making",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/30",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-300",
  },
  {
    icon: Eye,
    label: "Read-Only Auditor",
    desc: "View-only access for compliance audit",
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-300",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const t = (en: string, id: string) => (language === "en" ? en : id);

  const handleSSO = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await mockSSOLogin(email.trim());
    setLoading(false);
    if (result.success) {
      router.push("/admin/mfa");
    } else {
      setError(result.error ?? "Authentication failed.");
    }
  };

  const fillDemo = (userEmail: string) => {
    setEmail(userEmail);
    setShowDemo(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden px-4 py-10">
      {/* Ambient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-violet-700/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-indigo-700/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-900/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Language toggle */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10">
        {(["id", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              language === l
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                : "text-slate-500 bg-slate-800 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            {l === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">

          {/* Header strip */}
          <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/15 border-b border-slate-700/50 px-8 py-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-extrabold text-xl tracking-tight leading-tight">Fintilla</p>
                <p className="text-violet-300/80 text-[10px] font-bold tracking-[0.2em] uppercase leading-tight">
                  Bank Portal
                </p>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              {t("BankPortal Sign In", "Masuk BankPortal")}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              {t(
                "Secure access for authorized bank employees",
                "Akses aman untuk karyawan bank yang berwenang"
              )}
            </p>
          </div>

          {/* Roles grid */}
          <div className="px-8 pt-6 pb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {t("Authorized Roles", "Peran yang Diotorisasi")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.label}
                    className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border ${role.bg} group transition-all`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-md ${role.glow}`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-bold leading-tight ${role.text}`}>{role.label}</p>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{role.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSSO} className="px-8 py-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm font-semibold text-slate-300">
                {t("Employee Email Address", "Alamat Email Karyawan")}
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder={t("e.g. andi.wijaya@fintilla.co.id", "mis. andi.wijaya@fintilla.co.id")}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                required
                className="w-full bg-slate-800/60 border border-slate-600/60 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* SSO notice */}
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 text-xs text-violet-300/80">
              <span className="font-semibold">Mock SSO: </span>
              {t(
                "Simulates corporate SSO authentication. No real credentials stored.",
                "Mensimulasikan autentikasi SSO korporat. Tidak ada kredensial nyata yang disimpan."
              )}
            </div>

            <button
              id="admin-sso-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("Redirecting to SSO...", "Mengarahkan ke SSO...")}
                </>
              ) : (
                <>
                  {t("Sign In with SSO", "Masuk dengan SSO")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="px-8 pb-7">
            <button
              id="admin-demo-toggle"
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors border border-slate-700/60 rounded-xl px-4 py-3 bg-slate-800/40"
            >
              <span>{t("Demo Accounts (POC)", "Akun Demo (POC)")}</span>
              {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemo && (
              <div className="mt-3 space-y-2">
                {MOCK_ADMIN_USERS.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => fillDemo(user.email)}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:border-violet-500/40 hover:bg-slate-800/70 transition-all text-left group"
                  >
                    <div>
                      <p className="text-slate-200 text-xs font-semibold group-hover:text-white transition-colors">
                        {user.name}
                      </p>
                      <p className="text-violet-400 text-[10px] mt-0.5">{user.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-[10px] font-mono">{user.id}</p>
                      <p className="text-violet-500/70 text-[10px] mt-0.5 group-hover:text-violet-400 transition-colors">
                        {t("Click to fill →", "Klik untuk isi →")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-5 text-slate-500 text-xs">
          {t("Not a bank employee?", "Bukan karyawan bank?")}{" "}
          <a href="/employee/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            {t("Go to Employee Portal →", "Ke Portal Karyawan →")}
          </a>
        </p>
      </div>
    </div>
  );
}
