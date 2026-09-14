"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Building2, Calendar, Banknote, Activity, FileText } from "lucide-react";
import { EmployeeLayout } from "../../components/layout/EmployeeLayout";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { MOCK_CUSTOMERS } from "../../mock/customers";
import { MOCK_LOANS } from "../../mock/loans";
import { useSearchParams } from "next/navigation";
import { formatIDR } from "@/lib/utils/formatters";
import { useTranslation } from "@/i18n";

type TabType = "overview" | "profile" | "financial" | "loans" | "documents" | "history";

export default function Customer360Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const initialTab = (searchParams.get("tab") as TabType) || "overview";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const customer = MOCK_CUSTOMERS.find((c) => c.customerId === id);

  if (!customer) {
    return (
      <EmployeeLayout title={t('customer360.customerNotFound')}>
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">{t('customer360.customerWithIdNotFound', { id })}</p>
          <Link href="/employee/customers" className="text-blue-600 text-sm font-semibold mt-3 inline-block">← {t('customer360.backToCustomers')}</Link>
        </div>
      </EmployeeLayout>
    );
  }

  const customerLoans = MOCK_LOANS.filter((l) => l.customerId === customer.customerId);
  const totalLoans = customerLoans.length;

  const TABS: { id: TabType; label: string }[] = [
    { id: "overview", label: t('customer360.overview') },
    { id: "profile", label: t('customer360.profileBusiness') },
    { id: "financial", label: t('customer360.financials') },
    { id: "loans", label: t('customer360.loans') },
    { id: "documents", label: t('customer360.documents') },
    { id: "history", label: t('customer360.history') },
  ];

  return (
    <EmployeeLayout title={`Profil Nasabah: ${customer.name}`} subtitle={`ID: ${customer.customerId}`}>
      <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link href="/employee/customers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> {t('customer360.backToCustomerList')}
        </Link>
        <StatusBadge status={customer.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar - High Level Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 text-2xl font-bold text-white shadow-lg shadow-blue-900/15">
                {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{customer.name}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">{customer.businessName}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{customer.businessType}</p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{t('customer360.location')}</span>
                <span className="text-sm font-bold text-slate-700 text-right">{customer.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{t('customer360.joined')}</span>
                <span className="text-sm font-bold text-slate-700 text-right">{new Date(customer.joiningDate).getFullYear()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{t('customer360.bureauScore')}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${customer.creditScore >= 720 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : customer.creditScore >= 650 ? "bg-blue-50 text-blue-700 border-blue-200" : customer.creditScore >= 550 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {customer.creditScore >= 720 ? "STRONG CREDIT" : customer.creditScore >= 650 ? "ADEQUATE CREDIT" : customer.creditScore >= 550 ? "THIN CREDIT" : "UNVERIFIED CREDIT"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{t('customer360.fintillaScore')}</span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${customer.overallScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : customer.overallScore >= 65 ? "bg-blue-50 text-blue-700 border-blue-200" : customer.overallScore >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" : customer.overallScore >= 35 ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {customer.overallScore >= 80 ? "VERIFIED-STRONG" : customer.overallScore >= 65 ? "VERIFIED-ADEQUATE" : customer.overallScore >= 50 ? "VERIFIED-THIN" : customer.overallScore >= 35 ? "UNVERIFIED" : "CONTRADICTED"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="mb-6 flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">{t('customer360.highlights')}</h3>
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('customer360.activeLoans')}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{customer.activeLoans}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('customer360.totalLoans')}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{totalLoans}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('customer360.netIncomeMo')}</p>
                    <p className="text-sm font-bold text-slate-800 mt-2">{formatIDR(customer.netIncome)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t('customer360.outstandingDebt')}</p>
                    <p className="text-sm font-bold text-slate-800 mt-2">{formatIDR(customer.outstandingLoan)}</p>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-slate-900 mt-8 mb-4">{t('customer360.recentLoanApps')}</h3>
                <div className="space-y-3">
                  {customerLoans.slice(0, 2).map(loan => (
                    <div key={loan.loanId} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/employee/assessments/${loan.loanId}`} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            {loan.loanId}
                          </Link>
                          <StatusBadge status={loan.status} />
                        </div>
                        <p className="text-xs text-slate-500">{loan.purpose}</p>
                      </div>
                      <div className="mt-3 sm:mt-0 text-left sm:text-right">
                        <p className="text-sm font-bold text-slate-800">{formatIDR(loan.amount)}</p>
                        <p className="text-[10px] text-slate-500">{loan.tenureMonths} {t('customer360.months')}</p>
                      </div>
                    </div>
                  ))}
                  {customerLoans.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">{t('customer360.noLoanApps')}</p>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE & BUSINESS */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <section>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5 border-b border-slate-100 pb-2">
                    <User className="w-5 h-5 text-blue-600" /> {t('customer360.ownerInfo')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.fullName')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.phoneNumber')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.email')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.homeAddress')}</span>
                      <span className="text-sm font-bold text-slate-800 text-right max-w-[200px]">{customer.address}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5 border-b border-slate-100 pb-2">
                    <Building2 className="w-5 h-5 text-indigo-600" /> {t('customer360.businessProfile')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.businessName')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.businessType')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.businessType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.businessEntity')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.ownershipType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.yearsInOperation')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.businessAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.operationalStatus')}</span>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{customer.businessStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.numberOfEmployees')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.employees} {t('customer360.people')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.operatingHours')}</span>
                      <span className="text-xs font-semibold text-slate-800 text-right">{customer.operatingDays}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5 border-b border-slate-100 pb-2">
                    <MapPin className="w-5 h-5 text-red-500" /> {t('customer360.businessLocation')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.street')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.street}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.village')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.village}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.district')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.city')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.province')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.province}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">{t('customer360.postalCode')}</span>
                      <span className="text-sm font-bold text-slate-800">{customer.postalCode}</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* FINANCIAL */}
            {activeTab === "financial" && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5 border-b border-slate-100 pb-2">
                  <Banknote className="w-5 h-5 text-emerald-600" /> {t('customer360.businessFinancialProfile')}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.estDailySales')}</span>
                    <span className="text-sm font-bold text-slate-800">{formatIDR(customer.dailySales)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.monthlyGrossRevenue')}</span>
                    <span className="text-sm font-bold text-slate-800">{formatIDR(customer.monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.monthlyBusinessExpenses')}</span>
                    <span className="text-sm font-bold text-red-600">-{formatIDR(customer.monthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.estMonthlyNetIncome')}</span>
                    <span className="text-sm font-bold text-emerald-600">{formatIDR(customer.netIncome)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.profitMargin')}</span>
                    <span className="text-sm font-bold text-slate-800">{customer.profitMargin}%</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5 border-b border-slate-100 pb-2 mt-8">
                  <Activity className="w-5 h-5 text-amber-600" /> {t('customer360.debtExposure')}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.remainingOutstandingDebt')}</span>
                    <span className="text-sm font-bold text-slate-800">{formatIDR(customer.outstandingLoan)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.monthlyInstallmentObligation')}</span>
                    <span className="text-sm font-bold text-red-600">-{formatIDR(customer.monthlyDebtObligation)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.remainingCapacity')}</span>
                    <span className="text-sm font-bold text-emerald-600">{formatIDR(customer.netIncome - customer.monthlyDebtObligation)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500">{t('customer360.dscr')}</span>
                    <span className={`text-sm font-bold ${(customer.netIncome / (customer.monthlyDebtObligation || 1)) >= 1.5 ? "text-emerald-600" : "text-amber-600"}`}>
                      {customer.monthlyDebtObligation === 0 ? "> 5.0" : (customer.netIncome / customer.monthlyDebtObligation).toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* LOANS */}
            {activeTab === "loans" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 mb-2">{t('customer360.loanHistory')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('customer360.loanRef')}</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('customer360.date')}</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('customer360.purpose')}</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">{t('customer360.amountIDR')}</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">{t('customer360.tenure')}</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">{t('customer360.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {customerLoans.map(loan => (
                        <tr key={loan.loanId} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-sm font-bold text-blue-600 hover:text-blue-700">
                            <Link href={`/employee/assessments/${loan.loanId}`}>{loan.loanId}</Link>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{new Date(loan.applicationDate).toLocaleDateString("id-ID")}</td>
                          <td className="px-4 py-3 text-xs text-slate-800">{loan.purpose}</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">{formatIDR(loan.amount)}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 text-center">{loan.tenureMonths} {t('customer360.months')}</td>
                          <td className="px-4 py-3 text-center"><StatusBadge status={loan.status} /></td>
                        </tr>
                      ))}
                      {customerLoans.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">{t('customer360.noLoanApps')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DOCUMENTS */}
            {activeTab === "documents" && (
              <div className="text-center py-16 bg-slate-50/50 border border-slate-100 rounded-xl">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">{t('customer360.digitalDocuments')}</h4>
                <p className="text-xs text-slate-500 mt-1">{t('customer360.docsNotUploaded')}</p>
              </div>
            )}

            {/* HISTORY */}
            {activeTab === "history" && (
              <div className="text-center py-16 bg-slate-50/50 border border-slate-100 rounded-xl">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">{t('customer360.activityHistory')}</h4>
                <p className="text-xs text-slate-500 mt-1">{t('customer360.noActivityLogs')}</p>
              </div>
            )}

          </div>
        </div>
      </div>
      </div>
    </EmployeeLayout>
  );
}
