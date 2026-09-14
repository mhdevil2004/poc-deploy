"use client";

import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import type { ApplicationFormData } from "@/components/loans/types";
import type { EligibilityData } from "@/lib/api/agentService";
import { formatCurrency } from "@/lib/utils/formatters";

interface Step5Props {
  data: ApplicationFormData;
  eligibility: EligibilityData | null;
  submitting: boolean;
  onSubmit: () => void;
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white last:border-0">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-slate-900 text-base" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

export function Step5Confirm({ data, eligibility, submitting, onSubmit }: Step5Props) {
  const isEligible = eligibility?.eligible ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Confirm & Submit</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Please review your application summary before final submission.
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Application Summary
        </h3>

        <SummaryRow label="Applicant" value={data.applicantName || "—"} />
        <SummaryRow label="Email" value={data.applicantEmail || "—"} />
        {data.phone && <SummaryRow label="Phone" value={data.phone} />}
        <SummaryRow
          label="Requested Amount"
          value={data.amount ? formatCurrency(data.amount) : "—"}
          highlight
        />
        <SummaryRow
          label="Tenure"
          value={data.termMonths ? `${data.termMonths} months` : "—"}
        />

        {eligibility?.eligible && eligibility.interest_rate != null && (
          <SummaryRow
            label="Interest Rate"
            value={`${eligibility.interest_rate.toFixed(1)}% p.a.`}
          />
        )}

        {eligibility?.eligible && eligibility.estimated_monthly_payment != null && (
          <SummaryRow
            label="Estimated EMI"
            value={formatCurrency(eligibility.estimated_monthly_payment)}
            highlight
          />
        )}
      </div>

      {/* Eligibility badge */}
      {isEligible !== null && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
            isEligible
              ? "bg-emerald-50 border border-emerald-100"
              : "bg-red-50 border border-red-100"
          }`}
        >
          {isEligible ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-bold ${isEligible ? "text-green-800" : "text-red-800"}`}>
              {isEligible ? "Eligible" : "Not Eligible"}
            </p>
            {eligibility?.reason && (
              <p className={`text-xs ${isEligible ? "text-green-600" : "text-red-600"}`}>
                {eligibility.reason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Warning if eligibility not checked */}
      {isEligible === null && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            You haven&apos;t checked eligibility yet. You can still submit, but we recommend
            checking eligibility on the previous step first.
          </p>
        </div>
      )}

      {/* Legal notice */}
      <p className="text-xs text-slate-500 leading-relaxed">
        By submitting this application, you confirm that all information provided is accurate
        and complete. The bank reserves the right to verify the information and may request
        additional documentation.
      </p>

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        id="submit-application-btn"
        className="w-full flex items-center justify-center gap-3 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Application...
          </>
        ) : (
          "Submit Application"
        )}
      </button>
    </div>
  );
}
