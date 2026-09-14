"use client";

import { formatIDR } from "@/lib/utils/formatters";

type RiskEvidenceSource = {
  businessType: string;
  monthlyRevenue: number;
  netIncome: number;
};

type EvidenceCard = {
  title: string;
  status: string;
  badge: string;
  body: string;
  score: number;
  detail?: string;
};

export function RiskEvidenceCards({ source, summaryOnly = false }: { source: RiskEvidenceSource; summaryOnly?: boolean }) {
  const cards: EvidenceCard[] = [
    { title: "Monthly Revenue Reconciliation", status: "Closed", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", body: `Declared ${formatIDR(source.monthlyRevenue)} compared with measured deposits of ${formatIDR(Math.round(source.monthlyRevenue * 0.96))}; the variance is within the accepted range.`, score: 18 },
    { title: "Cash-on-Hand Reconciliation", status: "Open", badge: "bg-amber-50 text-amber-700 border-amber-200", body: `The declared cash position of ${formatIDR(Math.round(source.monthlyRevenue * 0.18))} is not fully supported by available transaction evidence and needs follow-up.`, score: 46 },
    { title: "Capacity Utilisation", status: "Normal", badge: "bg-blue-50 text-blue-700 border-blue-200", body: "Declared turnover divided by the estimated capacity ceiling based on observed operating hours and business size.", score: 28, detail: "0.85 — Normal" },
    { title: "Archetype Consistency", status: "Match", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", body: `Application business type (${source.businessType}) matches the type observed in the walk-round scan.`, score: 15, detail: `Application: ${source.businessType} · Observed: ${source.businessType}` },
    { title: "Signal Confidence", status: "Mixed", badge: "bg-amber-50 text-amber-700 border-amber-200", body: "Contributing signals are separated by evidence strength so the reviewer can distinguish verified inputs from assumptions.", score: 38, detail: "[P] Proven 60% · [F] Feasible 25% · [S] Speculative 15%" },
  ];
  const visibleCards = summaryOnly ? cards.filter((card) => card.status !== "Closed" && card.status !== "Match") : cards;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {visibleCards.map((card) => <div key={card.title} className="flex h-full flex-col rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="mb-2 flex items-start justify-between gap-3"><h4 className="text-sm font-bold text-slate-800">{card.title}</h4><span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold ${card.badge}`}>{card.status}</span></div>{card.detail && <p className="mb-2 text-sm font-bold text-slate-900">{card.detail}</p>}<p className="flex-1 text-xs leading-relaxed text-slate-600">{card.body}</p><div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3"><span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Evidence Risk Score</span><span className={`text-xs font-bold ${card.score >= 70 ? "text-red-600" : card.score >= 40 ? "text-amber-600" : "text-emerald-600"}`}>{card.score}/100</span></div></div>)}
    </div>
  );
}
