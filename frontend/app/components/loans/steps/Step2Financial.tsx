"use client";

import { Briefcase, TrendingDown } from "lucide-react";
import type { ApplicationFormData } from "@/components/loans/types";

interface Step2Props {
  data: ApplicationFormData;
  onChange: (updates: Partial<ApplicationFormData>) => void;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
}

const EMPLOYMENT_TYPES = [
  { value: "Warung", label: "Warung" },
  { value: "Tokokelontong", label: "Tokokelontong" },
  { value: "Ojek", label: "Ojek" },
];

export function Step2Financial({ data, onChange, errors }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Details</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Your income information helps us tailor loan recommendations. This data is used for agent context only.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Business Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none z-10" />
            <select
              id="employmentType"
              value={data.employmentType}
              onChange={(e) => onChange({ employmentType: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm appearance-none focus:outline-none focus:ring-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                errors.employmentType
                  ? "border-red-300 focus:ring-red-100 bg-red-50/30 text-red-900"
                  : data.employmentType
                  ? "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70 text-slate-900"
                  : "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70 text-slate-500"
              }`}
            >
              <option value="" disabled>Select business type</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {errors.employmentType && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.employmentType}</p>
          )}
        </div>

        {/* Monthly Income */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Monthly Income (Rp) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9CA3AF]">
              Rp
            </span>
            <input
              id="monthlyIncome"
              type="number"
              min={0}
              value={data.monthlyIncome || ""}
              onChange={(e) =>
                onChange({ monthlyIncome: e.target.value ? parseFloat(e.target.value) : undefined })
              }
              placeholder="60000"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                errors.monthlyIncome
                  ? "border-red-300 focus:ring-red-100 bg-red-50/30"
                  : "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70"
              }`}
            />
          </div>
          {errors.monthlyIncome && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.monthlyIncome}</p>
          )}
        </div>

        {/* Existing Monthly Obligations */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Existing Monthly Obligations (Rp)
          </label>
          <div className="relative">
            <TrendingDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="existingObligations"
              type="number"
              min={0}
              value={data.existingObligations || ""}
              onChange={(e) =>
                onChange({ existingObligations: e.target.value ? parseFloat(e.target.value) : undefined })
              }
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white focus:border-blue-500/40 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            />
          </div>
          <p className="mt-1.5 text-xs text-[#9CA3AF]">
            EMIs, rent, or other fixed monthly outgoings. Enter 0 if none.
          </p>
        </div>
      </div>

      {/* Info callout */}
      <div className="bg-blue-50/80 border border-blue-100 rounded-2xl px-4 py-3 flex gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <span className="text-blue-500 text-lg leading-none mt-0.5">ℹ</span>
        <p className="text-xs text-blue-700 leading-relaxed">
          Your financial details are used to provide personalized loan recommendations via our AI
          assistant. They are <strong>not stored</strong> in the loan application database.
        </p>
      </div>
    </div>
  );
}
