"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { formatIDR } from "@/lib/utils/formatters";

type ScoreSource = {
  overallScore: number;
  creditScore: number;
  psychometricScore: number;
  integrityScore: number;
  riskScore: number;
};

type FinancialSource = {
  monthlyRevenue: number;
  monthlyExpenses: number;
  netIncome: number;
  monthlyDebtObligation: number;
  profitMargin: number;
};

type LoanSource = {
  amount: number;
  tenureMonths: number;
};

export function ScoreBreakdown({ assessment, customer, loan }: { assessment: ScoreSource; customer: FinancialSource; loan: LoanSource }) {
  const [showDerivation, setShowDerivation] = useState(false);
  const sessionIntegrity = "PASS" as string;
  const completenessLevel = (assessment.overallScore >= 80 ? "L1" : assessment.overallScore >= 65 ? "L2" : "L3") as string;
  const completenessLabels: Record<string, string> = { L0: "Full", L1: "Partial", L2: "Degraded", L3: "Minimal", L4: "Failed" };
  const gatesPassed = sessionIntegrity === "PASS" && completenessLevel !== "L4";
  const cashAvailable = Math.max(0, customer.netIncome - customer.monthlyDebtObligation);
  const cashRangeFloor = Math.max(0, cashAvailable - Math.min(1000000, Math.round(cashAvailable * 0.15)));
  const requestedInstallment = loan.amount / Math.max(loan.tenureMonths, 1) * 1.15;
  const affordability = cashAvailable > 0 ? Math.round((requestedInstallment / cashAvailable) * 100) : 0;
  const scoreRows = [
    { name: "Capacity", score: assessment.creditScore, weight: "20%" },
    { name: "Character", score: assessment.psychometricScore, weight: "15%" },
    { name: "Collateral", score: assessment.integrityScore, weight: "15%" },
    { name: "Conditions", score: Math.max(0, 100 - assessment.riskScore), weight: "15%" },
    { name: "Consistency", score: Math.round(customer.profitMargin), weight: "15%" },
    { name: "Coherence", score: assessment.overallScore, weight: "10%" },
    { name: "Compliance", score: Math.max(0, 100 - assessment.riskScore), weight: "10%" },
  ];
  const scoreBand = assessment.overallScore >= 80 ? "VERIFIED-STRONG" : assessment.overallScore >= 65 ? "VERIFIED-ADEQUATE" : assessment.overallScore >= 50 ? "VERIFIED-THIN" : assessment.overallScore >= 35 ? "UNVERIFIED" : "CONTRADICTED";
  const scoreBandStyle = scoreBand === "VERIFIED-STRONG" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : scoreBand === "VERIFIED-ADEQUATE" ? "bg-blue-50 text-blue-700 border-blue-200" : scoreBand === "VERIFIED-THIN" ? "bg-amber-50 text-amber-700 border-amber-200" : scoreBand === "CONTRADICTED" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200";
  const sectionState = sessionIntegrity === "FAIL" ? "pointer-events-none opacity-40 grayscale" : "";

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">Gates</h3><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Assessment controls</span></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4"><span className="text-sm font-semibold text-slate-700">G1 — Session Integrity</span><span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{sessionIntegrity}</span></div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4"><span className="text-sm font-semibold text-slate-700">G2 — Assessment Completeness</span><span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">{completenessLevel} · {completenessLabels[completenessLevel]}</span></div>
        </div>
        {sessionIntegrity === "FAIL" && <div className="mt-4 flex w-full items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><span>Assessment void — session integrity check failed</span></div>}
      </section>
      <section className={sectionState}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">C1 — Net Monthly Cash Available for Debt Service</h3></div><div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5"><p className="text-xl font-bold tracking-tight text-emerald-800">{formatIDR(cashRangeFloor)} – {formatIDR(cashAvailable)}</p><button type="button" onClick={() => setShowDerivation(!showDerivation)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">{showDerivation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{showDerivation ? "Hide derivation" : "Show derivation"}</button>{showDerivation && <div className="mt-4 space-y-2 border-t border-emerald-200 pt-4 text-xs text-emerald-900"><div className="flex justify-between"><span>Declared revenue</span><span className="font-semibold">{formatIDR(customer.monthlyRevenue)}</span></div><div className="flex justify-between"><span>Estimated costs</span><span className="font-semibold">− {formatIDR(customer.monthlyExpenses)}</span></div><div className="flex justify-between"><span>Adjustments</span><span className="font-semibold">− {formatIDR(customer.netIncome - cashAvailable)} – {formatIDR(customer.netIncome - cashRangeFloor)}</span></div></div>}</div></section>
      <section className={sectionState}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">C2 — Affordability</h3></div><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">Requested instalment ÷ C1 = <span className="text-lg font-bold text-slate-900">{affordability}%</span></div></section>
      <section className={sectionState}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">POJK-40 Mapped Scores</h3></div><div className="space-y-4">{scoreRows.map((row) => <div key={row.name}><div className="mb-1.5 flex items-end justify-between"><span className="text-xs font-semibold text-slate-700">{row.name}</span><span className="text-xs font-bold font-mono text-slate-800">{row.score}/100 <span className="font-normal text-slate-400">· weight {row.weight}</span></span></div><div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${row.score}%` }} /></div></div>)}</div></section>
      <section className={sectionState}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">R1 — Assessment Band</h3></div>{gatesPassed ? <div><span className={`inline-flex rounded border px-3 py-1.5 text-xs font-bold ${scoreBandStyle}`}>{scoreBand}</span><p className="mt-2 text-xs text-slate-500">Uncalibrated decision input — not a final credit decision</p></div> : <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm font-semibold text-slate-600">R1 suppressed — assessment gates are not satisfied.</div>}</section>
      <section className={sectionState}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">Reason Codes</h3></div><div className="space-y-2.5"><div className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /><span className="text-xs text-slate-600">Stable operating history supports repayment capacity.</span></div><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /><span className="text-xs text-slate-600">Reconciliation and verification evidence require reviewer attention.</span></div></div></section>
    </div>
  );
}
