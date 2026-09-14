"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StepIndicator } from "@/components/loans/StepIndicator";
import { AgentPanel } from "@/components/loans/AgentPanel";
import { Step1Personal } from "@/components/loans/steps/Step1Personal";
import { Step2Financial } from "@/components/loans/steps/Step2Financial";
import { Step3LoanDetails } from "@/components/loans/steps/Step3LoanDetails";
import { Step4Review } from "@/components/loans/steps/Step4Review";
import { Step5Interview } from "@/components/loans/steps/Step5Interview";
import { Step5Confirm } from "@/components/loans/steps/Step5Confirm";
import { createLoan } from "@/lib/api/loanService";
import { sendAgentMessage, type ApplicationContext, type EligibilityData } from "@/lib/api/agentService";
import type { CreateLoanInput } from "@/types";
import type { ApplicationFormData } from "@/components/loans/types";

// ─── Steps metadata ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Personal", description: "Name & contact" },
  { id: 2, label: "Financial", description: "Income & employment" },
  { id: 3, label: "Loan", description: "Amount & tenure" },
  { id: 4, label: "Review", description: "Check eligibility" },
  { id: 5, label: "Interview", description: "Video verification" },
  { id: 6, label: "Confirm", description: "Submit application" },
];

// ─── Validation ────────────────────────────────────────────────────────────
type FieldErrors = Partial<Record<keyof ApplicationFormData, string>>;

