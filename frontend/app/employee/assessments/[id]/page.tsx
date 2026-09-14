"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, Building2, IndianRupee, Banknote, Calendar, Activity, ShieldCheck, FileText, CheckCircle, ShieldAlert, AlertTriangle, ChevronRight, Flag, AlertOctagon, ChevronDown, ChevronUp } from "lucide-react";
import { EmployeeLayout } from "../../components/layout/EmployeeLayout";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { MOCK_ASSESSMENTS } from "../../mock/assessments";
import { MOCK_CUSTOMERS } from "../../mock/customers";
import { MOCK_LOANS } from "../../mock/loans";
import { formatIDR } from "@/lib/utils/formatters";
import { getAssessment } from "@/lib/api/assessmentService";
import type { Assessment, Customer, EmployeeLoan, LoanApplicationStatus } from "../../types";
import { useTranslation } from "@/i18n";
import { ScoreBreakdown } from "../../components/risk/ScoreBreakdown";
import { RiskEvidenceCards } from "../../components/risk/RiskEvidenceCards";

import { useRequireEmployeeAuth } from "../../hooks/useEmployeeAuth";
import toast from "react-hot-toast";

type TabType = "overview" | "business" | "financial" | "loan" | "scores" | "risk" | "flags" | "history";

const ENGLISH_RECORD_TEXT: Record<string, string> = {
  "Jumlah pembiayaan yang diminta sangat tinggi dibandingkan pendapatan bersih. Kewajiban utang yang ada signifikan. Memerlukan tinjauan manual.": "The requested financing is very high compared with net income. Existing debt obligations are significant and require manual review.",
  "Stabilitas Bisnis": "Business Stability",
  "Eksposur Utang": "Debt Exposure",
  "Stabilitas Pendapatan": "Income Stability",
  "Usia Usaha": "Business Age",
  "Rasio Pembiayaan": "Financing Ratio",
  "Rasio Pengeluaran": "Expense Ratio",
  "Warung Kopi Agus beroperasi 8 tahun dengan 5 karyawan. Stabilitas relatif baik namun pendapatan tinggi vs pengeluaran tinggi.": "Warung Kopi Agus has operated for 8 years with 5 employees. Stability is relatively good, but income and expenses are both high.",
  "Utang yang ada Rp 15.000.000 ditambah permintaan Rp 80.000.000 = total kewajiban Rp 95.000.000. Sangat signifikan vs pendapatan bersih Rp 8.000.000/bulan.": "Existing debt of Rp 15,000,000 plus the Rp 80,000,000 request creates total obligations of Rp 95,000,000, which is significant against net income of Rp 8,000,000 per month.",
  "Pendapatan bulanan Rp 36.000.000 konsisten namun margin keuntungan rendah (22,2%).": "Monthly revenue of Rp 36,000,000 is consistent, but the profit margin is low at 22.2%.",
  "Delapan tahun operasional menunjukkan bisnis yang mapan di lokasi strategis Surabaya.": "Eight years of operations indicates an established business in a strategic Surabaya location.",
  "Pembiayaan Rp 80.000.000 adalah 10x pendapatan bersih bulanan Rp 8.000.000. Beban yang sangat signifikan.": "The Rp 80,000,000 financing request is 10 times monthly net income of Rp 8,000,000, creating a significant burden.",
  "Pengeluaran bulanan 77,8% dari pendapatan. Tinggi namun masih dapat diterima untuk bisnis F&B.": "Monthly expenses are 77.8% of revenue. This is high but still acceptable for an F&B business.",
  "Eksposur Utang Tinggi": "High Debt Exposure",
  "Rasio Pembiayaan Kritis": "Critical Financing Ratio",
  "Peminjam Berulang": "Repeat Borrower",
  "Total kewajiban utang (existing + baru) melebihi ambang batas yang dapat diterima relative terhadap arus kas bisnis.": "Total debt obligations, existing plus new, exceed the acceptable threshold relative to business cash flow.",
  "Jumlah pembiayaan yang diminta sangat besar relatif terhadap pendapatan bersih bisnis.": "The requested financing is very large relative to business net income.",
  "Nasabah memiliki aplikasi aktif kedua (LN-ID-2026-00004). Perlu koordinasi peninjauan.": "The customer has a second active application (LN-ID-2026-00004). Review coordination is required.",
  "Bisnis mapan beroperasi 8 tahun": "Established business operating for 8 years",
  "Lokasi strategis di pusat Surabaya": "Strategic location in central Surabaya",
  "Tim yang berpengalaman (5 karyawan)": "Experienced team of 5 employees",
  "Total utang (Rp 95.000.000) sangat tinggi relatif terhadap pendapatan bersih": "Total debt of Rp 95,000,000 is very high relative to net income",
  "Pembiayaan yang diminta (Rp 80.000.000) adalah 10x pendapatan bersih bulanan": "Requested financing of Rp 80,000,000 is 10 times monthly net income",
  "Terdapat aplikasi pembiayaan kedua yang aktif dari nasabah yang sama": "A second active financing application exists for the same customer",
  "Aplikasi pembiayaan diajukan": "Financing application submitted",
  "Aplikasi diterima dan ditetapkan ke analis": "Application received and assigned to an analyst",
  "Penilaian kredit selesai — skor rendah terdeteksi": "Credit assessment completed — low score detected",
  "Eskalasi ke Risk Officer untuk tinjauan lebih lanjut": "Escalated to Risk Officer for further review",
  "Status diperbarui: Manual Review Required": "Status updated: Manual Review Required",
  "Renovasi toko (Store Renovation)": "Store renovation",
};

