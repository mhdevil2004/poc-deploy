"use client";

import { User, Mail, Phone } from "lucide-react";
import type { ApplicationFormData } from "@/components/loans/types";

interface Step1Props {
  data: ApplicationFormData;
  onChange: (updates: Partial<ApplicationFormData>) => void;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
}

export function Step1Personal({ data, onChange, errors }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personal Details</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Tell us about yourself. These details help us identify your application.
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="applicantName"
              type="text"
              value={data.applicantName}
              onChange={(e) => onChange({ applicantName: e.target.value })}
              placeholder="Customer name"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                errors.applicantName
                  ? "border-red-300 focus:ring-red-100 bg-red-50/30"
                  : "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70"
              }`}
            />
          </div>
          {errors.applicantName && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.applicantName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="applicantEmail"
              type="email"
              value={data.applicantEmail}
              onChange={(e) => onChange({ applicantEmail: e.target.value })}
              placeholder="customer@example.com"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                errors.applicantEmail
                  ? "border-red-300 focus:ring-red-100 bg-red-50/30"
                  : "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70"
              }`}
            />
          </div>
          {errors.applicantEmail && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.applicantEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                errors.phone
                  ? "border-red-300 focus:ring-red-100 bg-red-50/30"
                  : "border-white focus:ring-blue-500/20 focus:border-blue-500/40 bg-white/70"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.phone}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            Used for application updates. Not shared externally.
          </p>
        </div>
      </div>
    </div>
  );
}
