"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Calendar,
  IndianRupee,
  Clock,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Flag
} from "lucide-react";
import { EmployeeLayout } from "../../components/layout/EmployeeLayout";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { MOCK_LOANS } from "../../mock/loans";
import { formatIDR } from "@/lib/utils/formatters";
import { useRequireEmployeeAuth } from "../../hooks/useEmployeeAuth";
import toast from "react-hot-toast";
import { submitLoanDecision, type LoanDecisionAction } from "@/lib/api/assessmentService";
import type { LoanApplicationStatus } from "../../types";

// Derivation helper for Fintilla score band without numbers
function deriveBand(score: number): { name: string; style: string } {
  if (score >= 80) return { name: "VERIFIED-STRONG", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 65) return { name: "VERIFIED-ADEQUATE", style: "bg-blue-50 text-blue-700 border-blue-200" };
  if (score >= 50) return { name: "VERIFIED-THIN", style: "bg-amber-50 text-amber-700 border-amber-200" };
  if (score >= 35) return { name: "UNVERIFIED", style: "bg-slate-100 text-slate-600 border-slate-200" };
  return { name: "CONTRADICTED", style: "bg-red-50 text-red-700 border-red-200" };
}

function deriveCreditTier(score: number): { name: string; style: string } {
  if (score >= 720) return { name: "STRONG CREDIT", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 650) return { name: "ADEQUATE CREDIT", style: "bg-blue-50 text-blue-700 border-blue-200" };
  if (score >= 550) return { name: "THIN CREDIT", style: "bg-amber-50 text-amber-700 border-amber-200" };
  return { name: "UNVERIFIED CREDIT", style: "bg-red-50 text-red-700 border-red-200" };
}

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { employee } = useRequireEmployeeAuth();
  const loanData = MOCK_LOANS.find((l) => l.loanId === id);

  const [currentStatus, setCurrentStatus] = useState<string>(loanData?.status || "Under Review");
  const [decisionAction, setDecisionAction] = useState<"approve" | "decline" | "request-info" | "escalate" | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [r1Reviewed, setR1Reviewed] = useState(false);

  if (!loanData) {
    return (
      <EmployeeLayout title="Loan Not Found">
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">Loan &quot;{id}&quot; not found.</p>
          <Link href="/employee/lending" className="text-blue-600 text-sm font-semibold mt-3 inline-block">
            ← Back to Lending
          </Link>
        </div>
      </EmployeeLayout>
    );
  }

  const fintillaBand = deriveBand(loanData.overallScore || 70);
  const creditTier = deriveCreditTier(loanData.creditScore || 650);

  const role = employee?.role || "Read-Only Auditor";

  // Every decision is authorized and persisted by the API before the UI changes.
  const runDecision = async (action: LoanDecisionAction, message: string, status: string, extras: Record<string, unknown> = {}) => {
    try { await submitLoanDecision(loanData.loanId, { action, ...extras }); setCurrentStatus(status); toast.success(message); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save decision"); }
  };
  const confirmDecision = () => {
    if (!decisionAction || !decisionReason || (decisionAction === "approve" && !r1Reviewed)) return;
    const decision = decisionAction === "approve" ? { action: "APPROVE_DISBURSE" as const, message: "Approval recorded.", status: "Assessment Completed" } : decisionAction === "decline" ? { action: "REJECT_APPLICATION" as const, message: "Decline recorded.", status: "Rejected" } : { action: "FLAG_RISK_REVIEW" as const, message: decisionAction === "escalate" ? "Case escalated." : "Request for more information recorded.", status: "Manual Review Required" };
    void runDecision(decision.action, `${decision.message} Reason: ${decisionReason}`, decision.status, { notes: decisionReason });
    setDecisionAction(null);
    setDecisionReason("");
    setR1Reviewed(false);
  };

  return (
    <EmployeeLayout title={loanData.loanId} subtitle={`Loan application — ${loanData.businessName}`}>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/employee/lending" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Lending
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-xl text-xs font-bold font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Active Role: {role}
        </div>
      </div>

      {/* ── DYNAMIC ROLE-BASED ACTION PANEL ─────────────────────────────────── */}
      <div className="mb-6 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        {role === "Underwriter" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  UW
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Underwriter Decision Workflow</h3>
                  <p className="text-xs text-slate-500">Authorized to record a final decision after reviewing the Fintilla Band/R1</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Underwriter Privileges
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDecisionAction("approve")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>

              <button
                onClick={() => setDecisionAction("decline")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={() => setDecisionAction("request-info")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Request More Information
              </button>
              <button
                onClick={() => setDecisionAction("escalate")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Escalate
              </button>
            </div>
          </div>
        )}

        {role === "Risk Officer" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  RO
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Risk Officer Audit & Fraud Control</h3>
                  <p className="text-xs text-slate-500">Authorized to review evidence, request information, and escalate cases</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Risk Clearance Active
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDecisionAction("request-info")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Flag className="w-4 h-4" />
                Request More Information
              </button>

              <button
                onClick={() => setDecisionAction("escalate")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Flag className="w-4 h-4" />
                Escalate
              </button>
            </div>
          </div>
        )}

        {role === "Administrator" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  ADM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Viewing under Administrator Security Clearance</h3>
                  <p className="text-xs text-slate-500">Administrators can view and reassign operational ownership, but cannot make or override credit decisions.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                View Only for Underwriting
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => { const assigned_analyst = window.prompt("Assign to officer"); if (assigned_analyst) void runDecision("REASSIGN_OFFICER", "Officer assignment saved.", currentStatus, { assigned_analyst }); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                Reassign Officer
              </button>

            </div>
          </div>
        )}

        {role === "Read-Only Auditor" && (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Read-Only Compliance Mode Active</h4>
                <p className="text-[11px] text-slate-500">
                  Logged in as Read-Only Auditor. Action controls are disabled per regulatory compliance policy.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Read-Only Restricted
            </span>
          </div>
        )}
      </div>

      {/* ── LOAN CONTENT GRID ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Overview */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{loanData.loanId}</h2>
                <p className="text-sm text-slate-500 mt-0.5">Applied {loanData.applicationDate}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <RiskBadge level={loanData.riskLevel} />
                <StatusBadge status={currentStatus as LoanApplicationStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Requested Amount", value: formatIDR(loanData.amount), icon: IndianRupee, color: "text-blue-700 bg-blue-50" },
                { label: "Tenure", value: `${loanData.tenureMonths} months`, icon: Clock, color: "text-violet-700 bg-violet-50" },
                { label: "Monthly Revenue", value: formatIDR(loanData.monthlyRevenue), icon: IndianRupee, color: "text-emerald-700 bg-emerald-50" },
                { label: "Fintilla Band", value: fintillaBand.name, icon: User, color: "text-indigo-700 bg-indigo-50" },
                { label: "Application Date", value: loanData.applicationDate, icon: Calendar, color: "text-slate-700 bg-slate-50" },
                { label: "Last Updated", value: loanData.lastUpdated, icon: Calendar, color: "text-slate-700 bg-slate-50" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
                    <p className="text-xs font-bold font-mono text-slate-800 mt-0.5">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purpose & Notes */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Purpose & Details</h3>
            </div>
            <div className="mb-4">
              <p className="text-xs text-slate-400 font-medium mb-1">Loan Purpose</p>
              <p className="text-sm font-semibold text-slate-800">{loanData.purpose}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Application Notes</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {loanData.notes || "No notes provided."}
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Assessment Links</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/employee/customers/${loanData.customerId}`} className="flex-1 flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 transition-colors group">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">View Customer 360</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
              <Link href={`/employee/assessments/${loanData.loanId}`} className="flex-1 flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-emerald-50 transition-colors group">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">View Assessment</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Business Profile</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {loanData.businessName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{loanData.businessName}</p>
                <p className="text-xs text-slate-500">{loanData.customerName}</p>
                <Link href={`/employee/customers/${loanData.customerId}`} className="text-xs text-blue-600 hover:text-blue-700">
                  {loanData.customerId} →
                </Link>
              </div>
            </div>
            <p className="text-xs text-slate-500">{loanData.customerPhone}</p>
          </div>

          {/* Assessment Snapshot (NO NUMBERS) */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Assessment Snapshot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Risk Level</span>
                <RiskBadge level={loanData.riskLevel} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Fintilla Band</span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${fintillaBand.style}`}>
                  {fintillaBand.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Credit Rating</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${creditTier.style}`}>
                  {creditTier.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {decisionAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="decision-title">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div><h2 id="decision-title" className="text-base font-bold text-slate-900">Confirm {decisionAction === "request-info" ? "Request More Information" : decisionAction === "escalate" ? "Escalation" : decisionAction === "approve" ? "Approval" : "Decline"}</h2><p className="mt-1 text-xs text-slate-500">This reason is recorded in the audit log.</p></div>
              <button type="button" onClick={() => { setDecisionAction(null); setDecisionReason(""); setR1Reviewed(false); }} className="text-slate-400 hover:text-slate-700" aria-label="Close decision dialog">×</button>
            </div>
            {decisionAction === "approve" && <label className="mt-5 flex items-start gap-2 text-xs font-medium text-slate-700"><input type="checkbox" checked={r1Reviewed} onChange={(event) => setR1Reviewed(event.target.checked)} className="mt-0.5" />I confirm the Fintilla Band/R1 was reviewed and this decision does not alter the score or model.</label>}
            <select value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} className="mt-5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              <option value="">Select reason code</option>
              <option>G1 integrity fail</option><option>Completeness L3/L4</option><option>Contradicted reconciliation</option><option>Archetype switched mid-session</option><option>Other</option>
            </select>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setDecisionAction(null); setDecisionReason(""); setR1Reviewed(false); }} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">Cancel</button><button type="button" onClick={confirmDecision} disabled={!decisionReason || (decisionAction === "approve" && !r1Reviewed)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Confirm and record</button></div>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
}
