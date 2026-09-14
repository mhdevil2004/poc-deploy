import { cn, getStatusColor, getStatusLabel } from "@/lib/utils/formatters";
import type { LoanStatus } from "@/types";

interface BadgeProps {
  status: LoanStatus | string;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const isLoanStatus = ["pending", "approved", "active", "rejected", "defaulted", "closed", "completed"].includes(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        isLoanStatus ? getStatusColor(status as LoanStatus) : "bg-gray-100 text-gray-600 border-gray-200",
        className
      )}
    >
      {isLoanStatus ? getStatusLabel(status as LoanStatus) : status}
    </span>
  );
}
