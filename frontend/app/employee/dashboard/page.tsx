"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Command,
  FileText,
  MapPin,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { useRequireEmployeeAuth } from "../hooks/useEmployeeAuth";
import { useTranslation } from "@/i18n";
import { formatIDR } from "@/lib/utils/formatters";
import { getEmployeePortfolio, type EmployeePortfolioRecord } from "@/lib/api/assessmentService";

type Band = EmployeePortfolioRecord["scoreBand"];

const bandStyle: Record<Band, string> = {
  "VERIFIED-STRONG": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "VERIFIED-ADEQUATE": "border-blue-200 bg-blue-50 text-blue-700",
  "VERIFIED-THIN": "border-amber-200 bg-amber-50 text-amber-700",
  UNVERIFIED: "border-slate-200 bg-slate-100 text-slate-700",
  CONTRADICTED: "border-red-200 bg-red-50 text-red-700",
};

const statusStyle: Record<EmployeePortfolioRecord["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  complete: "bg-emerald-50 text-emerald-700",
  flagged: "bg-red-50 text-red-700",
};

const statusLabel: Record<EmployeePortfolioRecord["status"], string> = {
  pending: "Pending",
  complete: "Complete",
  flagged: "Flagged",
};

function riskForBand(band: Band) {
  if (band === "CONTRADICTED") return "Critical";
  if (band === "UNVERIFIED") return "High";
  if (band === "VERIFIED-THIN") return "Medium";
  return "Low";
}

function group(records: EmployeePortfolioRecord[], key: (record: EmployeePortfolioRecord) => string) {
  return records.reduce((all, record) => {
    const name = key(record);
    all[name] = (all[name] || 0) + 1;
    return all;
  }, {} as Record<string, number>);
}

