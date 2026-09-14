"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, QrCode, User, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { signupSchema, type SignupFormData } from "@/lib/validations/loanSchema";

// Generate consistent QR code pattern
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

export function SignupForm() {
  const { signup, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    await signup(data);
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = getPasswordStrength(password || "");

  return (
    // ============================================
    // MAIN WRAPPER WITH 3-LAYER DEPTH SYSTEM
    // ============================================
    <div className="relative h-screen w-full flex items-center justify-center bg-[#FAFAFA] overflow-hidden p-4">

      {/* ============================================ */}
      {/* LAYER 1: AMBIENT BLURRED ORBS */}
      {/* ============================================ */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gray-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gray-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000" />

      {/* ============================================ */}
      {/* LAYER 2: HIGH-END TECHNICAL GRID WITH RADIAL FADE */}
      {/* ============================================ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
        }}
      />

      {/* ============================================ */}
      {/* LAYER 3: GLASS CONTAINER - FIXED HEIGHT, NO SCROLL */}
      {/* ============================================ */}
      <div className="relative z-10 w-full max-w-[1000px] h-[620px] p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] lg:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row h-full">

          {/* Inner Glass Reflection */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/40 to-transparent rounded-[2rem] lg:rounded-[3rem]" />

          {/* ============ LEFT COLUMN: Create Account Form ============ */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-black tracking-tight">
                Create Account
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Join Fintilla Portal today
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="name"
                  className="text-[10px] font-semibold text-[#6B7280] tracking-[0.1em] uppercase"
                >
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="John Doe"
                    error={errors.name?.message}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg text-black placeholder:text-[#9CA3AF] transition-all duration-200 outline-none"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-[#EF4444] mt-0.5">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-[10px] font-semibold text-[#6B7280] tracking-[0.1em] uppercase"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg text-black placeholder:text-[#9CA3AF] transition-all duration-200 outline-none"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#EF4444] mt-0.5">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-[10px] font-semibold text-[#6B7280] tracking-[0.1em] uppercase"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    error={errors.password?.message}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg text-black placeholder:text-[#9CA3AF] transition-all duration-200 outline-none pr-12"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && password.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(strength.score / 4) * 100}%`,
                            backgroundColor: strength.color
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-medium" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[9px] text-[#9CA3AF]">
                      <span className={`flex items-center gap-0.5 ${password.length >= 8 ? 'text-[#10B981]' : ''}`}>
                        <CheckCircle2 className={`w-2 h-2 ${password.length >= 8 ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`} strokeWidth={2} />
                        8+ chars
                      </span>
                      <span className={`flex items-center gap-0.5 ${/[A-Z]/.test(password) ? 'text-[#10B981]' : ''}`}>
                        <CheckCircle2 className={`w-2 h-2 ${/[A-Z]/.test(password) ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`} strokeWidth={2} />
                        Uppercase
                      </span>
                      <span className={`flex items-center gap-0.5 ${/[0-9]/.test(password) ? 'text-[#10B981]' : ''}`}>
                        <CheckCircle2 className={`w-2 h-2 ${/[0-9]/.test(password) ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`} strokeWidth={2} />
                        Number
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-[#EF4444] mt-0.5">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-semibold text-[#6B7280] tracking-[0.1em] uppercase"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword?.message}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-black focus:ring-2 focus:ring-black/5 rounded-lg text-black placeholder:text-[#9CA3AF] transition-all duration-200 outline-none pr-12"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[#EF4444] mt-0.5">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-2.5 bg-black hover:bg-[#1A1A1A] active:scale-[0.98] rounded-lg text-white font-medium transition-all duration-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_35px_-8px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed group mt-1"
                loading={loading || isSubmitting}
                disabled={loading || isSubmitting}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading || isSubmitting ? "Creating account..." : "Create Account"}
                  {!(loading || isSubmitting) && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2} />
                  )}
                </span>
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-[#6B7280]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-black hover:text-[#6B7280] transition-colors inline-flex items-center gap-1 group"
                >
                  Sign in
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </p>
            </div>

            {/* Trust Badge */}
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                256-bit SSL
              </span>
              <span className="w-px h-3 bg-[#E5E7EB]" />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                Secure Registration
              </span>
            </div>
          </div>

          {/* ============ RIGHT COLUMN: Black Phone & QR (HIDDEN ON MOBILE) ============ */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-gray-50/50 items-center justify-center p-6 border-l border-gray-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#E5E5E5_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

            {/* Outer Phone Bezel (Matte Black) */}
            <div className="relative w-[270px] h-[520px] bg-[#111111] rounded-[3rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.5)] border border-gray-800 flex flex-col">

              {/* Dynamic Island Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]" />

              {/* Inner Phone Screen (Pure White) */}
              <div className="bg-white w-full h-full rounded-[2.2rem] overflow-hidden flex flex-col items-center justify-between pt-14 pb-4 px-3 relative">

                {/* TOP HALF: QR Code Section */}
                <div className="flex flex-col items-center w-full flex-1 justify-center">
                  <div className="w-32 h-32 bg-black rounded-2xl flex items-center justify-center relative overflow-hidden p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute inset-2.5 grid grid-cols-5 gap-0.5">
                        {QR_PATTERN.map((filled, i) => (
                          <div
                            key={i}
                            className={`rounded-[1px] transition-all duration-300 ${filled ? 'bg-white' : 'bg-transparent'
                              }`}
                            style={{
                              opacity: filled ? (i % 3 === 0 ? 0.7 : 1) : 0,
                            }}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-[30%] bg-black rounded-md" />
                      <QrCode className="w-8 h-8 text-white opacity-90" strokeWidth={1} />

                      {/* Scanning Laser Animation */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute left-0 right-0 h-[2px] bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-scan">
                          <div className="absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-white/20 to-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] text-gray-400 font-medium uppercase tracking-[0.15em]">
                    Scan to Auth
                  </p>
                </div>

                {/* BOTTOM HALF: Profile Card */}
                <div className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer group">
                  <div className="w-10 h-10 rounded-full border border-gray-200 text-black flex items-center justify-center mx-auto mb-2 transition-colors group-hover:border-gray-400">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xs font-bold text-black text-center m-0">John Doe</h3>
                  <span className="text-[10px] text-gray-500 text-center block">CEO of Fintilla</span>

                  <div className="w-full h-px bg-gray-100 my-2"></div>

                  <div className="flex justify-center gap-3 w-full">
                    <a href="#" className="text-gray-400 hover:text-black transition-colors duration-200" aria-label="GitHub">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-black transition-colors duration-200" aria-label="Twitter">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-black transition-colors duration-200" aria-label="LinkedIn">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
        </div>
      </div>

      {/* ============ CUSTOM ANIMATIONS ============ */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }

        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}