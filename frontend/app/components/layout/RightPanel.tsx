"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useLoans } from "@/hooks/useLoans";
import { useTranslation } from "@/i18n";

export function RightPanel() {
  const { loans } = useLoans({ limit: 100 });
  const { t } = useTranslation();

  const totalRequested = loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const approvedBalance = loans
    .filter((loan) => loan.status === "approved" || loan.status === "active")
    .reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const pendingBalance = loans
    .filter((loan) => loan.status === "pending")
    .reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const approvedRatio = totalRequested ? approvedBalance / totalRequested : 0;
  const pendingRatio = totalRequested ? pendingBalance / totalRequested : 0;
  const creditScore = Math.round(
    Math.min(99, Math.max(35, 58 + approvedRatio * 34 - pendingRatio * 12 + Math.min(loans.length, 12)))
  );
  const creditLevel = creditScore >= 80 ? "high" : creditScore >= 62 ? "medium" : "low";
  const styles = {
    high:   { text: "text-emerald-700", bg: "bg-emerald-50", bar: "from-emerald-500 to-teal-500" },
    medium: { text: "text-amber-700",   bg: "bg-amber-50",   bar: "from-amber-500 to-orange-500" },
    low:    { text: "text-rose-700",    bg: "bg-rose-50",    bar: "from-rose-500 to-red-500" },
  }[creditLevel];

  const creditLevelLabel = t(`dashboard.${creditLevel}` as Parameters<typeof t>[0]);

  return (
    <aside className="hidden xl:flex w-[320px] max-w-[320px] p-6 flex-col overflow-y-auto overflow-x-hidden flex-shrink-0 no-scrollbar">
      <div className="rounded-3xl border border-white bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {t("panel.creditCoreSystem")}
            </p>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
              {t("panel.riskLevel")}
            </h3>
          </div>
          <div className={`rounded-2xl ${styles.bg} ${styles.text} p-3`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-7">
          <p className={`text-5xl font-bold tracking-tight ${styles.text}`}>{creditLevelLabel}</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {t("panel.coreScore")} {creditScore}/100
          </p>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full bg-gradient-to-r ${styles.bar}`} style={{ width: `${creditScore}%` }} />
        </div>

        <div className="mt-6 space-y-4">
          {[
            { labelKey: "panel.approved", value: approvedBalance },
            { labelKey: "panel.pending",  value: pendingBalance },
            { labelKey: "panel.total",    value: totalRequested },
          ].map((item) => (
            <div
              key={item.labelKey}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
            >
              <span className="text-sm font-semibold text-slate-500">
                {t(item.labelKey as Parameters<typeof t>[0])}
              </span>
              <span className="text-sm font-bold text-slate-900">
                Rp {item.value.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/loans/apply"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
        >
          {t("panel.startApplication")}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
