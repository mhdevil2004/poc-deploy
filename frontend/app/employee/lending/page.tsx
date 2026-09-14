"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, CreditCard, CheckCircle2, Info, RotateCcw } from "lucide-react";
import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { RiskBadge } from "../components/ui/RiskBadge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MOCK_LOANS } from "../mock/loans";
import { MOCK_ASSESSMENTS } from "../mock/assessments";
import { formatIDR } from "@/lib/utils/formatters";
import type { LoanApplicationStatus, RiskLevel } from "../types";
import toast from "react-hot-toast";

import { useRequireEmployeeAuth } from "../hooks/useEmployeeAuth";

function getRoleActionLabel(role?: string): string {
  if (role === "Underwriter") return "Approve / Evaluate";
  if (role === "Risk Officer") return "Audit Risk";
  if (role === "Administrator") return "Manage";
  return "View Only";
}

function getRoleActionStyle(role?: string): string {
  if (role === "Underwriter") return "bg-blue-50 text-blue-700 hover:bg-blue-100";
  if (role === "Risk Officer") return "bg-amber-50 text-amber-700 hover:bg-amber-100";
  if (role === "Administrator") return "bg-indigo-50 text-indigo-700 hover:bg-indigo-100";
  return "text-slate-600 hover:text-slate-900 bg-slate-100";
}

function getCompletenessLevel(score: number) {
  if (score >= 90) return { level: "L0", label: "Full", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 80) return { level: "L1", label: "Partial", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 65) return { level: "L2", label: "Degraded", style: "bg-amber-50 text-amber-700 border-amber-200" };
  if (score >= 50) return { level: "L3", label: "Minimal", style: "bg-amber-50 text-amber-700 border-amber-200" };
  return { level: "L4", label: "Failed", style: "bg-red-50 text-red-700 border-red-200" };
}

function getReviewTrigger(loanId: string) {
  const assessment = MOCK_ASSESSMENTS.find((item) => item.loanId === loanId);
  return assessment?.riskScore && assessment.riskScore >= 40 ? "Contradicted reconciliation" : "Completeness L3/L4";
}

const TABS: (LoanApplicationStatus | "All")[] = ["All", "Submitted", "Under Review", "Assessment Pending", "Assessment Completed", "Documents Pending"];
const RISK_LEVELS: (RiskLevel | "All")[] = ["All", "Low", "Medium", "High", "Critical"];

