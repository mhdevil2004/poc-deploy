"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Download, Eye, Filter } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLoans } from "@/hooks/useLoans";
import { formatCurrency, formatDateTime } from "@/lib/utils/formatters";

export default function TransactionsPage() {
  const { loans, loading } = useLoans({ limit: 100 });

  const transactions = loans.map((loan) => {
    const isRejected = loan.status === "rejected" || loan.status === "defaulted";

    return {
      id: loan.id,
      applicantName: loan.applicantName,
      reference: `LN-${loan.id}`,
      type: "Loan application",
      amount: loan.amount,
      createdAt: loan.createdAt,
      status: loan.status,
      direction: isRejected ? "debit" : "credit",
    };
  });

  return (
    <DashboardLayout
      title="Transaction History"
      subtitle="Complete transaction history of last 6 months"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/loans"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#6B7280] shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-colors hover:text-[#090A0B]"
            >
              <Filter className="h-4 w-4" />
              Filter loans
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#6B7280] shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-colors hover:text-[#090A0B]"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
          <p className="text-sm text-[#9CA3AF]">{transactions.length} transactions</p>
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </td>
                  </tr>
                )}

                {!loading &&
                  transactions.map((transaction) => {
                    const DirectionIcon =
                      transaction.direction === "credit" ? ArrowUpRight : ArrowDownRight;

                    return (
                      <tr key={transaction.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-sm font-medium text-[#334155]">
                              <DirectionIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#090A0B]">
                                {transaction.applicantName}
                              </p>
                              <p className="text-xs text-[#9CA3AF]">
                                {formatDateTime(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B7280]">{transaction.type}</td>
                        <td className="px-6 py-4 text-sm font-mono text-[#9CA3AF]">
                          {transaction.reference}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-[#090A0B]">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge status={transaction.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/loans/${transaction.id}`}
                            title="View transaction"
                            aria-label={`View transaction ${transaction.reference}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#090A0B]"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {!loading && transactions.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg font-medium">No transactions found</p>
              <p className="mt-1 text-sm">Loan activity from the API will appear here.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
