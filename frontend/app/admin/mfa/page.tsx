"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Landmark, ShieldCheck, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { verifyMockMFA, MOCK_OTP, MOCK_OTP_LENGTH } from "../../admin-lib/mfa";
import { getPendingSSOUserId, saveAdminSession } from "../../admin-lib/auth";
import { useTranslation } from "@/i18n";

export default function AdminMFAPage() {
  const router = useRouter();
  const { language } = useTranslation();
  const [otp, setOtp] = useState<string[]>(Array(MOCK_OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If there's no pending SSO userId, redirect to login
  useEffect(() => {
    const pendingId = getPendingSSOUserId();
    if (!pendingId) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleInput = (idx: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = char;
    setOtp(next);
    setError(null);
    if (char && idx < MOCK_OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, MOCK_OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next);
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < MOCK_OTP_LENGTH) {
      setError(language === "en" ? "Please enter all 6 digits." : "Harap masukkan semua 6 digit.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await verifyMockMFA(code);
    if (result.success) {
      const userId = getPendingSSOUserId();
      if (userId) {
        const session = saveAdminSession(userId);
      }
      router.push("/admin/assessments");
    } else {
      setLoading(false);
      setError(result.error ?? (language === "en" ? "Invalid code." : "Kode tidak valid."));
      setOtp(Array(MOCK_OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden px-4">
      {/* Ambient */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-700/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />

      <div className="relative w-full max-w-md z-10">
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600/25 to-indigo-600/20 border-b border-slate-700/50 px-8 py-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">Fintilla</p>
                <p className="text-violet-300/80 text-xs font-medium tracking-widest uppercase leading-tight">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-violet-400" />
              <h1 className="text-xl font-bold text-white">
                {language === "en" ? "Two-Factor Authentication" : "Autentikasi Dua Faktor"}
              </h1>
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              {language === "en"
                ? "Enter the 6-digit code from your authenticator app."
                : "Masukkan kode 6 digit dari aplikasi autentikator Anda."}
            </p>
          </div>

          <div className="px-8 py-7 space-y-6">
            {/* OTP inputs */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-4 text-center">
                {language === "en" ? "Verification Code" : "Kode Verifikasi"}
              </label>
              <div className="flex gap-3 justify-center" onPaste={handlePaste} onKeyPress={handleKeyPress}>
                {Array.from({ length: MOCK_OTP_LENGTH }).map((_, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleInput(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-slate-800/70 text-white focus:outline-none transition-all ${
                      error
                        ? "border-red-500/60 focus:border-red-500"
                        : otp[idx]
                        ? "border-violet-500/70 bg-violet-500/10"
                        : "border-slate-600/60 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Demo hint */}
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 text-center">
              <p className="text-[11px] text-violet-300/70 font-medium">
                {language === "en" ? "Mock OTP for prototype:" : "OTP mock untuk prototipe:"}
              </p>
              <p className="text-2xl font-mono font-bold text-violet-300 tracking-[0.4em] mt-1 select-all">
                {MOCK_OTP}
              </p>
            </div>

            <button
              id="admin-mfa-verify-btn"
              onClick={handleVerify}
              disabled={loading || otp.join("").length < MOCK_OTP_LENGTH}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === "en" ? "Verifying..." : "Memverifikasi..."}
                </>
              ) : (
                language === "en" ? "Verify & Enter Portal" : "Verifikasi & Masuk Portal"
              )}
            </button>

            <button
              onClick={() => router.push("/admin/login")}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === "en" ? "Back to login" : "Kembali ke login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
