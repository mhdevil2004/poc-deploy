"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, ShieldAlert, Filter, Command, AlertCircle, Clock3, CheckCircle2, Flame } from "lucide-react";
import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { RiskBadge } from "../components/ui/RiskBadge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MOCK_RISK_CASES } from "../mock/riskCases";
import type { RiskLevel, RiskCaseStatus } from "../types";
import { useTranslation } from "@/i18n";

const RISK_LEVELS: (RiskLevel | "All")[] = ["All", "Low", "Medium", "High", "Critical"];
const STATUSES: (RiskCaseStatus | "All")[] = ["All", "Open", "In Review", "Escalated", "Resolved", "Closed"];

function getCompletenessLevel(overallScore: number) {
  if (overallScore >= 90) return { level: "L0", label: "Full", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (overallScore >= 80) return { level: "L1", label: "Partial", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (overallScore >= 65) return { level: "L2", label: "Degraded", style: "bg-amber-50 text-amber-700 border-amber-200" };
  if (overallScore >= 50) return { level: "L3", label: "Minimal", style: "bg-amber-50 text-amber-700 border-amber-200" };
  return { level: "L4", label: "Failed", style: "bg-red-50 text-red-700 border-red-200" };
}

function getRiskReason(flags: string[], status: RiskCaseStatus) {
  if (flags.some((flag) => flag.toLowerCase().includes("integrity"))) return "G1 integrity fail";
  if (flags.some((flag) => flag.toLowerCase().includes("revenue") || flag.toLowerCase().includes("cash"))) return "Contradicted reconciliation";
  if (status === "Escalated") return "Archetype switched mid-session";
  return "Completeness L3/L4";
}

export default function RiskPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [statusFilter, setStatusFilter] = useState<RiskCaseStatus | "All">("All");

  const filtered = MOCK_RISK_CASES.filter((c) => {
    const matchSearch =
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseId.toLowerCase().includes(search.toLowerCase()) ||
      c.loanId.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "All" || c.riskLevel === riskFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchRisk && matchStatus;
  });
  const openCount = MOCK_RISK_CASES.filter(c => c.status === "Open").length;
  const reviewCount = MOCK_RISK_CASES.filter(c => c.status === "In Review").length;
  const escalatedCount = MOCK_RISK_CASES.filter(c => c.status === "Escalated").length;
  const resolvedCount = MOCK_RISK_CASES.filter(c => c.status === "Resolved" || c.status === "Closed").length;

  return (
    <EmployeeLayout title={t('risk.title')} subtitle={t('risk.subtitle')}>
      <div className="mx-auto max-w-[1600px]">
      <section className="mb-7">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Risk operations</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Risk review workspace</h1>
        <p className="mt-2 text-sm text-slate-500">Prioritize exceptions, monitor escalation, and keep every case moving.</p>
      </section>
      {/* Stats Row */}
      <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('risk.openCases'), value: openCount, icon: AlertCircle, color: "bg-blue-50 text-blue-700" },
          { label: t('risk.underReview'), value: reviewCount, icon: Clock3, color: "bg-amber-50 text-amber-700" },
          { label: t('risk.escalated'), value: escalatedCount, icon: Flame, color: "bg-red-50 text-red-700" },
          { label: t('risk.resolved'), value: resolvedCount, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
            <p className="mt-5 text-2xl font-bold tabular-nums text-slate-950">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t('risk.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-20 text-sm font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm sm:flex"><Command className="h-3 w-3" /> K</span>
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {RISK_LEVELS.map((r) => <option key={r} value={r}>{r === "All" ? t('assessments.allRiskLevels') : r}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RiskCaseStatus | "All")}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? t('assessments.allStatuses') : s}</option>)}
          </select>
        </div>
        <p className="mt-3 ml-1 text-xs font-medium text-slate-500">
          {t('assessments.showing')} {filtered.length} {t('assessments.of')} {MOCK_RISK_CASES.length}
        </p>
      </div>

      {/* Confirm with product/PM whether this page should show only flagged cases (In Review/Escalated) as the manual-review queue per spec US-E20-06, or remain a broader risk-monitoring list including Open/Closed cases. If it's meant to be the queue, filter out Open/Closed rows into a separate 'All Assessments' view instead. */}
      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><ShieldAlert className="h-4 w-4" /></div><div><h2 className="text-base font-bold text-slate-950">{t('risk.title')}</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} cases match your current filters</p></div></div>
          <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('risk.caseId')}</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('risk.loanRef')}</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('risk.customerAndBusiness')}</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fintilla Band</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('assessments.risk')}</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">{t('risk.analyst')}</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('risk.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((rc) => {
                const band = rc.overallScore >= 80 ? "VERIFIED-STRONG" : rc.overallScore >= 65 ? "VERIFIED-ADEQUATE" : rc.overallScore >= 50 ? "VERIFIED-THIN" : rc.overallScore >= 35 ? "UNVERIFIED" : "CONTRADICTED";
                const bandStyle = band === "VERIFIED-STRONG" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : band === "VERIFIED-ADEQUATE" ? "bg-blue-50 text-blue-700 border-blue-200" : band === "VERIFIED-THIN" ? "bg-amber-50 text-amber-700 border-amber-200" : band === "UNVERIFIED" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-red-50 text-red-700 border-red-200";
                const completeness = getCompletenessLevel(rc.overallScore);
                const reason = getRiskReason(rc.flags, rc.status);
                const needsReason = rc.status === "In Review" || rc.status === "Escalated";

                return (
                <tr key={rc.caseId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-900 text-xs font-mono">{rc.caseId}</td>
                  <td className="px-4 py-3.5">
                    <Link href={`/employee/assessments/${rc.loanId}`} className="text-blue-600 hover:text-blue-700 text-xs font-mono font-semibold transition-colors">
                      {rc.loanId}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-800 font-semibold text-xs">{rc.customerName}</p>
                    <p className="text-slate-500 text-[10px]">{rc.businessName}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${bandStyle}`}>
                      {band}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${completeness.style}`}>
                      {completeness.level} · {completeness.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <RiskBadge level={rc.riskLevel} />
                  </td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <span className="text-xs text-slate-600">{rc.assignedAnalystName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <StatusBadge status={rc.status} />
                      {needsReason && (
                        <span title={reason} aria-label={`Reason: ${reason}`} className="cursor-help text-amber-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Link
                      href={`/employee/risk/${rc.caseId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      {t('common.open')} <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ); })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 text-sm">
                    {t('risk.noRiskCases')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </EmployeeLayout>
  );
}

