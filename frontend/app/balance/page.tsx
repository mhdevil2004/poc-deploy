"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLoans } from "@/hooks/useLoans";
import { formatCurrency } from "@/lib/utils/formatters";

export default function BalancePage() {
  const { loans, loading } = useLoans({ limit: 100 });

  const approved = loans.filter((l) => l.status === "approved" || l.status === "active");
  const outstanding = approved.reduce((sum, loan) => sum + (loan.totalPayment || loan.amount), 0);
  const monthly = approved.reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0);

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const buckets = months.map((month) => ({ month, expense: 0 }));
    loans.forEach((loan) => {
      const month = new Date(loan.createdAt).getMonth();
      if (!Number.isNaN(month)) buckets[month].expense += loan.amount;
    });
    return buckets;
  }, [loans]);

  const maxExpense = Math.max(...chartData.map((d) => d.expense), 1);

  return (
    <DashboardLayout title="Balance" subtitle="Portfolio and repayment overview" showRightPanel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Approved balance", amount: outstanding },
          { label: "Monthly outflow", amount: monthly },
          { label: "Applications", amount: loans.length, raw: true },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <p className="text-xs text-[#9CA3AF] font-medium tracking-wide">{card.label}</p>
            <p className="text-2xl font-bold text-[#090A0B] mt-1 tracking-[-0.5px]">
              {loading ? "—" : card.raw ? card.amount : formatCurrency(card.amount as number)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-[#9CA3AF]">Balance</p>
            <p className="text-3xl font-bold text-[#090A0B] tracking-[-0.5px]">
              {loading ? "—" : formatCurrency(outstanding)}
            </p>
          </div>
          <button className="text-xs font-medium text-[#9CA3AF] bg-[#F8FAFC] px-4 py-1.5 rounded-full flex items-center gap-1">
            PAST 12 MONTHS
            <ChevronDown className="w-3 h-3" strokeWidth={2} />
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(value) => (value === 0 ? "0" : `${Math.round(value / 1000)}K`)}
              />
              <Tooltip />
              <Bar dataKey="expense" radius={[4, 4, 0, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.expense === maxExpense && entry.expense > 0 ? "#090A0B" : "#E5E7EB"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
