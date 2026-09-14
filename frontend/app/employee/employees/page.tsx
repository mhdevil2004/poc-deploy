"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpRight } from "lucide-react";
import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MOCK_EMPLOYEES } from "../mock/employees";
import type { EmployeeRole, EmployeeStatus } from "../types";

const ROLES: (EmployeeRole | "All")[] = [
  "All",
  "Administrator",
  "Branch Manager",
  "Loan Officer",
  "Underwriter",
  "Risk Officer",
  "Risk Analyst",
  "Operations Officer",
  "Read-Only Auditor",
];

const STATUSES: (EmployeeStatus | "All")[] = ["All", "Active", "Inactive", "On Leave"];
const BRANCHES = ["All", "Chennai Central", "Nagercoil", "Thoothukudi", "Coimbatore", "Madurai", "Head Office"];

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "All">("All");
  const [branchFilter, setBranchFilter] = useState("All");

  const filtered = MOCK_EMPLOYEES.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || emp.role === roleFilter;
    const matchStatus = statusFilter === "All" || emp.status === statusFilter;
    const matchBranch = branchFilter === "All" || emp.branch === branchFilter;
    return matchSearch && matchRole && matchStatus && matchBranch;
  });

  return (
    <EmployeeLayout title="Employees" subtitle="Manage bank staff and their details">
      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as EmployeeRole | "All")}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | "All")}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {BRANCHES.map((b) => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-2.5 ml-1">
          Showing {filtered.length} of {MOCK_EMPLOYEES.length} employees
        </p>
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Branch</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Cases</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{emp.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs text-slate-600">{emp.department}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs text-slate-600">{emp.branch}</span>
                  </td>
                  <td className="px-4 py-4 text-center hidden sm:table-cell">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold text-amber-700">{emp.pendingCases} pending</span>
                      <span className="text-[10px] text-slate-400">{emp.completedCases} done</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/employee/employees/${emp.employeeId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    No employees match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </EmployeeLayout>
  );
}
