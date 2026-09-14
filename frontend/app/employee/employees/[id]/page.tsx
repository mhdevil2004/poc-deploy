"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, Building2, Briefcase, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { EmployeeLayout } from "../../components/layout/EmployeeLayout";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { MOCK_EMPLOYEES } from "../../mock/employees";
import { MOCK_LOANS } from "../../mock/loans";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const emp = MOCK_EMPLOYEES.find((e) => e.employeeId === id);

  if (!emp) {
    return (
      <EmployeeLayout title="Employee Not Found">
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">Employee &quot;{id}&quot; not found.</p>
          <Link href="/employee/employees" className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-3 inline-block">
            ← Back to Employees
          </Link>
        </div>
      </EmployeeLayout>
    );
  }

  const assignedLoans = MOCK_LOANS.filter((l) => l.assignedEmployeeId === emp.employeeId);

  return (
    <EmployeeLayout title={emp.name} subtitle={`${emp.role} — ${emp.branch}`}>
      <div className="mb-6">
        <Link href="/employee/employees" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 mb-4">
                {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{emp.name}</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">{emp.employeeId}</p>
              <div className="mt-3">
                <StatusBadge status={emp.status} />
              </div>
              <div className="mt-3 bg-slate-100 rounded-xl px-4 py-1.5">
                <span className="text-xs font-bold text-slate-700">{emp.role}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 text-xs break-all">{emp.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 text-xs">{emp.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 text-xs">{emp.branch}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 text-xs">{emp.department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 text-xs">Joined {emp.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-blue-700">{emp.assignedLoans}</p>
                  <p className="text-[10px] text-blue-500">Assigned Loans</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-700">{emp.pendingCases}</p>
                  <p className="text-[10px] text-amber-500">Pending Cases</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-700">{emp.completedCases}</p>
                  <p className="text-[10px] text-emerald-500">Completed Cases</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Loans */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Assigned Loan Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">{assignedLoans.length} total assigned</p>
          </div>
          {assignedLoans.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No loans assigned yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assignedLoans.map((loan) => (
                    <tr key={loan.loanId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link href={`/employee/lending/${loan.loanId}`} className="text-blue-600 hover:text-blue-700 font-semibold text-xs">
                          {loan.loanId}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-800 font-semibold text-xs">{loan.customerName}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-xs font-bold text-slate-800">
                          ₹{new Intl.NumberFormat("en-IN").format(loan.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-xs text-slate-400">{loan.applicationDate}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
