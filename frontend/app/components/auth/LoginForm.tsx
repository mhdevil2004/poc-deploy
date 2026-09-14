"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, QrCode, User, Mail, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, LanguageToggle } from "@/i18n";
import type { LoginCredentials } from "@/types";

// ─── Demo Roles ──────────────────────────────────────────────────────────────

const DEMO_ROLES = [
  {
    key: "administrator",
    email: "admin@fintilla.id",
    password: "Admin@123",
  },
  {
    key: "loan_manager",
    email: "loan.manager@fintilla.id",
    password: "Manager@123",
  },
  {
    key: "risk_analyst",
    email: "risk.analyst@fintilla.id",
    password: "Analyst@123",
  },
  {
    key: "branch_manager",
    email: "branch.manager@fintilla.id",
    password: "Branch@123",
  },
  {
    key: "operations_officer",
    email: "ops.officer@fintilla.id",
    password: "Officer@123",
  },
  {
    key: "read_only_auditor",
    email: "auditor@fintilla.id",
    password: "Auditor@123",
  },
] as const;

// ─── QR Pattern ──────────────────────────────────────────────────────────────

const generateQRPattern = () => {
  const pattern = [];
  for (let i = 0; i < 25; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const isFilled = (row * 7 + col * 13) % 10 > 3;
    pattern.push(isFilled);
  }
  return pattern;
};
const QR_PATTERN = generateQRPattern();

// ─── Component ───────────────────────────────────────────────────────────────

export function LoginForm() {
  const { login, loading } = useAuth();
  const { t, language } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<typeof DEMO_ROLES[number]["key"]>("loan_manager");
  const [email, setEmail] = useState("loan.manager@fintilla.id");
  const [password, setPassword] = useState("Manager@123");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // When role changes, auto-fill credentials
  const handleRoleChange = (roleKey: typeof DEMO_ROLES[number]["key"]) => {
    setSelectedRole(roleKey);
    const demo = DEMO_ROLES.find((r) => r.key === roleKey);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
    setEmailError("");
    setPasswordError("");
  };

  const validate = (): boolean => {
    let valid = true;
    if (!email) {
      setEmailError(t("auth.emailAddress") + " is required");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!password || password.length < 6) {
      setPasswordError(t("auth.password") + " must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const credentials: LoginCredentials = { email: email.toLowerCase(), password };
    await login(credentials);
    setIsSubmitting(false);
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-[#FAFAFA] overflow-hidden p-4">

      {/* Ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gray-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gray-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 80%)",
        }}
      />

      {/* Language toggle — top right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-white shadow-sm" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[1000px] h-[640px] p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] lg:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row h-full">

          {/* Glass reflection */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/40 to-transparent rounded-[2rem] lg:rounded-[3rem]" />

          {/* ─── Left Column: Phone + QR ─────────────────────────────── */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-gray-50/50 items-center justify-center p-6 border-r border-gray-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#E5E5E5_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

            {/* Phone mockup */}
            <div className="relative w-[270px] h-[520px] bg-[#111111] rounded-[3rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.5)] border border-gray-800 flex flex-col">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]" />

              <div className="bg-white w-full h-full rounded-[2.2rem] overflow-hidden flex flex-col items-center justify-between pt-14 pb-4 px-3 relative">
                {/* QR Code */}
                <div className="flex flex-col items-center w-full flex-1 justify-center">
                  <div className="w-32 h-32 bg-black rounded-2xl flex items-center justify-center relative overflow-hidden p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute inset-2.5 grid grid-cols-5 gap-0.5">
                        {QR_PATTERN.map((filled, i) => (
                          <div
                            key={i}
                            className={`rounded-[1px] transition-all duration-300 ${filled ? "bg-white" : "bg-transparent"}`}
                            style={{ opacity: filled ? (i % 3 === 0 ? 0.7 : 1) : 0 }}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-[30%] bg-black rounded-md" />
                      <QrCode className="w-8 h-8 text-white opacity-90" strokeWidth={1} />
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute left-0 right-0 h-[2px] bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-scan">
                          <div className="absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-white/20 to-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] text-gray-400 font-medium uppercase tracking-[0.15em]">
                    {t("auth.scanToAuth")}
                  </p>
                </div>

                {/* Profile card */}
                <div className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer group transition-all duration-300">
                  <div className="w-10 h-10 rounded-full border border-gray-200 text-black flex items-center justify-center mx-auto mb-2 transition-colors group-hover:border-gray-400">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xs font-bold text-black text-center m-0">Fintilla</h3>
                  <span className="text-[10px] text-gray-500 text-center block">
                    {language === "id" ? "Selamat datang di Fintilla" : "Welcome to Fintilla"}
                  </span>
                  <div className="w-full h-px bg-gray-100 my-2" />
                  <div className="flex justify-center gap-3 w-full">
                    <a href="#" className="text-gray-400 hover:text-black transition-colors duration-200" aria-label="GitHub">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-black transition-colors duration-200" aria-label="Email">
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </a>
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-1 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Form ──────────────────────────────────── */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-black tracking-tight">
                {t("auth.welcomeBack")}
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">{t("auth.signInToBanking")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="role-select"
                  className="text-[10px] font-semibold text-[#6B7280] tracking-[0.1em] uppercase"
                >
                  {t("auth.role")}
                </label>
                <div className="relative">
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as typeof DEMO_ROLES[number]["key"])}
                    className="w-full px-4 py-3 pr-10 bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg text-black text-sm transition-all duration-200 outline-none appearance-none cursor-pointer"
                  >
                    {DEMO_ROLES.map((r) => (
                      <option key={r.key} value={r.key}>
                        {t(`roles.${r.key}` as Parameters<typeof t>[0])}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" strokeWidth={1.5} />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-semibold text-[#6B7280] tracking-[0.1em] uppercase"
                >
                  {t("auth.emailAddress")}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@fintilla.id"
                  error={emailError}
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg text-black placeholder:text-[#9CA3AF] transition-all duration-200 outline-none"
                />
                {emailError && <p className="text-xs text-[#EF4444] mt-1">{emailError}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-semibold text-[#6B7280] tracking-[0.1em] uppercase"
                  >
                    {t("auth.password")}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-black hover:text-[#6B7280] transition-colors"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    error={passwordError}
                    className="w-full px-4 py-3 bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg text-black placeholder:text-[#9CA3AF] transition-all duration-200 outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black transition-colors focus:outline-none"
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-[#EF4444] mt-1">{passwordError}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full py-3 bg-black hover:bg-[#1A1A1A] active:scale-[0.98] rounded-lg text-white font-medium transition-all duration-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_35px_-8px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed group"
                loading={loading || isSubmitting}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading || isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
                  {!(loading || isSubmitting) && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2} />
                  )}
                </span>
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-5 text-center">
              <p className="text-sm text-[#6B7280]">
                {t("auth.dontHaveAccount")}{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-black hover:text-[#6B7280] transition-colors inline-flex items-center gap-1 group"
                >
                  {t("auth.signUp")}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </p>
            </div>

            {/* Trust badge */}
            <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                256-bit SSL
              </span>
              <span className="w-px h-3 bg-[#E5E7EB]" />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                {t("auth.secureLogin")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes scan {
          0%   { transform: translateY(-100%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.1); }
          66%       { transform: translate(-20px, 30px) scale(0.9); }
        }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
        .animate-blob { animation: blob 10s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}