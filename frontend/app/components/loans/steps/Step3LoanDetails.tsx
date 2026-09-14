"use client";

import { Calendar, FileText } from "lucide-react";
import type { ApplicationFormData } from "@/components/loans/types";

interface Step3Props {
  data: ApplicationFormData;
  onChange: (updates: Partial<ApplicationFormData>) => void;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
}

const TENURE_OPTIONS = [6, 12, 18, 24, 36, 48, 60, 72, 84];

export function Step3LoanDetails({ data, onChange, errors }: Step3Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Loan Details</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Specify the loan amount, tenure, and purpose for your application.
        </p>
      </div>

      <div className="space-y-4">
        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Requested Loan Amount (Rp) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9CA3AF]">
              Rp
            </span>
            <input
              id="amount"
              type="number"
              min={1}
              max={1000000}
              value={data.amount || ""}
              onChange={(e) =>
                onChange({ amount: e.target.value ? parseFloat(e.target.value) : undefined })
              }
              placeholder="500000"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                errors.amount
                  ? "border-red-300 focus:ring-red-100 bg-red-50/30"
                  : "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70"
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.amount}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            Maximum: Rp 10.000.000. Minimum: Rp 1.
          </p>
        </div>

        {/* Loan Tenure */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Loan Tenure <span className="text-red-500">*</span>
          </label>

          {/* Quick-select pills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {TENURE_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ termMonths: t })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  data.termMonths === t
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                    : "bg-white/70 text-slate-600 border-white hover:border-blue-200 hover:text-slate-900"
                }`}
              >
                {t} mo
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="termMonths"
              type="number"
              min={1}
              max={84}
              value={data.termMonths || ""}
              onChange={(e) =>
                onChange({ termMonths: e.target.value ? parseInt(e.target.value) : undefined })
              }
              placeholder="Custom (1–84 months)"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                errors.termMonths
                  ? "border-red-300 focus:ring-red-100 bg-red-50/30"
                  : "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70"
              }`}
            />
          </div>
          {errors.termMonths && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.termMonths}</p>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9CA3AF]" />
              Loan Purpose (optional)
            </span>
          </label>
          <textarea
            id="purpose"
            rows={3}
            value={data.purpose}
            onChange={(e) => onChange({ purpose: e.target.value })}
            placeholder="e.g. Home renovation, vehicle purchase, education..."
            className="w-full px-4 py-3 rounded-2xl border border-white focus:border-blue-500/40 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white/70 resize-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          />
        </div>
      </div>
    </div>
  );
}
