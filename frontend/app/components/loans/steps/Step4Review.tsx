"use client";

import { CheckCircle2, XCircle, Loader2, TrendingUp } from "lucide-react";
import type { ApplicationFormData } from "@/components/loans/types";
import type { EligibilityData } from "@/lib/api/agentService";
import { formatCurrency } from "@/lib/utils/formatters";

interface Step4Props {
  data: ApplicationFormData;
  eligibility: EligibilityData | null;
  eligibilityLoading: boolean;
  onCheckEligibility: () => void;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white last:border-0">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function Step4Review({ data, eligibility, eligibilityLoading, onCheckEligibility }: Step4Props) {
  const employmentLabel: Record<string, string> = {
    Warung: "Warung",
    Tokokelontong: "Tokokelontong",
    Ojek: "Ojek",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review Your Application</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Review all details and check your eligibility before submitting.
        </p>
      </div>

      {/* Applicant Summary */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Applicant
        </h3>
        <ReviewRow label="Full Name" value={data.applicantName || "—"} />
        <ReviewRow label="Email" value={data.applicantEmail || "—"} />
        {data.phone && <ReviewRow label="Phone" value={data.phone} />}
      </div>

      {/* Financial Summary */}
      {(data.employmentType || data.monthlyIncome) && (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Financial Profile
          </h3>
          {data.employmentType && (
            <ReviewRow
              label="Employment"
              value={employmentLabel[data.employmentType] || data.employmentType}
            />
          )}
          {data.monthlyIncome && (
            <ReviewRow
              label="Monthly Income"
              value={formatCurrency(data.monthlyIncome)}
            />
          )}
          {data.existingObligations != null && (
            <ReviewRow
              label="Monthly Obligations"
              value={formatCurrency(data.existingObligations)}
            />
          )}
        </div>
      )}

      {/* Loan Summary */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Loan Request
        </h3>
        <ReviewRow
          label="Requested Amount"
          value={data.amount ? formatCurrency(data.amount) : "—"}
        />
        <ReviewRow
          label="Tenure"
          value={data.termMonths ? `${data.termMonths} months` : "—"}
        />
        {data.purpose && <ReviewRow label="Purpose" value={data.purpose} />}
      </div>

      {/* Eligibility Result / Check Button */}
      {eligibility ? (
        <div
          className={`rounded-2xl p-5 border ${
            eligibility.eligible
              ? "bg-emerald-50/80 border-emerald-100"
              : "bg-red-50/80 border-red-100"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {eligibility.eligible ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-bold ${eligibility.eligible ? "text-green-800" : "text-red-800"}`}>
                {eligibility.eligible ? "Eligible for this loan" : "Not eligible"}
              </p>
              <p className={`text-xs mt-0.5 ${eligibility.eligible ? "text-green-600" : "text-red-600"}`}>
                {eligibility.reason}
              </p>
            </div>
          </div>

          {eligibility.eligible && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Interest Rate",
                  value: `${eligibility.interest_rate?.toFixed(1)}% p.a.`,
                },
                {
                  label: "Est. Monthly EMI",
                  value: eligibility.estimated_monthly_payment
                    ? formatCurrency(eligibility.estimated_monthly_payment)
                    : "—",
                },
                {
                  label: "Total Payable",
                  value: eligibility.estimated_total_payment
                    ? formatCurrency(eligibility.estimated_total_payment)
                    : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/70 rounded-2xl p-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <p className="text-xs text-green-700 font-medium mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-green-900">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onCheckEligibility}
          disabled={eligibilityLoading || !data.amount || !data.termMonths}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-dashed border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-50/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {eligibilityLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking eligibility...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Check My Eligibility
            </>
          )}
        </button>
      )}
    </div>
  );
}