function validateStep(step: number, data: ApplicationFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 1) {
    if (!data.applicantName.trim()) {
      errors.applicantName = "Full name is required";
    } else if (data.applicantName.trim().length < 2) {
      errors.applicantName = "Name must be at least 2 characters";
    }
    if (!data.applicantEmail.trim()) {
      errors.applicantEmail = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.applicantEmail)) {
      errors.applicantEmail = "Please enter a valid email address";
    }
    if (data.phone && !/^[\+\d\s\-\(\)]{7,20}$/.test(data.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  if (step === 2) {
    if (!data.employmentType) {
      errors.employmentType = "Please select your Business Type";
    }
    if (!data.monthlyIncome || data.monthlyIncome <= 0) {
      errors.monthlyIncome = "Monthly income must be greater than 0";
    }
  }

  if (step === 3) {
    if (!data.amount || data.amount <= 0) {
      errors.amount = "Loan amount must be greater than 0";
    } else if (data.amount > 1_000_000) {
      errors.amount = "Loan amount cannot exceed Rp 10.000.000";
    }
    if (!data.termMonths || data.termMonths <= 0) {
      errors.termMonths = "Loan tenure is required";
    } else if (data.termMonths > 84) {
      errors.termMonths = "Tenure cannot exceed 84 months";
    }
  }

  return errors;
}

// ─── Format Indian Rp ───────────────────────────────────────────────────
function formatIDR(n: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(n)}`;
}

function calculateEligibility(data: ApplicationFormData): EligibilityData {
  const amount = data.amount || 0;
  const termMonths = data.termMonths || 0;
  const monthlyIncome = data.monthlyIncome || 0;
  const obligations = data.existingObligations || 0;
  const businessScore: Record<string, number> = {
    Warung: 12,
    Tokokelontong: 10,
    Ojek: 8,
  };
  const monthlyPayment = termMonths > 0 ? amount / termMonths : amount;
  const availableIncome = Math.max(monthlyIncome - obligations, 0);
  const paymentRatio = availableIncome > 0 ? monthlyPayment / availableIncome : 1;
  const score =
    52 +
    (amount <= 500_000 ? 12 : amount <= 1_000_000 ? 6 : -8) +
    (termMonths <= 36 ? 10 : termMonths <= 60 ? 6 : 2) +
    (paymentRatio <= 0.35 ? 18 : paymentRatio <= 0.55 ? 8 : -12) +
    (businessScore[data.employmentType || ""] || 0);
  const eligible = score >= 70;
  const interestRate = score >= 85 ? 10.5 : score >= 70 ? 13.5 : 17.5;
  const estimatedMonthlyPayment = amount && termMonths ? amount / termMonths : 0;

  return {
    eligible,
    reason: eligible
      ? "Profile meets the credit core threshold for this loan request."
      : "Credit core score is below the current approval threshold.",
    requested_amount: amount,
    term_months: termMonths,
    interest_rate: interestRate,
    estimated_monthly_payment: estimatedMonthlyPayment,
    estimated_total_payment: estimatedMonthlyPayment * termMonths,
  };
}

// ─── SDK token decoder ─────────────────────────────────────────────────────
interface SDKUser {
  name?: string;
  email?: string;
  phone?: string;
  loan_amount?: number;
  term_months?: number;
}

function decodeSDKToken(token?: string | null): SDKUser | null {
  if (typeof window === "undefined") return null;
  try {
    const sdkToken = token || sessionStorage.getItem("Fintilla_sdk_token");
    if (!sdkToken) return null;
    const parts = sdkToken.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.user ?? null;
  } catch {
    return null;
  }
}

// ─── Success screen ────────────────────────────────────────────────────────
function SuccessScreen({
  loanId,
  amount,
  termMonths,
  onViewApplication,
}: {
  loanId: string;
  amount: number;
  termMonths: number;
  onViewApplication: () => void;
}) {
  // Notify partner bank of success via postMessage (iframe flow)
  useEffect(() => {
    try {
      window.parent.postMessage({ type: "Fintilla_SUCCESS", loanId }, "*");
    } catch {
      // not in iframe, ignore
    }
  }, [loanId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-10 px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 shadow-[0_0_0_8px_rgba(34,197,94,0.08)]">
        <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={1.5} />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Application Submitted Successfully
      </h1>
      <p className="text-slate-500 font-medium mb-8 max-w-md">
        Your loan application has been received and is now under review. You will be notified of any updates.
      </p>

      {/* Summary box */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 w-full max-w-sm text-left space-y-3 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Application ID</span>
          <span className="text-sm font-bold text-slate-900 font-mono">#{loanId}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white pt-3">
          <span className="text-sm text-slate-500">Requested Amount</span>
          <span className="text-sm font-bold text-slate-900">{formatIDR(amount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Tenure</span>
          <span className="text-sm font-bold text-slate-900">{termMonths} months</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6B7280]">Status</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Review
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onViewApplication}
        className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
      >
        View Application
      </button>
    </div>
  );
}

// ─── Main wizard page ──────────────────────────────────────────────────────
export default function LoanApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedLoan, setSubmittedLoan] = useState<{ id: string; amount: number; termMonths: number } | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const hasSubmitted = useRef(false);

  const [formData, setFormData] = useState<ApplicationFormData>({
    applicantName: "",
    applicantEmail: "",
    amount: undefined,
    termMonths: undefined,
    purpose: "",
    phone: "",
    employmentType: "",
    monthlyIncome: undefined,
    existingObligations: undefined,
  });

  // Pre-fill from SDK token on mount (partner-bank flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("sdk_token");
    if (urlToken) {
      sessionStorage.setItem("Fintilla_sdk_token", urlToken);
      window.history.replaceState(null, "", window.location.pathname);
    }

    const sdkUser = decodeSDKToken(urlToken);
    if (sdkUser) {
      setFormData((prev) => ({
        ...prev,
        applicantName: sdkUser.name || prev.applicantName,
        applicantEmail: sdkUser.email || prev.applicantEmail,
        phone: sdkUser.phone || prev.phone,
        amount: sdkUser.loan_amount || prev.amount,
        termMonths: sdkUser.term_months || prev.termMonths,
      }));
    }
  }, []);

  const updateFormData = useCallback((updates: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    setErrors((prev) => {
      const next = { ...prev };
      (Object.keys(updates) as (keyof ApplicationFormData)[]).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // Agent context derived from current form state
  const agentContext: ApplicationContext = {
    applicantName: formData.applicantName || undefined,
    loanAmount: formData.amount,
    termMonths: formData.termMonths,
    monthlyIncome: formData.monthlyIncome,
    employmentType: formData.employmentType || undefined,
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // ── Eligibility check ─────────────────────────────────────────────────────
  const checkEligibility = useCallback(async () => {
    if (!formData.amount || !formData.termMonths) return;
    setEligibilityLoading(true);
    try {
      const message = `Check eligibility for a loan of Rp ${formData.amount} for ${formData.termMonths} months.`;
      const res = await sendAgentMessage(message, undefined, agentContext);
      if (res.data && typeof res.data === "object" && "eligible" in res.data) {
        setEligibility(res.data as EligibilityData);
      } else {
        setEligibility(calculateEligibility(formData));
      }
    } catch {
      setEligibility(calculateEligibility(formData));
    } finally {
      setEligibilityLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.amount, formData.termMonths]);

  // ── Final submission ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (hasSubmitted.current || submitting) return; // prevent double submit
    if (!formData.applicantName || !formData.applicantEmail || !formData.amount || !formData.termMonths) {
      setSubmitError("Please complete all required fields before submitting.");
      return;
    }

    hasSubmitted.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const input: CreateLoanInput = {
        applicantName: formData.applicantName.trim(),
        applicantEmail: formData.applicantEmail.trim(),
        amount: formData.amount,
        termMonths: formData.termMonths,
        purpose: formData.purpose || undefined,
      };

      const loan = await createLoan(input);
      setSubmittedLoan({ id: loan.id, amount: loan.amount, termMonths: loan.termMonths });
    } catch (err: unknown) {
      hasSubmitted.current = false; // allow retry
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to submit your application. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [formData, submitting]);

  // ── Success screen ────────────────────────────────────────────────────────
  if (submittedLoan) {
    return (
      <DashboardLayout title="Application Submitted">
        <div className="max-w-2xl mx-auto">
          <SuccessScreen
            loanId={submittedLoan.id}
            amount={submittedLoan.amount}
            termMonths={submittedLoan.termMonths}
            onViewApplication={() => router.push(`/loans/${submittedLoan.id}`)}
          />
        </div>
      </DashboardLayout>
    );
  }

  // ── Wizard layout ─────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Loan Application"
      subtitle={`Step ${currentStep} of ${STEPS.length} — ${STEPS[currentStep - 1].description}`}
    >
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        {/* Step Indicator */}
        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 lg:p-8">
          {currentStep === 1 && (
            <Step1Personal data={formData} onChange={updateFormData} errors={errors} />
          )}
          {currentStep === 2 && (
            <Step2Financial data={formData} onChange={updateFormData} errors={errors} />
          )}
          {currentStep === 3 && (
            <Step3LoanDetails data={formData} onChange={updateFormData} errors={errors} />
          )}
          {currentStep === 4 && (
            <Step4Review
              data={formData}
              eligibility={eligibility}
              eligibilityLoading={eligibilityLoading}
              onCheckEligibility={checkEligibility}
            />
          )}
          {currentStep === 5 && (
            <Step5Interview onComplete={goNext} />
          )}
          {currentStep === 6 && (
            <Step5Confirm
              data={formData}
              eligibility={eligibility}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <p className="text-sm text-red-700 font-medium">{submitError}</p>
            </div>
          )}

          {/* Navigation buttons (hidden on steps 5 and 6) */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white bg-white/70 text-sm font-semibold text-slate-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                {currentStep === 4 ? "Review & Confirm" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Back button on step 6 */}
          {currentStep === 6 && (
            <div className="mt-6 pt-4 border-t border-white">
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                Go back and edit
              </button>
            </div>
          )}
        </div>

        {/* AI Assistant Panel — visible on steps 3, 4, 5 */}
        {currentStep >= 3 && (
          <AgentPanel appContext={agentContext} />
        )}
      </div>
    </DashboardLayout>
  );
}