function englishRecordText(value: string) {
  return ENGLISH_RECORD_TEXT[value] || value;
}

export default function AssessmentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { employee } = useRequireEmployeeAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showScoreDerivation, setShowScoreDerivation] = useState(false);
  const [liveView, setLiveView] = useState<{ assessment: Assessment; customer: Customer; loan: EmployeeLoan } | null>(null);

  const mockAssessment = MOCK_ASSESSMENTS.find((a) => a.loanId === id);
  const mockCustomer = MOCK_CUSTOMERS.find((c) => c.customerId === mockAssessment?.customerId);
  const mockLoan = MOCK_LOANS.find((l) => l.loanId === id);

  useEffect(() => {
    if (mockAssessment && mockCustomer && mockLoan) return;
    void getAssessment(id).then((record) => {
      const riskLevel = record.scoreBand === "CONTRADICTED" ? "Critical" : record.scoreBand === "UNVERIFIED" ? "High" : record.scoreBand === "VERIFIED-THIN" ? "Medium" : "Low";
      const status = record.status === "Pending" ? "Pending" : record.status === "Flagged" ? "Flagged" : "Assessment Completed";
      const score = record.scoreBand === "VERIFIED-STRONG" ? 85 : record.scoreBand === "VERIFIED-ADEQUATE" ? 72 : record.scoreBand === "VERIFIED-THIN" ? 55 : record.scoreBand === "UNVERIFIED" ? 35 : 20;
      const baseAssessment = MOCK_ASSESSMENTS[0];
      const baseCustomer = MOCK_CUSTOMERS[0];
      const baseLoan = MOCK_LOANS[0];
      setLiveView({
        assessment: { ...baseAssessment, loanId: record.loanRef, customerId: record.id, customerName: record.borrower, businessName: record.businessName, businessType: record.businessType, province: record.location, city: record.location, assessmentDate: record.assessmentDate, status, riskLevel, overallScore: score, creditScore: score, psychometricScore: score, integrityScore: score, riskScore: 100 - score, notes: record.notes, assignedAnalystName: record.assignedAnalyst, assignedAnalystId: record.assignedAnalyst },
        customer: { ...baseCustomer, customerId: record.id, name: record.borrower, businessName: record.businessName, businessType: record.businessType, province: record.location, city: record.location },
        loan: { ...baseLoan, loanId: record.loanRef, customerId: record.id, customerName: record.borrower, businessName: record.businessName, businessType: record.businessType, amount: record.requestedAmount, status, riskLevel, overallScore: score, creditScore: score, creditworthiness: score, psychometricScore: score, integrityScore: score, riskScore: 100 - score, notes: record.notes },
      });
    }).catch(() => undefined);
  }, [id, mockAssessment, mockCustomer, mockLoan]);

  const assessment = (mockAssessment || liveView?.assessment)!;
  const customer = (mockCustomer || liveView?.customer)!;
  const loan = (mockLoan || liveView?.loan)!;

  const [currentStatus, setCurrentStatus] = useState<LoanApplicationStatus>(assessment?.status || "Under Review");

  if (!assessment || !customer || !loan) {
    return (
      <EmployeeLayout title="Assessment Not Found">
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">Assessment reference &quot;{id}&quot; not found.</p>
          <Link href="/employee/assessments" className="text-blue-600 text-sm font-semibold mt-3 inline-block">â† Back to Assessments</Link>
        </div>
      </EmployeeLayout>
    );
  }

  const role = employee?.role || "Read-Only Auditor";

  const TABS: { id: TabType; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "scores", label: "Scores" },
    { id: "risk", label: "Risk Factors", count: assessment.riskFactors.length },
    { id: "flags", label: "Red Flags", count: assessment.flags.length },
    { id: "loan", label: "Loan Info" },
    { id: "business", label: "Business" },
    { id: "history", label: "History" },
  ];

  return (
    <EmployeeLayout title={`Assessment Case: ${loan.loanId}`} subtitle={`Customer: ${assessment.customerName}`}>
      <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Link href="/employee/assessments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to {assessment.customerName}
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Active Role: {role}
        </div>
      </div>

      {/* DYNAMIC ROLE-BASED DECISION ACTION PANEL */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {role === "Underwriter" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  UW
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Underwriter Decision Action Bar</h3>
                  <p className="text-xs text-slate-500">Authorized to approve, adjust terms, or reject this application</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Underwriter Clearance Active
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setCurrentStatus("Assessment Completed");
                  toast.success(`Application ${loan.loanId} approved by Underwriter`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Disburse
              </button>

              <button
                onClick={() => toast.success("Term adjustment requested")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                Adjust Terms / Amount
              </button>

              <button
                onClick={() => {
                  setCurrentStatus("Rejected");
                  toast.error(`Application ${loan.loanId} rejected.`);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                Reject Application
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
                  <h3 className="text-sm font-bold text-slate-900">Risk Officer Audit Action Bar</h3>
                  <p className="text-xs text-slate-500">Authorized to override risk classifications, set fraud flags, or approve risk exceptions</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Risk Clearance Active
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setCurrentStatus("Manual Review Required");
                  toast(`Application ${loan.loanId} flagged for Risk Officer Audit.`, { icon: "âš ï¸" });
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Flag className="w-4 h-4" />
                Flag for Risk Review
              </button>

              <button
                onClick={() => {
                  setCurrentStatus("Assessment Completed");
                  toast.success("Risk exception approved by Risk Officer");
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Risk Exception
              </button>

              <button
                onClick={() => toast(`Full fraud scan initiated`, { icon: "ðŸ›¡ï¸" })}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                Trigger Deep Fraud Scan
              </button>
            </div>
          </div>
        )}

        {(role === "Administrator" || role === "Read-Only Auditor" || role === "Loan Officer") && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Viewing under &quot;{role}&quot; Security Clearance</h3>
                <p className="text-[11px] text-slate-500">Sign in as an Underwriter or Risk Officer to execute approval, rejection, or fraud clearance actions.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-5">
              {(() => {
                const band = assessment.overallScore >= 80 ? "VERIFIED-STRONG" : assessment.overallScore >= 65 ? "VERIFIED-ADEQUATE" : assessment.overallScore >= 50 ? "VERIFIED-THIN" : assessment.overallScore >= 35 ? "UNVERIFIED" : "CONTRADICTED";
                const bandStyle = band === "VERIFIED-STRONG" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : band === "VERIFIED-ADEQUATE" ? "bg-blue-50 text-blue-700 border-blue-200" : band === "VERIFIED-THIN" ? "bg-amber-50 text-amber-700 border-amber-200" : band === "UNVERIFIED" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-red-50 text-red-700 border-red-200";
                return (
                  <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold shadow-sm mb-3 ${bandStyle}`}>
                    {band}
                  </div>
                );
              })()}
              <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">Fintilla score band</h2>
              <RiskBadge level={assessment.riskLevel} />
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-medium">{t('assessments.assessmentStatus')}</span>
                <div className="mt-1"><StatusBadge status={currentStatus} /></div>
              </div>
              <div className="pt-2">
                <span className="text-xs text-slate-400 font-medium">{t('assessments.customer')}</span>
                <Link href={`/employee/customers/${customer.customerId}`} className="block text-sm font-bold text-blue-600 hover:text-blue-700 mt-0.5">
                  {customer.name}
                </Link>
                <span className="text-[10px] font-mono text-slate-500">{customer.customerId}</span>
              </div>
              <div className="pt-2">
                <span className="text-xs text-slate-400 font-medium">{t('assessments.business')}</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{assessment.businessName}</p>
                <p className="text-[10px] text-slate-500">{assessment.businessType}</p>
              </div>
              <div className="pt-2">
                <span className="text-xs text-slate-400 font-medium">{t('assessments.assignedAnalyst')}</span>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{assessment.assignedAnalystName}</p>
                <p className="text-[10px] text-slate-500">{assessment.assignedAnalystId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> {t('assessments.overviewTitle')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('assessments.requested')}</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{formatIDR(loan.amount)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('assessments.tenor')}</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{loan.tenureMonths} {t('assessments.monthsShort')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('assessments.creditBureau')}</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {customer.creditScore >= 720 ? "STRONG CREDIT" : customer.creditScore >= 650 ? "ADEQUATE CREDIT" : customer.creditScore >= 550 ? "THIN CREDIT" : "UNVERIFIED CREDIT"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('assessments.purpose')}</p>
                    <p className="text-xs font-bold text-slate-800 mt-1 leading-tight">{englishRecordText(loan.purpose)}</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">{t('assessments.analystNotes')}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{englishRecordText(assessment.notes)}</p>
                </div>
              </div>
            )}

            {/* SCORES */}
            {activeTab === "scores" && <ScoreBreakdown assessment={assessment} customer={customer} loan={loan} />}
            {/* Legacy inline score renderer removed; ScoreBreakdown is the shared implementation. */}
            {false && activeTab === "scores" && (() => {
              const sessionIntegrity = "PASS" as string;
              const isSessionIntegrityFailure = (value: string) => value === "FAIL";
              const completenessLevel = (assessment.flags.some((flag) => flag.severity === "Critical") ? "L4" : assessment.status === "Under Review" ? "L2" : "L3") as string;
              const completenessLabels: Record<string, string> = { L0: "Full", L1: "Partial", L2: "Degraded", L3: "Minimal", L4: "Failed" };
              const gatesPassed = sessionIntegrity === "PASS" && completenessLevel !== "L4";
              const downstreamStateClass = isSessionIntegrityFailure(sessionIntegrity) ? "pointer-events-none opacity-40 grayscale" : "";
              const cashAvailable = Math.max(0, customer.netIncome - customer.monthlyDebtObligation);
              const cashRangeFloor = Math.max(0, cashAvailable - Math.min(1000000, Math.round(cashAvailable * 0.15)));
              const requestedInstallment = loan.amount / loan.tenureMonths * 1.15;
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

              return <div className="space-y-8">
                <section>
                  <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">Gates</h3><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Assessment controls</span></div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4"><span className="text-sm font-semibold text-slate-700">G1 — Session Integrity</span><span className={`rounded border px-2 py-1 text-[10px] font-bold ${isSessionIntegrityFailure(sessionIntegrity) ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{sessionIntegrity}</span></div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4"><span className="text-sm font-semibold text-slate-700">G2 — Assessment Completeness</span><span className={`rounded border px-2 py-1 text-[10px] font-bold ${completenessLevel === "L0" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : completenessLevel === "L4" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{completenessLevel} · {completenessLabels[completenessLevel]}</span></div>
                  </div>
                  {isSessionIntegrityFailure(sessionIntegrity) && <div className="mt-4 flex w-full items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><span>Assessment void — session integrity check failed</span></div>}
                </section>

                <section className={downstreamStateClass}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">C1 — Net Monthly Cash Available for Debt Service</h3></div><div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5"><p className="text-xl font-bold tracking-tight text-emerald-800">{formatIDR(cashRangeFloor)} – {formatIDR(cashAvailable)}</p><button type="button" onClick={() => setShowScoreDerivation(!showScoreDerivation)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">{showScoreDerivation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{showScoreDerivation ? "Hide derivation" : "Show derivation"}</button>{showScoreDerivation && <div className="mt-4 space-y-2 border-t border-emerald-200 pt-4 text-xs text-emerald-900"><div className="flex justify-between"><span>Declared revenue</span><span className="font-semibold">{formatIDR(customer.monthlyRevenue)}</span></div><div className="flex justify-between"><span>Estimated costs</span><span className="font-semibold">− {formatIDR(customer.monthlyExpenses)}</span></div><div className="flex justify-between"><span>Adjustments</span><span className="font-semibold">− {formatIDR(customer.netIncome - cashAvailable)} – {formatIDR(customer.netIncome - cashRangeFloor)}</span></div></div>}</div></section>

                <section className={downstreamStateClass}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">C2 — Affordability</h3></div><div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">Requested instalment ÷ C1 = <span className="text-lg font-bold text-slate-900">{affordability}%</span></div></section>

                <section className={downstreamStateClass}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">POJK-40 Mapped Scores</h3></div><div className="space-y-4">{scoreRows.map((row) => <div key={row.name}><div className="mb-1.5 flex items-end justify-between"><span className="text-xs font-semibold text-slate-700">{row.name}</span><span className="text-xs font-bold font-mono text-slate-800">{row.score}/100 <span className="font-normal text-slate-400">· weight {row.weight}</span></span></div><div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${row.score}%` }} /></div></div>)}</div></section>

                <section className={downstreamStateClass}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">R1 — Assessment Band</h3></div>{gatesPassed ? <div><span className={`inline-flex rounded border px-3 py-1.5 text-xs font-bold ${scoreBandStyle}`}>{scoreBand}</span><p className="mt-2 text-xs text-slate-500">Uncalibrated decision input — not a final credit decision</p></div> : <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm font-semibold text-slate-600">R1 suppressed — assessment is void because {isSessionIntegrityFailure(sessionIntegrity) ? "session integrity failed" : "assessment completeness is L4 (Failed)"}.</div>}</section>

                <section className={downstreamStateClass}><div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">Reason Codes</h3></div><div className="space-y-2.5">{assessment.insights.map((insight, idx) => <div key={idx} className="flex items-start gap-2">{insight.type === "positive" ? <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}<span className="text-xs text-slate-600">{englishRecordText(insight.text)}</span></div>)}</div></section>
              </div>;
              })()}

            {/* RISK ANALYSIS */}
            {activeTab === "risk" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-600" /> {t('assessments.riskFactors')} ({assessment.riskFactors.length})
                  </h3>
                  <Link href={`/employee/risk/${assessment.loanId.replace("LN-ID", "RC")}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    {t('assessments.openRiskCase')}
                  </Link>
                </div>
                <RiskEvidenceCards source={customer} />
                {false && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: "Monthly Revenue Reconciliation",
                      status: "Closed",
                      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      body: `Declared ${formatIDR(customer.monthlyRevenue)} compared with measured deposits of ${formatIDR(Math.round(customer.monthlyRevenue * 0.96))}; the variance is within the accepted range.`,
                      score: 18,
                    },
                    {
                      title: "Cash-on-Hand Reconciliation",
                      status: "Open",
                      badge: "bg-amber-50 text-amber-700 border-amber-200",
                      body: `The declared cash position of ${formatIDR(Math.round(customer.monthlyRevenue * 0.18))} is not fully supported by the available transaction evidence and needs follow-up.`,
                      score: 46,
                    },
                    {
                      title: "Capacity Utilisation",
                      status: customer.monthlyRevenue / Math.max(customer.monthlyRevenue * 1.18, 1) < 1 ? "Normal" : "Implausible",
                      badge: "bg-blue-50 text-blue-700 border-blue-200",
                      body: "Declared turnover divided by the estimated capacity ceiling based on observed operating hours and business size.",
                      score: 28,
                      detail: `0.85 — Normal`,
                    },
                    {
                      title: "Archetype Consistency",
                      status: "Match",
                      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      body: `Application business type (${assessment.businessType}) matches the type observed in the walk-round scan.`,
                      score: 15,
                      detail: `Application: ${assessment.businessType} · Observed: ${assessment.businessType}`,
                    },
                    {
                      title: "Signal Confidence",
                      status: "Mixed",
                      badge: "bg-amber-50 text-amber-700 border-amber-200",
                      body: "Contributing signals are separated by evidence strength so the reviewer can distinguish verified inputs from assumptions.",
                      score: 38,
                      detail: "[P] Proven 60% · [F] Feasible 25% · [S] Speculative 15%",
                    },
                  ].map((factor) => (
                    <div key={factor.title} className="flex h-full flex-col rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-slate-800">{factor.title}</h4>
                        <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold ${factor.badge}`}>{factor.status}</span>
                      </div>
                      {factor.detail && <p className="mb-2 text-sm font-bold text-slate-900">{factor.detail}</p>}
                      <p className="flex-1 text-xs leading-relaxed text-slate-600">{factor.body}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Evidence risk score</span>
                        <span className={`text-xs font-bold ${factor.score >= 70 ? "text-red-600" : factor.score >= 40 ? "text-amber-600" : "text-emerald-600"}`}>{factor.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            )}

            {/* FLAGS */}
            {activeTab === "flags" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" /> {t('assessments.activeRedFlags')}
                </h3>
                {assessment.flags.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">{t('assessments.noRedFlags')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessment.flags.map((flag, idx) => (
                      <div key={idx} className="bg-red-50/50 rounded-xl p-4 border border-red-100/50 flex gap-3">
                        <AlertOctagon className={`w-5 h-5 flex-shrink-0 ${flag.severity === "Critical" ? "text-red-600" : flag.severity === "High" ? "text-orange-500" : "text-amber-500"}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-800">{englishRecordText(flag.type)}</h4>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{englishRecordText(flag.description)}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{t('assessments.detectedAt')}{flag.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LOAN */}
            {activeTab === "loan" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900">{t('assessments.financingDetails')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">{t('assessments.requestedAmount')}</span>
                      <span className="text-sm font-bold text-slate-800">{formatIDR(loan.amount)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">{t('assessments.tenor')}</span>
                      <span className="text-sm font-bold text-slate-800">{loan.tenureMonths} {t('assessments.months')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">{t('assessments.purpose')}</span>
                      <span className="text-sm font-bold text-slate-800">{englishRecordText(loan.purpose)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">{t('assessments.existingLoan')}</span>
                      <span className="text-sm font-bold text-slate-800">{formatIDR(loan.existingOutstandingLoan)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">{t('assessments.estInstallment')}</span>
                      <span className="text-sm font-bold text-slate-800">{formatIDR(loan.amount / loan.tenureMonths * 1.15)}{t('assessments.perMonth')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500">{t('assessments.applicationDate')}</span>
                      <span className="text-sm font-bold text-slate-800">{new Date(loan.applicationDate).toLocaleDateString("en-US")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BUSINESS & FINANCIAL */}
            {(activeTab === "business" || activeTab === "financial") && (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                <Banknote className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 font-medium">{t('assessments.detailedDataInProfile')}</p>
                <Link href={`/employee/customers/${customer.customerId}?tab=${activeTab}`} className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all">
                  {t('assessments.viewCustomerProfile')}
                </Link>
              </div>
            )}

            {/* HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900">{t('assessments.assessmentHistory')}</h3>
                <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-slate-100">
                  {assessment.history.map((entry, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[27px] mt-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{englishRecordText(entry.event)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 font-mono">{entry.date}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-medium text-slate-600">{entry.actor} ({entry.actorRole})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      </div>
    </EmployeeLayout>
  );
}

