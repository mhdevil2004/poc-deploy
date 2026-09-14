"use client";

import Link from "next/link";
import { AlertOctagon, ArrowRight, ShieldAlert, Search, Command } from "lucide-react";
import { EmployeeLayout } from "../../components/layout/EmployeeLayout";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { MOCK_ASSESSMENTS } from "../../mock/assessments";
import { useState } from "react";
import { useTranslation } from "@/i18n";
import { CheckCircle } from "lucide-react";

const ENGLISH_FLAG_TEXT: Record<string, string> = {
  "Eksposur Utang Tinggi": "High Debt Exposure",
  "Rasio Pembiayaan Kritis": "Critical Financing Ratio",
  "Peminjam Berulang": "Repeat Borrower",
};

function englishFlagText(value: string) {
  return ENGLISH_FLAG_TEXT[value] || value;
}

export default function ManualReviewQueuePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const queue = MOCK_ASSESSMENTS.filter(
    (a) => a.status === "Manual Review Required" || a.status === "Flagged"
  ).filter((a) => {
    const q = search.toLowerCase();
    return !q ||
      a.loanId.toLowerCase().includes(q) ||
      a.customerName.toLowerCase().includes(q) ||
      a.businessName.toLowerCase().includes(q);
  });

  return (
    <EmployeeLayout title={t('manualReview.title')} subtitle={t('manualReview.subtitle')}>
      <div className="mx-auto max-w-[1600px]">
      <section className="mb-7">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">Exception queue</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Manual review workspace</h1>
        <p className="mt-2 text-sm text-slate-500">Resolve flagged applications with focused risk context and clear next actions.</p>
      </section>
      <div className="mb-7 flex flex-col items-start justify-between gap-5 rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950">{queue.length} {t('manualReview.casesRequiringReview')}</p>
            <p className="mt-1 text-xs text-slate-500">{t('manualReview.casesRequiringReviewDesc')}</p>
          </div>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t('manualReview.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-20 text-sm font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm sm:flex"><Command className="h-3 w-3" /> K</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {queue.map((a) => (
          <div key={a.assessmentId} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`absolute top-0 left-0 w-full h-1 ${a.status === "Manual Review Required" ? "bg-red-500" : "bg-orange-500"}`} />
            
            <div className="flex-1 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="mb-1.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                    {a.loanId}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{a.customerName}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-600">{a.businessName} · {a.businessType}</p>
                </div>
                <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border ${a.overallScore >= 60 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {a.overallScore >= 60 ? "VERIFIED-THIN" : a.overallScore >= 35 ? "UNVERIFIED" : "CONTRADICTED"}
                </span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t('manualReview.systemRisk')}</span>
                  <RiskBadge level={a.riskLevel} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t('manualReview.redFlags')}</span>
                    <span className="flex items-center gap-1 font-semibold text-red-600">
                    <ShieldAlert className="w-3.5 h-3.5" /> {a.flags.length} {t('manualReview.active')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                  <span className="text-slate-500">{t('manualReview.mainReason')}</span>
                  <span className="max-w-[60%] truncate text-right font-semibold text-slate-800" title={a.flags[0]?.type || t('manualReview.lowOverallScore')}>
                    {englishFlagText(a.flags[0]?.type || t('manualReview.lowOverallScore'))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 transition-colors group-hover:bg-red-50">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {a.assessmentDate}
              </span>
              <Link
                href={`/employee/assessments/${a.loanId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {t('manualReview.startReview')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
        
        {queue.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">{t('manualReview.cleanQueue')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('manualReview.noAssessmentsReqReview')}</p>
          </div>
        )}
      </div>
      </div>
    </EmployeeLayout>
  );
}

