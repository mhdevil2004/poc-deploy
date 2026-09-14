import { cn } from "@/lib/utils/formatters";
import type { LoanApplicationStatus, RiskCaseStatus, EmployeeStatus, CustomerStatus } from "../../types";

type AnyStatus = LoanApplicationStatus | RiskCaseStatus | EmployeeStatus | CustomerStatus;

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  // Loan statuses
  Pending: "bg-slate-100 text-slate-600 border border-slate-200",
  Submitted: "bg-amber-50 text-amber-700 border border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border border-blue-200",
  "Assessment Pending": "bg-orange-50 text-orange-700 border border-orange-200",
  "Assessment Completed": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Documents Pending": "bg-red-50 text-red-700 border border-red-200",
  Flagged: "bg-rose-50 text-rose-700 border border-rose-200",
  "Manual Review Required": "bg-red-100 text-red-800 border border-red-300",
  "Review Completed": "bg-teal-50 text-teal-700 border border-teal-200",
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  Rejected: "bg-red-100 text-red-800 border border-red-300",
  // Risk case statuses
  Open: "bg-blue-50 text-blue-700 border border-blue-200",
  "In Review": "bg-amber-50 text-amber-700 border border-amber-200",
  Escalated: "bg-red-50 text-red-700 border border-red-200",
  Resolved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Closed: "bg-slate-100 text-slate-600 border border-slate-200",
  // Employee / Customer statuses
  Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Inactive: "bg-slate-100 text-slate-500 border border-slate-200",
  "On Leave": "bg-purple-50 text-purple-700 border border-purple-200",
  Blacklisted: "bg-red-100 text-red-800 border border-red-300",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
