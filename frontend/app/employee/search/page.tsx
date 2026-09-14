"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { MOCK_LOANS } from "../mock/loans";
import { MOCK_CUSTOMERS } from "../mock/customers";
import {
  Search,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Filter,
  RotateCcw,
  Clock,
  Flag,
  User,
  Building2,
  FileText,
  X,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/i18n";
import { formatIDR } from "@/lib/utils/formatters";

// ── Fintilla Score Bands ──────────────────────────────────────────────────────
export type FintillaScoreBand =
  | "VERIFIED-STRONG"
  | "VERIFIED-ADEQUATE"
  | "VERIFIED-THIN"
  | "UNVERIFIED"
  | "CONTRADICTED";

const FINTILLA_BANDS: FintillaScoreBand[] = [
  "VERIFIED-STRONG",
  "VERIFIED-ADEQUATE",
  "VERIFIED-THIN",
  "UNVERIFIED",
  "CONTRADICTED",
];

function deriveFintillaBand(score: number): FintillaScoreBand {
  if (score >= 80) return "VERIFIED-STRONG";
  if (score >= 65) return "VERIFIED-ADEQUATE";
  if (score >= 50) return "VERIFIED-THIN";
  if (score >= 35) return "UNVERIFIED";
  return "CONTRADICTED";
}

const BAND_STYLES: Record<FintillaScoreBand, { badge: string; dot: string }> = {
  "VERIFIED-STRONG": { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  "VERIFIED-ADEQUATE": { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  "VERIFIED-THIN": { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  UNVERIFIED: { badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  CONTRADICTED: { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

function ScoreBandBadge({ band }: { band: FintillaScoreBand }) {
  const style = BAND_STYLES[band];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2 py-1 rounded-lg border ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {band}
    </span>
  );
}

// ── Credit Tier Badge (No numbers!) ──────────────────────────────────────────
function deriveCreditTier(score: number): { label: string; badge: string } {
  if (score >= 720) return { label: "STRONG CREDIT", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 650) return { label: "ADEQUATE CREDIT", badge: "bg-blue-50 text-blue-700 border-blue-200" };
  if (score >= 550) return { label: "THIN CREDIT", badge: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "UNVERIFIED CREDIT", badge: "bg-red-50 text-red-700 border-red-200" };
}

function CreditTierBadge({ score }: { score: number }) {
  const tier = deriveCreditTier(score);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${tier.badge}`}>
      <CreditCard className="w-3 h-3" />
      {tier.label}
    </span>
  );
}

// ── Risk Tier Badge (No numbers!) ─────────────────────────────────────────────
function deriveRiskTier(score: number): { label: string; badge: string } {
  if (score <= 30) return { label: "LOW RISK", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score <= 50) return { label: "MODERATE RISK", badge: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "HIGH RISK", badge: "bg-red-50 text-red-700 border-red-200" };
}

function RiskTierBadge({ score }: { score: number }) {
  const tier = deriveRiskTier(score);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${tier.badge}`}>
      <ShieldAlert className="w-3 h-3" />
      {tier.label}
    </span>
  );
}

// ── Portal Status (Pending, Complete, Flagged) ───────────────────────────────
type PortalStatus = "Pending" | "Complete" | "Flagged";
const PORTAL_STATUSES: PortalStatus[] = ["Pending", "Complete", "Flagged"];

function toPortalStatus(status: string): PortalStatus {
  if (status.toLowerCase().includes("flag") || status.toLowerCase().includes("manual")) return "Flagged";
  if (status.toLowerCase().includes("complet") || status.toLowerCase().includes("approv")) return "Complete";
  return "Pending";
}

function PortalStatusBadge({ status }: { status: PortalStatus }) {
  const styles: Record<PortalStatus, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Flagged: "bg-red-50 text-red-700 border-red-200",
  };
  const icons: Record<PortalStatus, React.ReactNode> = {
    Pending: <Clock className="w-3 h-3" />,
    Complete: <CheckCircle2 className="w-3 h-3" />,
    Flagged: <Flag className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const initialQ = searchParams?.get("q") || "";
  const initialLoanRef = searchParams?.get("loanRef") || "";

  // Filter States
  const [query, setQuery] = useState(initialQ);
  const [loanRef, setLoanRef] = useState(initialLoanRef);
  const [scoreBand, setScoreBand] = useState<FintillaScoreBand | "">("");
  const [status, setStatus] = useState<PortalStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sync state if URL changes
  useEffect(() => {
    if (initialQ) setQuery(initialQ);
    if (initialLoanRef) setLoanRef(initialLoanRef);
  }, [initialQ, initialLoanRef]);

  // Unified Search Results combining Loans and Customer records
  const searchResults = useMemo(() => {
    return MOCK_LOANS.map((loan) => {
      const customer = MOCK_CUSTOMERS.find((c) => c.customerId === loan.customerId);
      const band = deriveFintillaBand(loan.overallScore);
      const pStatus = toPortalStatus(loan.status);

      return {
        loan,
        customer,
        fintillaBand: band,
        portalStatus: pStatus,
      };
    }).filter(({ loan, customer, fintillaBand, portalStatus }) => {
      // 1. General search query (Owner, Business, Customer ID, Loan ID, Amount)
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const formattedAmount = formatIDR(loan.amount).toLowerCase(); // "rp 25.000.000"
        const formattedWithoutRp = formattedAmount.replace(/^rp\s*/i, "").trim(); // "25.000.000"
        const digitsOnly = q.replace(/[^0-9]/g, "");
        const loanAmountStr = String(loan.amount); // "25000000"

        const matchesQuery =
          loan.loanId.toLowerCase().includes(q) ||
          loan.businessName.toLowerCase().includes(q) ||
          loan.customerName.toLowerCase().includes(q) ||
          loan.customerId.toLowerCase().includes(q) ||
          formattedAmount.includes(q) ||
          formattedWithoutRp.includes(q) ||
          (digitsOnly.length >= 3 && loanAmountStr.includes(digitsOnly)) ||
          (customer && (
            customer.email.toLowerCase().includes(q) ||
            customer.phone.toLowerCase().includes(q) ||
            customer.city.toLowerCase().includes(q)
          ));
        if (!matchesQuery) return false;
      }

      // 2. Loan Reference / Amount search
      if (loanRef.trim()) {
        const ref = loanRef.toLowerCase().trim();
        const formattedAmount = formatIDR(loan.amount).toLowerCase();
        const digitsOnly = ref.replace(/[^0-9]/g, "");
        const loanAmountStr = String(loan.amount);

        const matchesRef =
          loan.loanId.toLowerCase().includes(ref) ||
          formattedAmount.includes(ref) ||
          (digitsOnly.length >= 3 && loanAmountStr.includes(digitsOnly));

        if (!matchesRef) return false;
      }

      // 3. Fintilla Score Band filter
      if (scoreBand && fintillaBand !== scoreBand) return false;

      // 4. Portal Status filter (Pending, Complete, Flagged)
      if (status && portalStatus !== status) return false;

      // 5. Date Range filter
      if (dateFrom && loan.applicationDate < dateFrom) return false;
      if (dateTo && loan.applicationDate > dateTo) return false;

      return true;
    });
  }, [query, loanRef, scoreBand, status, dateFrom, dateTo]);

  const hasActiveFilters =
    query || loanRef || scoreBand || status || dateFrom || dateTo;

  const handleReset = () => {
    setQuery("");
    setLoanRef("");
    setScoreBand("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    router.push("/employee/search");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (loanRef) params.set("loanRef", loanRef);
    router.push(`/employee/search?${params.toString()}`);
  };

  return (
    <EmployeeLayout
      title="Advanced Search"
      subtitle="Search loan references, filter by date range, Fintilla score band, and status"
    >
      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm p-5 mb-8">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Top Row: General Query & Loan Ref */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                General Search (Name / Customer ID / Business)
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Warung Budi, Budi Santoso..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Loan Reference Number
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. LN-ID-2026-00002"
                  value={loanRef}
                  onChange={(e) => setLoanRef(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: Score Band, Status, Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
            {/* Score Band */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                Fintilla Score Band
              </label>
              <select
                value={scoreBand}
                onChange={(e) => setScoreBand(e.target.value as FintillaScoreBand)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">All Score Bands</option>
                {FINTILLA_BANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PortalStatus)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">All Statuses</option>
                {PORTAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs font-semibold text-slate-500">
              Found <span className="text-blue-700 font-bold">{searchResults.length}</span> matching record(s)
            </p>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Search Results Grid ─────────────────────────────────────────────── */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {searchResults.map(({ loan, customer, fintillaBand, portalStatus }) => (
            <div
              key={loan.loanId}
              className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              {/* Header: Loan Reference & Status */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold tracking-wide">
                    {loan.loanId}
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Applied: {loan.applicationDate}
                  </p>
                </div>
                <PortalStatusBadge status={portalStatus} />
              </div>

              {/* Borrower Info */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-inner flex-shrink-0">
                  {loan.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {loan.businessName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {loan.customerName} · {loan.businessType}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Customer ID: {loan.customerId}
                  </p>
                </div>
              </div>

              {/* Assessment Badges (NO NUMBERS - Band Names Only) */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Fintilla Score Band
                  </span>
                  <ScoreBandBadge band={fintillaBand} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Credit Rating
                  </span>
                  <CreditTierBadge score={loan.creditScore} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Risk Classification
                  </span>
                  <RiskTierBadge score={loan.riskScore} />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Officer: <strong className="text-slate-700">{loan.assignedEmployeeName}</strong>
                </span>
                <Link
                  href={`/employee/lending/${loan.loanId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  View Loan Details
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No matching applications found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Try adjusting your search query, loan reference, date range, or score band filter.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </EmployeeLayout>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SearchResultsContent />
    </Suspense>
  );
}
