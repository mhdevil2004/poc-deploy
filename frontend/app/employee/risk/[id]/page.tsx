"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, ShieldAlert, X } from "lucide-react";
import { EmployeeLayout } from "../../components/layout/EmployeeLayout";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { MOCK_RISK_CASES } from "../../mock/riskCases";
import { MOCK_CUSTOMERS } from "../../mock/customers";
import { MOCK_LOANS } from "../../mock/loans";
import { ScoreBreakdown } from "../../components/risk/ScoreBreakdown";
import { RiskEvidenceCards } from "../../components/risk/RiskEvidenceCards";

export default function RiskCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const riskCase = MOCK_RISK_CASES.find((c) => c.caseId === id);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [auditMessage, setAuditMessage] = useState("");

  if (!riskCase) {
    return (
      <EmployeeLayout title="Case Not Found">
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">Risk case &quot;{id}&quot; was not found.</p>
          <Link href="/employee/risk" className="text-blue-600 text-sm font-semibold mt-3 inline-block">
            ← Back to Risk Analysis
          </Link>
        </div>
      </EmployeeLayout>
    );
  }

  const customer = MOCK_CUSTOMERS.find((item) => item.customerId === riskCase.customerId) || MOCK_CUSTOMERS[0];
  const loan = MOCK_LOANS.find((item) => item.loanId === riskCase.loanId) || MOCK_LOANS[0];
  const reviewReason = riskCase.status === "Escalated" ? "Completeness L3 — Contradicted revenue reconciliation." : "Completeness L3 — Contradicted revenue reconciliation.";

  return (
    <EmployeeLayout title={riskCase.caseId} subtitle={`Risk analysis case for loan ${riskCase.loanId}`}>
      <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link href="/employee/risk" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Risk Analysis
        </Link>
        <span className="inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">Risk case detail</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{riskCase.caseId}</h2>
                <p className="text-sm text-slate-500 mt-0.5">Created {riskCase.createdAt} · Updated {riskCase.updatedAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={riskCase.riskLevel} />
                <StatusBadge status={riskCase.status} />
              </div>
            </div>
            <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Flagged: {reviewReason}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Case ID</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{riskCase.caseId}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Loan Reference</p>
                <Link href={`/employee/assessments/${riskCase.loanId}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 mt-0.5 block">{riskCase.loanId}</Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Fintilla Band</p>
                <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 mt-0.5 rounded border ${riskCase.overallScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : riskCase.overallScore >= 65 ? "bg-blue-50 text-blue-700 border-blue-200" : riskCase.overallScore >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" : riskCase.overallScore >= 35 ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {riskCase.overallScore >= 80 ? "VERIFIED-STRONG" : riskCase.overallScore >= 65 ? "VERIFIED-ADEQUATE" : riskCase.overallScore >= 50 ? "VERIFIED-THIN" : riskCase.overallScore >= 35 ? "UNVERIFIED" : "CONTRADICTED"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Customer ID</p>
                <Link href={`/employee/customers/${riskCase.customerId}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 mt-0.5 block">{riskCase.customerId}</Link>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Score Breakdown
            </h3>
            <ScoreBreakdown assessment={riskCase} customer={customer} loan={loan} />
          </div>

          {/* Risk Flags */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-slate-900">Risk Flags</h3>
            </div>
            <RiskEvidenceCards source={customer} summaryOnly />
            <Link href={`/employee/assessments/${riskCase.loanId}?tab=risk`} className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700">View full breakdown →</Link>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Analyst Notes</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{riskCase.notes}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Business & Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {riskCase.businessName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{riskCase.businessName}</p>
                <p className="text-[10px] text-slate-500">{riskCase.businessType}</p>
                <Link href={`/employee/customers/${riskCase.customerId}`} className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1 inline-block">
                  {riskCase.customerName} →
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Assigned Analyst</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {riskCase.assignedAnalystName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{riskCase.assignedAnalystName}</p>
                <p className="text-[10px] text-slate-500">{riskCase.assignedAnalystId}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
                Update Status
              </button>
              <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                Add Note
              </button>
              <button onClick={() => setShowEscalationModal(true)} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                Escalate Case
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="escalation-title">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between"><div><h2 id="escalation-title" className="text-base font-bold text-slate-900">Escalate Case</h2><p className="mt-1 text-xs text-slate-500">Select a reason for the US-E20-05 audit log.</p></div><button type="button" onClick={() => setShowEscalationModal(false)} aria-label="Close escalation dialog"><X className="h-4 w-4 text-slate-500" /></button></div>
            <select value={escalationReason} onChange={(event) => setEscalationReason(event.target.value)} className="mt-5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              <option value="">Select escalation reason</option>
              <option>G1 integrity fail</option><option>Completeness L3–L4</option><option>Contradicted reconciliation</option><option>Archetype switch</option><option>Other</option>
            </select>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowEscalationModal(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">Cancel</button><button type="button" disabled={!escalationReason} onClick={() => { setAuditMessage(`Escalation recorded: ${escalationReason}`); setShowEscalationModal(false); }} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Confirm escalation</button></div>
          </div>
        </div>
      )}
      {auditMessage && <div className="fixed bottom-5 right-5 z-40 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">{auditMessage}</div>}
    </EmployeeLayout>
  );
}
