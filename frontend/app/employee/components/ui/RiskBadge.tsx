import { cn } from "@/lib/utils/formatters";
import type { RiskLevel } from "../../types";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const RISK_STYLES: Record<RiskLevel, string> = {
  Low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  High: "bg-orange-50 text-orange-700 border border-orange-200",
  Critical: "bg-red-50 text-red-700 border border-red-200",
};

const RISK_DOT: Record<RiskLevel, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        RISK_STYLES[level],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", RISK_DOT[level])} />
      {level}
    </span>
  );
}