function formatBand(band: Band) {
  return band.toLowerCase().replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { employee } = useRequireEmployeeAuth();
  const { language: lang, t } = useTranslation();
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<EmployeePortfolioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getEmployeePortfolio()
      .then((data) => {
        setRecords(data);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("business-search")?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const riskCount = useMemo(
    () => records.filter((item) => ["High", "Critical"].includes(riskForBand(item.scoreBand))).length,
    [records]
  );
  const businessTypes = useMemo(() => group(records, (item) => item.businessType), [records]);
  const regions = useMemo(
    () => group(records, (item) => item.location.split(",").at(-1)?.trim() || item.location),
    [records]
  );
  const financing = records.reduce((total, item) => total + item.requestedAmount, 0);
  const pendingCount = records.filter((item) => item.status === "pending").length;
  const topBusinessTypes = Object.entries(businessTypes).sort(([, left], [, right]) => right - left).slice(0, 5);
  const maxBusinessCount = Math.max(...topBusinessTypes.map(([, count]) => count), 1);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const metrics = [
    { label: t("employeeDashboard.totalBusinessCustomers"), value: records.length.toString(), trend: "+12%", detail: "from last month", icon: Users, iconStyle: "bg-blue-50 text-blue-700", featured: false },
    { label: lang === "en" ? "Applications Under Review" : "Pengajuan Dalam Tinjauan", value: pendingCount.toString(), trend: "+8%", detail: "from last month", icon: FileText, iconStyle: "bg-emerald-50 text-emerald-700", featured: false },
    { label: lang === "en" ? "Pending Assessments" : "Penilaian Tertunda", value: pendingCount.toString(), trend: "+5%", detail: "from last month", icon: ClipboardList, iconStyle: "bg-amber-50 text-amber-700", featured: false },
    { label: lang === "en" ? "High Risk Businesses" : "Usaha Risiko Tinggi", value: riskCount.toString(), trend: "-3%", detail: "from last month", icon: AlertTriangle, iconStyle: "bg-red-50 text-red-700", featured: false },
    { label: t("employeeDashboard.totalFundingDisbursed"), value: formatIDR(financing), trend: "+18%", detail: "from last month", icon: Activity, iconStyle: "bg-indigo-50 text-indigo-700", featured: true },
  ] as const;

  return (
    <EmployeeLayout title={`Dashboard - ${employee?.role || "Loan Officer"}`} subtitle={t("employeeDashboard.subtitle")}>
      <div className="mx-auto max-w-[1600px] pb-10">
        <section className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{greeting}, {employee?.name?.split(" ")[0] || "there"}</h1>
        </section>

        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form onSubmit={(event) => { event.preventDefault(); if (query.trim()) router.push(`/employee/search?q=${encodeURIComponent(query)}`); }} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input id="business-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("employeeDashboard.searchPlaceholder")} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-24 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm sm:flex"><Command className="h-3 w-3" /> K</span>
            </div>
            <button className="h-12 rounded-xl bg-slate-950 px-7 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">{lang === "en" ? "Search portfolio" : "Cari portofolio"}</button>
          </form>
        </section>

        {error && <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
          {metrics.map(({ label, value, trend, detail, icon: Icon, iconStyle, featured }) => (
            <article key={label} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${featured ? "sm:col-span-2 xl:col-span-4" : "xl:col-span-2"}`}>
              <div className="flex items-start justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}><Icon className="h-5 w-5" /></div><span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700"><TrendingUp className="h-3.5 w-3.5" />{trend}</span></div>
              <p className={`mt-5 truncate font-bold tabular-nums tracking-tight text-slate-950 ${featured ? "text-2xl sm:text-3xl" : "text-2xl"}`}>{loading ? "—" : value}</p>
              <div className="mt-2 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-500">{label}</p><span className="hidden text-[10px] text-slate-400 sm:inline">{detail}</span></div>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><div className="flex items-center gap-2"><h2 className="text-base font-bold text-slate-950">Recent applications</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{records.length} total</span></div><p className="mt-1 text-xs text-slate-500">Live records from the assessment service</p></div><Link href="/employee/assessments" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link></header>
            <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-3.5 font-bold">Applicant & business</th><th className="px-4 py-3.5 font-bold">Location</th><th className="px-4 py-3.5 text-right font-bold">Requested</th><th className="px-4 py-3.5 text-center font-bold">Score</th><th className="px-4 py-3.5 text-center font-bold">Risk</th><th className="px-6 py-3.5 text-center font-bold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-500">Loading applications...</td></tr> : records.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-500">No applications found.</td></tr> : records.map((record) => <tr key={record.id} className="transition hover:bg-slate-50/80"><td className="px-6 py-4"><Link href={`/employee/assessments/${record.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-700">{record.borrower}</Link><p className="mt-1 text-xs font-medium text-slate-600">{record.businessName} · {record.businessType}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{record.loanReference}</p></td><td className="px-4 py-4 text-xs font-medium text-slate-600">{record.location}</td><td className="px-4 py-4 text-right text-sm font-extrabold tabular-nums text-slate-950">{formatIDR(record.requestedAmount)}</td><td className="px-4 py-4 text-center"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${bandStyle[record.scoreBand]}`}>{formatBand(record.scoreBand)}</span></td><td className="px-4 py-4 text-center text-xs font-semibold text-slate-700">{riskForBand(record.scoreBand)}</td><td className="px-6 py-4 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[record.status]}`}>{statusLabel[record.status]}</span></td></tr>)}</tbody></table></div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-sm font-bold text-slate-950">Risk Band Distribution</h2><p className="mt-1 text-xs text-slate-500">Applications by sector</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Building2 className="h-4 w-4" /></div></div><div className="space-y-4">{topBusinessTypes.length === 0 ? <p className="text-sm text-slate-500">No business data available.</p> : topBusinessTypes.map(([name, count], index) => <div key={name}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-700">{name}</span><span className="font-bold tabular-nums text-slate-500">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${["bg-blue-600", "bg-emerald-500", "bg-indigo-500", "bg-amber-500", "bg-slate-500"][index]}`} style={{ width: `${Math.round((count / maxBusinessCount) * 100)}%` }} /></div></div>)}</div></section>
            <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300"><CheckCircle2 className="h-5 w-5" /></div><div><h2 className="text-sm font-bold">Portfolio health</h2><p className="text-xs text-slate-400">Current risk snapshot</p></div></div><div className="flex items-end justify-between"><div><p className="text-3xl font-bold tabular-nums">{records.length ? Math.round(((records.length - riskCount) / records.length) * 100) : 0}%</p><p className="mt-1 text-xs text-slate-400">low-risk coverage</p></div><Link href="/employee/risk" className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:text-white">Review risk <ChevronRight className="h-3.5 w-3.5" /></Link></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${records.length ? ((records.length - riskCount) / records.length) * 100 : 0}%` }} /></div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /><h2 className="text-sm font-bold text-slate-950">Regional coverage</h2></div><div className="space-y-3">{Object.entries(regions).slice(0, 4).map(([name, count]) => <div key={name} className="flex items-center justify-between text-xs"><span className="font-medium text-slate-600">{name}</span><span className="font-bold tabular-nums text-slate-900">{count}</span></div>)}</div></section>
          </aside>
        </div>
      </div>
    </EmployeeLayout>
  );
}
