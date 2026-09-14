"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Landmark,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// ── Mock OTP config ────────────────────────────────────────────────────────
// POC only — in production, real TOTP/SMS OTP from backend
const MOCK_OTP = "246810";
const OTP_LENGTH = 6;
const MFA_PENDING_KEY = "employee_mfa_pending";

export default function EmployeeMFAPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Guard: if no pending MFA session, redirect to login
  useEffect(() => {
    const pending = sessionStorage.getItem(MFA_PENDING_KEY);
    if (!pending) {
      router.replace("/employee/login");
    }
  }, [router]);

  const handleInput = (idx: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = char;
    setOtp(next);
    setError(null);
    if (char && idx < OTP_LENGTH - 1) {
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next);
    // Focus last filled or last box
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError(null);
    // Simulate verification delay
    await new Promise((r) => setTimeout(r, 900));

    if (code === MOCK_OTP) {
      setVerified(true);
      // Clear MFA pending flag
      sessionStorage.removeItem(MFA_PENDING_KEY);
      // Brief success animation then redirect
      await new Promise((r) => setTimeout(r, 700));
      router.push("/employee/dashboard");
    } else {
      setLoading(false);
      setError("Invalid code. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  }, [otp, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-900 overflow-hidden px-4">
      {/* Ambient orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-md z-10">
        <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/25 border-b border-slate-700/50 px-8 py-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-extrabold text-xl tracking-tight leading-tight">Fintilla</p>
                <p className="text-blue-300/80 text-[10px] font-bold tracking-[0.2em] uppercase leading-tight">Bank Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <KeyRound className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Two-Factor Authentication</h1>
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>

          <div className="px-8 py-7 space-y-6">

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Credentials verified</span>
              </div>
              <div className="h-px w-8 bg-slate-600" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-blue-400">2</span>
                </div>
                <span className="text-[11px] text-blue-400 font-semibold">MFA verification</span>
              </div>
              <div className="h-px w-8 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-slate-500">3</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">Dashboard</span>
              </div>
            </div>

            {/* OTP inputs */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-4 text-center">
                Verification Code
              </label>
              <div
                className="flex gap-2.5 justify-center"
                onPaste={handlePaste}
                onKeyPress={handleKeyPress}
              >
                {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleInput(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={verified}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-slate-900/70 text-white focus:outline-none transition-all
                      ${verified
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
                        : error
                        ? "border-red-500/60 focus:border-red-500"
                        : otp[idx]
                        ? "border-blue-500/70 bg-blue-500/10"
                        : "border-slate-600/60 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
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

            {/* Mock OTP hint */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-center">
              <p className="text-[11px] text-blue-300/70 font-medium">Mock OTP for prototype:</p>
              <p className="text-2xl font-mono font-bold text-blue-300 tracking-[0.4em] mt-1 select-all">
                {MOCK_OTP}
              </p>
            </div>

            {/* Verify button */}
            <button
              id="employee-mfa-verify-btn"
              onClick={handleVerify}
              disabled={loading || verified || otp.join("").length < OTP_LENGTH}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {verified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Verified! Entering Dashboard…
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify & Enter Portal"
              )}
            </button>

            {/* Back button */}
            <button
              onClick={() => router.push("/employee/login")}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
