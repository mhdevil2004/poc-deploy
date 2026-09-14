"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, UserCircle, Command, Users, UserCheck, UserX, ShieldAlert } from "lucide-react";
import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MOCK_CUSTOMERS } from "../mock/customers";
import { MOCK_LOANS } from "../mock/loans";
import type { CustomerStatus } from "../types";

const STATUSES: (CustomerStatus | "All")[] = ["All", "Active", "Inactive", "Blacklisted"];
const BRANCHES = ["All", "Jakarta Selatan", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Makassar", "Medan", "Jakarta Timur", "Bekasi", "Jakarta Utara", "Jakarta Barat"];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "All">("All");
  const [branchFilter, setBranchFilter] = useState("All");

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchBranch = branchFilter === "All" || c.branch === branchFilter;
    return matchSearch && matchStatus && matchBranch;
  });

  return (
    <EmployeeLayout title="Customers" subtitle="View and manage customer profiles">
      <div className="mx-auto max-w-[1600px]">
      <section className="mb-7">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Customer intelligence</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Customer portfolio</h1>
        <p className="mt-2 text-sm text-slate-500">Review customer relationships, credit quality, and active lending exposure.</p>
      </section>
      {/* Stats */}
      <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Customers", value: MOCK_CUSTOMERS.length, icon: Users, color: "bg-blue-50 text-blue-700", trend: "+12%" },
          { label: "Active", value: MOCK_CUSTOMERS.filter(c => c.status === "Active").length, icon: UserCheck, color: "bg-emerald-50 text-emerald-700", trend: "+8%" },
          { label: "Inactive", value: MOCK_CUSTOMERS.filter(c => c.status === "Inactive").length, icon: UserX, color: "bg-slate-100 text-slate-600", trend: "-2%" },
          { label: "Blacklisted", value: MOCK_CUSTOMERS.filter(c => c.status === "Blacklisted").length, icon: ShieldAlert, color: "bg-red-50 text-red-700", trend: "-3%" },
        ].map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div><span className="text-[11px] font-bold text-emerald-700">{trend}</span></div>
            <p className="mt-5 text-2xl font-bold tabular-nums text-slate-950">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ID or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-20 text-sm font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm sm:flex"><Command className="h-3 w-3" /> K</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | "All")}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {BRANCHES.map((b) => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
          </select>
        </div>
        <p className="mt-3 ml-1 text-xs font-medium text-slate-500">
          Showing {filtered.length} of {MOCK_CUSTOMERS.length} customers
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><UserCircle className="h-4 w-4" /></div><div><h2 className="text-base font-bold text-slate-950">Customer registry</h2><p className="mt-1 text-xs text-slate-500">Customer profiles and lending relationships</p></div></div>
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 sm:inline-flex">{filtered.length} results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="hidden px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:table-cell">Phone</th>
                <th className="hidden px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 md:table-cell">Branch</th>
                <th className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Credit Rating</th>
                <th className="hidden px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:table-cell">Loans</th>
                <th className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((cust) => {
                const tierLabel = cust.creditScore >= 720 ? "STRONG" : cust.creditScore >= 650 ? "ADEQUATE" : cust.creditScore >= 550 ? "THIN" : "UNVERIFIED";
                const tierStyle = cust.creditScore >= 720 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : cust.creditScore >= 650 ? "bg-blue-50 text-blue-700 border-blue-200" : cust.creditScore >= 550 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200";
                const totalLoans = MOCK_LOANS.filter((loan) => loan.customerId === cust.customerId).length;

                return (
                <tr key={cust.customerId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {cust.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{cust.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{cust.customerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="text-xs text-slate-600">{cust.phone}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs text-slate-600">{cust.branch}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${tierStyle}`}>
                      {tierLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center hidden sm:table-cell">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-blue-700">{cust.activeLoans} active</span>
                      <span className="text-[10px] text-slate-400">{totalLoans} total</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={cust.status} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/employee/customers/${cust.customerId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ); })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    No customers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </EmployeeLayout>
  );
}