export default function LendingPage() {
  const { employee } = useRequireEmployeeAuth();
  const [activeTab, setActiveTab] = useState<LoanApplicationStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [selectedLoanForAction, setSelectedLoanForAction] = useState<typeof MOCK_LOANS[0] | null>(null);
  const [loanStatuses, setLoanStatuses] = useState<Record<string, LoanApplicationStatus>>({});

  const filtered = MOCK_LOANS.filter((loan) => {
    const currentStatus = loanStatuses[loan.loanId] || loan.status;
    const matchTab = activeTab === "All" || currentStatus === activeTab;
    const matchSearch =
      loan.loanId.toLowerCase().includes(search.toLowerCase()) ||
      loan.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (loan.businessName && loan.businessName.toLowerCase().includes(search.toLowerCase()));
    const matchRisk = riskFilter === "All" || loan.riskLevel === riskFilter;
    return matchTab && matchSearch && matchRisk;
  });

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? MOCK_LOANS.length : MOCK_LOANS.filter((l) => (loanStatuses[l.loanId] || l.status) === tab).length;
    return acc;
  }, {} as Record<string, number>);

  const handleStatusChange = (loanId: string, newStatus: LoanApplicationStatus, message: string) => {
    setLoanStatuses((prev) => ({ ...prev, [loanId]: newStatus }));
    setSelectedLoanForAction(null);
    toast.success(message);
  };

  return (
    <EmployeeLayout title="Lending" subtitle="Manage loan applications and decisions">
      {/* Tabs */}
      <div className="flex gap-1 bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-1.5 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {tab}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab ? "bg-blue-500/50 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Loan ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All Risk Levels" : r}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-2.5 ml-1">
          Showing {filtered.length} of {MOCK_LOANS.length} applications
        </p>
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Loan Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan ID</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Business</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Tenure</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessment Band</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
                {/* Product confirmation needed: use Assigned Reviewer until loan-level role metadata can distinguish Loan Officer from Risk Officer/Underwriter. */}
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Assigned Reviewer</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((loan) => {
                const currentLoanStatus = loanStatuses[loan.loanId] || loan.status;
                const band = loan.overallScore >= 80 ? "VERIFIED-STRONG" : loan.overallScore >= 65 ? "VERIFIED-ADEQUATE" : loan.overallScore >= 50 ? "VERIFIED-THIN" : loan.overallScore >= 35 ? "UNVERIFIED" : "CONTRADICTED";
                const bandStyle = band === "VERIFIED-STRONG" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : band === "VERIFIED-ADEQUATE" ? "bg-blue-50 text-blue-700 border-blue-200" : band === "VERIFIED-THIN" ? "bg-amber-50 text-amber-700 border-amber-200" : band === "UNVERIFIED" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-red-50 text-red-700 border-red-200";
                const completeness = getCompletenessLevel(loan.overallScore);
                const assessmentCount = MOCK_ASSESSMENTS.filter((assessment) => assessment.customerId === loan.customerId).length;
                const isManualReview = currentLoanStatus === "Manual Review Required";

                return (
                  <tr key={loan.loanId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-bold text-xs">{loan.loanId}{assessmentCount > 1 && <span title="Reassessed: this customer has more than one associated assessment" aria-label="Reassessed"><RotateCcw className="h-3 w-3 text-blue-600" /></span>}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-800 font-semibold text-xs">{loan.businessName}</p>
                      <p className="text-[10px] text-slate-400">{loan.customerName}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-bold text-slate-800">{formatIDR(loan.amount)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-xs text-slate-600">{loan.tenureMonths}m</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${bandStyle}`}>
                        {band}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${completeness.style}`}>{completeness.level} · {completeness.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <RiskBadge level={loan.riskLevel} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-slate-600">{loan.assignedEmployeeName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusBadge status={currentLoanStatus} />
                        {isManualReview && <span title={`Manual review trigger: ${getReviewTrigger(loan.loanId)}`} aria-label={`Manual review trigger: ${getReviewTrigger(loan.loanId)}`} className="cursor-help text-amber-600"><Info className="h-3.5 w-3.5" /></span>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedLoanForAction(loan)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-sm ${getRoleActionStyle(employee?.role)}`}
                      >
                        {getRoleActionLabel(employee?.role)}
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 text-sm">
                    No applications match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK DECISION MODAL */}
      {selectedLoanForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedLoanForAction.loanId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedLoanForAction.businessName}</h3>
                <p className="text-xs text-slate-500">Applicant: {selectedLoanForAction.customerName} â€¢ {formatIDR(selectedLoanForAction.amount)}</p>
              </div>
              <button
                onClick={() => setSelectedLoanForAction(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
              >
                âœ•
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Active Session Role:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {employee?.role || "Read-Only Auditor"}
                </span>
              </div>

              {employee?.role === "Underwriter" && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Underwriter Actions</p>
                  <button
                    onClick={() => selectedLoanForAction && handleStatusChange(selectedLoanForAction.loanId, "Assessment Completed", `Loan ${selectedLoanForAction.loanId} Approved & Disbursed!`)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Disburse Application
                  </button>
                  <button
                    onClick={() => selectedLoanForAction && handleStatusChange(selectedLoanForAction.loanId, "Under Review", `Terms adjustment requested for ${selectedLoanForAction.loanId}`)}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Adjust Loan Terms / Amount
                  </button>
                  <button
                    onClick={() => selectedLoanForAction && handleStatusChange(selectedLoanForAction.loanId, "Rejected", `Loan ${selectedLoanForAction.loanId} Rejected.`)}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Reject Loan Application
                  </button>
                </div>
              )}

              {employee?.role === "Risk Officer" && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Risk Officer Actions</p>
                  <button
                    onClick={() => selectedLoanForAction && handleStatusChange(selectedLoanForAction.loanId, "Manual Review Required", `Loan ${selectedLoanForAction.loanId} Flagged for Risk Audit`)}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Flag Application for Risk Review
                  </button>
                  <button
                    onClick={() => selectedLoanForAction && handleStatusChange(selectedLoanForAction.loanId, "Assessment Completed", `Risk Exception Approved for ${selectedLoanForAction.loanId}`)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Approve Risk Policy Exception
                  </button>
                  <button
                    onClick={() => {
                      if (selectedLoanForAction) {
                        toast(`ðŸ” Full Fraud Scan triggered for ${selectedLoanForAction.loanId}`, { icon: "ðŸ›¡ï¸" });
                        setSelectedLoanForAction(null);
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Trigger Automated Deep Fraud Scan
                  </button>
                </div>
              )}

              {(employee?.role === "Administrator" || employee?.role === "Read-Only Auditor" || !employee?.role) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <p className="font-bold mb-1">View-Only / Admin Mode Active</p>
                  <p>You are viewing this case under role &quot;{employee?.role || "Read-Only Auditor"}&quot;. To approve, reject, or perform risk clearance, sign in as an Underwriter or Risk Officer.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Link
                href={`/employee/lending/${selectedLoanForAction.loanId}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Detailed Case Page â†’
              </Link>
              <button
                onClick={() => setSelectedLoanForAction(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
}

