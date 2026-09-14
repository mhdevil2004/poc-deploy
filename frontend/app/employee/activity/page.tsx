"use client";

import { EmployeeLayout } from "../components/layout/EmployeeLayout";
import { ActivitySquare, Key, FileText, UserPlus, ShieldAlert, LogIn, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";
import { getAuditLogs, type AuditEvent } from "@/lib/api/assessmentService";

// Retained only as a development reference; this screen renders persisted API logs.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_LOGS = [
  { id: "LOG-001", time: "10:45:22", date: "2026-09-03", user: "Akila", role: "Risk Analyst", action: "Status Penilaian Diperbarui", detail: "Mengubah status ASM-2026-00002 menjadi 'Under Review'", type: "update", ip: "192.168.1.102" },
  { id: "LOG-002", time: "10:30:15", date: "2026-09-03", user: "Nina Kusuma", role: "Risk Officer", action: "Penilaian Dieskalasi", detail: "Eskalasi kasus RC-2026-042 (Skor Kritis)", type: "alert", ip: "192.168.1.105" },
  { id: "LOG-003", time: "09:15:00", date: "2026-09-03", user: "Ahmad Rizki", role: "Loan Officer", action: "Dokumen Diunggah", detail: "Mengunggah Laporan Keuangan untuk CUS-ID-0012", type: "document", ip: "192.168.1.101" },
  { id: "LOG-004", time: "08:45:12", date: "2026-09-03", user: "Ahmad Rizki", role: "Loan Officer", action: "Login Sistem", detail: "Berhasil login ke Lender Portal", type: "auth", ip: "192.168.1.101" },
  { id: "LOG-005", time: "16:20:44", date: "2026-09-02", user: "Indah Permata", role: "Operations Officer", action: "Pembuatan Akun Nasabah", detail: "Mendaftarkan nasabah baru CUS-ID-0021", type: "create", ip: "192.168.1.110" },
  { id: "LOG-006", time: "15:10:33", date: "2026-09-02", user: "Akila", role: "Risk Analyst", action: "Akses Data Terbatas", detail: "Melihat riwayat kredit CUS-ID-0010", type: "access", ip: "192.168.1.102" },
  { id: "LOG-007", time: "14:05:00", date: "2026-09-02", user: "Reza Pratama", role: "Loan Officer", action: "Penilaian Selesai", detail: "Menyelesaikan penilaian ASM-2026-00016", type: "update", ip: "192.168.1.108" },
  { id: "LOG-008", time: "11:30:21", date: "2026-09-02", user: "Admin Fintilla", role: "Administrator", action: "Perubahan Konfigurasi", detail: "Memperbarui batas maksimal pembiayaan ke Rp 500.000.000", type: "system", ip: "10.0.0.5" },
];

export default function ActivityLogPage() {
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => { void getAuditLogs().then(setLogs).catch((e) => setError(e instanceof Error ? e.message : "Unable to load activity")); }, []);
  const jakartaTime = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const jakartaDate = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric" });
  const persistedLogs = logs
    .filter((log) => log.user_id !== "SYSTEM" && log.user_name.toLowerCase() !== "system" && log.role.toLowerCase() !== "system")
    .map((log) => ({
    id: log.id,
    time: jakartaTime.format(new Date(log.created_at)),
    date: jakartaDate.format(new Date(log.created_at)),
    user: log.user_name,
    role: log.role,
    action: log.action.replaceAll("_", " "),
    detail: `${log.loan_reference || log.resource} — ${log.action.replaceAll("_", " ")}`,
    type: log.action.includes("RISK") || log.action.includes("FRAUD") ? "alert" : "update",
  }));
  const displayedLogs = persistedLogs;

  return (
    <EmployeeLayout title={t('activityLog.title')} subtitle={t('activityLog.subtitle')}>
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-5 mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">{language === "en" ? "Filter Type:" : "Filter Tipe:"}</span>
        </div>
        <div className="flex gap-2">
          {["all", "auth", "update", "alert", "access"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${filter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
            >
              {f === "all" ? t('activityLog.allTypes') : f}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('activityLog.timestamp')}</th>
                <th className="px-4 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('activityLog.user')}</th>
                <th className="px-4 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('activityLog.activity')}</th>
                <th className="px-4 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('activityLog.detail')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedLogs.filter(l => filter === "all" || l.type === filter).map((log) => {
                let Icon = ActivitySquare;
                let colorClass = "text-slate-500 bg-slate-100";

                if (log.type === "auth") { Icon = LogIn; colorClass = "text-blue-500 bg-blue-50"; }
                if (log.type === "update") { Icon = FileText; colorClass = "text-emerald-500 bg-emerald-50"; }
                if (log.type === "alert") { Icon = ShieldAlert; colorClass = "text-red-500 bg-red-50"; }
                if (log.type === "access") { Icon = Key; colorClass = "text-amber-500 bg-amber-50"; }
                if (log.type === "create") { Icon = UserPlus; colorClass = "text-indigo-500 bg-indigo-50"; }

                return (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800">{log.time}</p>
                      <p className="text-[10px] text-slate-500">{log.date}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-slate-800">{log.user}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-600 truncate max-w-xs">{log.detail}</p>
                    </td>
                  </tr>
                );
              })}
              {!error && displayedLogs.filter(l => filter === "all" || l.type === filter).length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">No user activity has been recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </EmployeeLayout>
  );
}
