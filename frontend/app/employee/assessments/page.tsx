"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Eye, Pencil, Search, Trash2, X } from "lucide-react";
import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { useRequireEmployeeAuth } from "../hooks/useEmployeeAuth";
import { canDeleteAssessment, canEditAssessment } from "../lib/permissions";
import { AssessmentEditModal } from "../../admin/components/AssessmentEditModal";
import type { AdminAssessment, AdminAssessmentStatus, ScoreBand } from "../../admin-data/assessment";
import { deleteAssessment, getAssessments, updateAssessment } from "../../lib/api/assessmentService";

const STATUS_STYLE: Record<AdminAssessmentStatus, string> = { Pending: "bg-amber-50 text-amber-700 border-amber-200", Complete: "bg-emerald-50 text-emerald-700 border-emerald-200", Flagged: "bg-red-50 text-red-700 border-red-200" };

export default function AssessmentsPage() {
  const { employee } = useRequireEmployeeAuth();
  const [items, setItems] = useState<AdminAssessment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminAssessment | null>(null);

  useEffect(() => {
    let mounted = true;
    void getAssessments()
      .then((data) => { if (mounted) { setItems(data); setError(""); } })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : "Unable to load assessments"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return !query ? items : items.filter((a) => [a.loanRef, a.borrower, a.businessName, a.location].some((v) => v.toLowerCase().includes(query)));
  }, [items, search]);
  const save = async (updates: { scoreBand: ScoreBand; status: AdminAssessmentStatus; notes: string; assignedAnalyst: string }) => {
    if (!editing) return;
    const saved = await updateAssessment(editing.id, updates);
    setItems((current) => current.map((item) => item.id === saved.id ? saved : item));
    setEditing(null);
  };
  const remove = async (assessment: AdminAssessment) => {
    if (!confirm(`Delete assessment ${assessment.loanRef}?`)) return;
    try { await deleteAssessment(assessment.id); setItems((current) => current.filter((item) => item.id !== assessment.id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to delete assessment"); }
  };
  const mayEdit = employee ? canEditAssessment(employee.role) : false;
  const mayDelete = employee ? canDeleteAssessment(employee.role) : false;
  const pendingCount = items.filter((item) => item.status === "Pending").length;
  const flaggedCount = items.filter((item) => item.status === "Flagged").length;
  const completedCount = items.filter((item) => item.status === "Complete").length;

  return <EmployeeLayout title="Assessments" subtitle="Review and manage loan assessments">
    <div className="mx-auto max-w-[1600px]">
      <section className="mb-7">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Credit operations</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Assessment workspace</h1>
        <p className="mt-2 text-sm text-slate-500">Review live applications, score bands, and decision status.</p>
      </section>
      <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total assessments", value: items.length, style: "bg-blue-50 text-blue-700", icon: ClipboardList }, { label: "Pending review", value: pendingCount, style: "bg-amber-50 text-amber-700", icon: Search }, { label: "Completed", value: completedCount, style: "bg-emerald-50 text-emerald-700", icon: Eye }, { label: "Flagged", value: flaggedCount, style: "bg-red-50 text-red-700", icon: X }].map(({ label, value, style, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style}`}><Icon className="h-5 w-5" /></div><p className="mt-5 text-2xl font-bold tabular-nums text-slate-950">{loading ? "—" : value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></article>)}
      </section>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ClipboardList className="h-4 w-4" /></div><div><div className="flex items-center gap-2"><h2 className="text-base font-bold text-slate-950">Assessment registry</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{filtered.length} of {items.length}</span></div><p className="mt-1 text-xs text-slate-500">Live records from the assessment service</p></div></div>
        <div className="relative w-full sm:w-80"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search loan, applicant, business..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-9 text-sm font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><X className="h-4 w-4" /></button>}</div>
      </div>
      {error && <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto"><table className="min-w-[900px] w-full whitespace-nowrap text-left"><thead><tr className="border-b border-slate-100 bg-slate-50/70"><th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Loan reference & applicant</th><th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</th><th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</th><th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Assessment band</th><th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th><th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading ? <tr><td colSpan={6} className="p-10 text-center text-sm text-slate-400">Loading assessments...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="p-10 text-center text-sm text-slate-400">No assessments found.</td></tr> : filtered.map((a) => <tr key={a.id} className="hover:bg-slate-50/60"><td className="px-6 py-4"><p className="font-mono text-xs font-bold text-blue-700">{a.loanRef}</p><p className="mt-1 text-sm font-semibold text-slate-800">{a.borrower}</p><p className="text-xs text-slate-400">{a.businessName} · {a.businessType}</p></td><td className="px-4 py-4 text-sm text-slate-600">{a.location}</td><td className="px-4 py-4 text-sm text-slate-600">{a.assessmentDate}</td><td className="px-4 py-4"><span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-mono font-bold text-blue-700">{a.scoreBand}</span></td><td className="px-4 py-4"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${STATUS_STYLE[a.status]}`}>{a.status}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-2">{mayEdit ? <button onClick={() => setEditing(a)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Pencil className="w-4 h-4" />Edit</button> : <Link href={`/employee/assessments/${a.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Eye className="w-4 h-4" />View</Link>}{mayDelete && <button onClick={() => void remove(a)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" />Delete</button>}</div></td></tr>)}
      </tbody></table></div>
    </div>
    </div>
    {editing && <AssessmentEditModal assessment={editing} onClose={() => setEditing(null)} onSave={save} />}
  </EmployeeLayout>;
}
