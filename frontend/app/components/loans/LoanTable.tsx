"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useTranslation } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import type { Loan } from "@/types";

interface LoanTableProps {
  loans: Loan[];
  loading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete?: (id: string) => void;
}

export function LoanTable({
  loans,
  loading,
  page,
  totalPages,
  onPageChange,
  onDelete,
}: LoanTableProps) {
  const router = useRouter();
  const { t } = useTranslation();

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status styles
  const getStatusStyles = (status: string) => {
    const statusMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
      Approved: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        dot: "bg-green-400",
      },
      Rejected: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        dot: "bg-red-400",
      },
      Pending: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        dot: "bg-amber-400",
      },
      "In Progress": {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        dot: "bg-blue-400",
      },
      Completed: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        dot: "bg-emerald-400",
      },
      Default: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        dot: "bg-gray-400",
      },
    };

    return statusMap[status] || statusMap.Default;
  };

  if (loading) {
    return (
      <div className="w-full px-4 lg:px-8 py-6">
        <div className="bg-white border border-gray-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-8 py-6">
      <div className="bg-white border border-gray-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('loans.id')}</th>
                <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('loans.applicant')}</th>
                <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('loans.amount')}</th>
                <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('loans.status')}</th>
                <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('loans.date')}</th>
                <th className="py-4 px-4 lg:px-6 text-right whitespace-nowrap">{t('loans.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loans.map((loan) => {
                const statusStyles = getStatusStyles(loan.status);
                return (
                  <tr
                    key={loan.id}
                    onClick={() => router.push(`/loans/${loan.id}`)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/loans/${loan.id}`);
                      }
                    }}
                    className="hover:bg-gray-50/80 transition-colors duration-150 cursor-pointer group focus:bg-gray-50/80 focus:outline-none"
                  >
                    <td className="py-4 px-4 lg:px-6 text-gray-400 font-medium whitespace-nowrap">
                      {loan.id}
                    </td>
                    <td className="py-4 px-4 lg:px-6">
                      <div className="flex items-center gap-3">
                        {/* Premium Initials Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                          {getInitials(loan.applicantName)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-[150px] lg:max-w-[200px]">
                            {loan.applicantName}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px] lg:max-w-[200px]">
                            {loan.applicantEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 lg:px-6 font-bold text-gray-900 tabular-nums tracking-tight whitespace-nowrap">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="py-4 px-4 lg:px-6 whitespace-nowrap">
                      {/* Modern Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusStyles.bg} ${statusStyles.border} ${statusStyles.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}
                        />
                        {t(`loans.${loan.status.toLowerCase()}` as TranslationKey) || loan.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 lg:px-6 text-gray-500 font-medium whitespace-nowrap">
                      {formatDate(loan.createdAt)}
                    </td>
                    <td
                      className="py-4 px-4 lg:px-6"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {/* Ghost Action Buttons */}
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title={t('loans.view')}
                          aria-label={`${t('loans.view')} ${loan.id}`}
                          onClick={() => router.push(`/loans/${loan.id}`)}
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          title={t('loans.edit')}
                          aria-label={`${t('loans.edit')} ${loan.id}`}
                          onClick={() => router.push(`/loans/${loan.id}/edit`)}
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Edit className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            title={t('loans.delete')}
                            aria-label={`${t('loans.delete')} ${loan.id}`}
                            onClick={() => onDelete(loan.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {loans.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-gray-600">{t('loans.noLoans')}</p>
            <p className="text-sm text-gray-400 mt-1">
              {t('loans.tryAdjusting')}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 lg:px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {t('loans.pageOf', { page: String(page), total: String(totalPages) })}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                {t('loans.previous')}
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                {t('loans.next')}
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}