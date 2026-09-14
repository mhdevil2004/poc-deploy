"use client";

import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { FileBarChart, PieChart, BarChart3, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function ReportsPage() {
  const { t } = useTranslation();
  return (
    <EmployeeLayout title={t('reports.title')} subtitle={t('reports.subtitle')}>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: t('reports.totalFundingDisbursed'), value: t('reports.idr12_5Billion'), trend: "+14%", isUp: true },
          { title: t('reports.npl'), value: "1.2%", trend: "-0.3%", isUp: true },
          { title: t('reports.avgFintillaScore'), value: "74/100", trend: t('reports.plus2Points'), isUp: true },
          { title: t('reports.approvalRate'), value: "68%", trend: "-2%", isUp: false },
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.title}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] min-h-[300px] flex flex-col items-center justify-center text-center">
          <PieChart className="w-12 h-12 text-slate-200 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">{t('reports.portfolioRiskDistribution')}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('reports.chartsDisclaimer')}</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] min-h-[300px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-slate-200 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">{t('reports.distributionBySector')}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('reports.chartsDisclaimer')}</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] min-h-[300px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-slate-200 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">{t('reports.nplTrend')}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('reports.chartsDisclaimer')}</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] min-h-[300px] flex flex-col items-center justify-center text-center">
          <FileBarChart className="w-12 h-12 text-slate-200 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">{t('reports.analystPerformance')}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{t('reports.chartsDisclaimer')}</p>
        </div>
      </div>
    </EmployeeLayout>
  );
}
