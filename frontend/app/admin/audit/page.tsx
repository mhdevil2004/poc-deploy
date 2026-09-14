"use client";

import { useEffect, useState } from "react";
import { BookOpen, ArrowUpDown, Search } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";
import { getAuditLogs, type AuditEvent } from "../../lib/api/assessmentService";
import { formatWIBTimestamp } from "../../admin-lib/dateTime";
import { useTranslation } from "@/i18n";

const ACTION_LABELS: Record<string, { en: string; id: string; color: string }> = {
  LOGIN:                 { en: "Login",              id: "Masuk",               color: "bg-emerald-100 text-emerald-700" },
  LOGOUT:                { en: "Logout",             id: "Keluar",              color: "bg-slate-100 text-slate-600" },
  MFA_VERIFIED:          { en: "MFA Verified",       id: "MFA Terverifikasi",   color: "bg-blue-100 text-blue-700" },
  VIEWED_ASSESSMENT:     { en: "Viewed",             id: "Dilihat",             color: "bg-slate-100 text-slate-600" },
  UPDATED_SCORE_BAND:    { en: "Score Band Updated", id: "Band Diperbarui",     color: "bg-violet-100 text-violet-700" },
  UPDATED_STATUS:        { en: "Status Updated",     id: "Status Diperbarui",   color: "bg-amber-100 text-amber-700" },
  UPDATED_NOTES:         { en: "Notes Updated",      id: "Catatan Diperbarui",  color: "bg-indigo-100 text-indigo-700" },
  UPDATED_ASSESSMENT:    { en: "Assessment Updated",  id: "Penilaian Diperbarui",color: "bg-violet-100 text-violet-700" },
  DELETED_ASSESSMENT:    { en: "Assessment Deleted",  id: "Penilaian Dihapus",   color: "bg-red-100 text-red-700" },
};

const ROLE_STYLES: Record<string, string> = {
  "Administrator":    "bg-violet-100 text-violet-700",
  "Risk Officer":     "bg-blue-100 text-blue-700",
  "Underwriter":      "bg-emerald-100 text-emerald-700",
  "Read-Only Auditor":"bg-slate-100 text-slate-600",
};

const AUDITED_FIELDS: Array<[string, string]> = [
  ["score_band", "Score band"],
  ["status", "Status"],
  ["notes", "Notes"],
  ["assigned_analyst", "Assigned analyst"],
];

function changedFields(event: AuditEvent) {
  const previous = event.previous_value as Record<string, unknown> | null;
  const next = event.new_value as Record<string, unknown> | null;
  if (!previous || !next || typeof previous !== "object" || typeof next !== "object") return [];
  return AUDITED_FIELDS.flatMap(([key, label]) => previous[key] === next[key] ? [] : [{ label, before: String(previous[key] ?? ""), after: String(next[key] ?? "") }]);
}

export default function AdminAuditPage() {
  const { language } = useTranslation();
  const [searchUser, setSearchUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState("");

  const t = (en: string, id: string) => language === "en" ? en : id;

  // Sort newest first
  useEffect(()=>{getAuditLogs().then(setEvents).catch(e=>setError(e.message))},[]);
  const filtered = events.filter((e) => {
      if (searchUser && !e.user_name.toLowerCase().includes(searchUser.toLowerCase()) && !e.loan_reference?.toLowerCase().includes(searchUser.toLowerCase())) return false;
      if (filterAction && e.action !== filterAction) return false;
      // Date range based on timestamp
      const ts = e.created_at.substring(0, 10); // "YYYY-MM-DD"
      if (startDate && ts < startDate) return false;
      if (endDate && ts > endDate) return false;
      return true;
    });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-violet-600" />
          {t("Audit Log", "Log Audit")}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {t("All administrative actions are recorded with WIB timestamps.", "Semua tindakan administratif dicatat dengan stempel waktu WIB.")}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("Search user or loan ref...", "Cari pengguna atau ref pinjaman...")}
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Action filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
          >
            <option value="">{t("All Actions", "Semua Tindakan")}</option>
            {Object.entries(ACTION_LABELS).map(([val, labels]) => (
              <option key={val} value={val}>{t(labels.en, labels.id)}</option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3" />
          {filtered.length} {t("events (newest first)", "kejadian (terbaru dahulu)")}
          {" • "}{t("All timestamps in", "Semua stempel waktu dalam")} <span className="font-bold text-slate-600">WIB (Asia/Jakarta, UTC+7)</span>
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {error && <div className="p-4 text-sm text-red-700 bg-red-50">{error}</div>}
        {/* Table header */}
        <div className="hidden lg:grid lg:grid-cols-[0.8fr_1.2fr_1fr_0.8fr_1.1fr_0.7fr_1.5fr] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
          {[
            t("Audit ID", "ID Audit"),
            t("Timestamp (WIB)", "Waktu (WIB)"),
            t("User", "Pengguna"),
            t("Role", "Peran"),
            t("Action", "Tindakan"),
            t("Loan Ref", "Ref Pinjaman"),
            t("Changes", "Perubahan"),
          ].map((col, i) => (
            <div key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col}</div>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t("No audit events match your filters.", "Tidak ada kejadian audit yang sesuai filter Anda.")}
            </div>
          ) : (
            filtered.map((event) => {
              const actionMeta = ACTION_LABELS[event.action];
              const changes = changedFields(event);
              return (
                <div
                  key={event.id}
                  className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr_1fr_0.8fr_1.1fr_0.7fr_1.5fr] gap-2 lg:gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Audit ID */}
                  <div className="flex items-center">
                    <span className="text-xs font-mono font-bold text-slate-500">{event.id}</span>
                  </div>

                  {/* Timestamp - WIB explicitly */}
                  <div className="flex items-center">
                    <span className="text-xs font-mono text-slate-700">
                      {formatWIBTimestamp(event.created_at)}
                    </span>
                  </div>

                  {/* User */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-violet-700">
                        {event.user_name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{event.user_name}</span>
                  </div>

                  {/* Role */}
                  <div className="flex items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLES[event.role] ?? "bg-slate-100 text-slate-600"}`}>
                      {event.role}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionMeta?.color ?? "bg-slate-100 text-slate-600"}`}>
                      {t(actionMeta?.en ?? event.action, actionMeta?.id ?? event.action)}
                    </span>
                  </div>

                  {/* Loan Ref */}
                  <div className="flex items-center">
                    {event.loan_reference ? (
                      <a
                        href={`/admin/assessments`}
                        className="text-xs font-mono text-violet-600 hover:text-violet-700 font-bold"
                      >
                        {event.loan_reference}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>

                  {/* Changes */}
                  <div className="flex items-center">
                    {changes.length > 0 ? (
                      <div className="space-y-1 text-[10px]">
                        {changes.map((change) => <div key={change.label} className="flex items-center gap-1 flex-wrap"><span className="font-semibold text-slate-500">{change.label}:</span><span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded line-through break-all">{change.before || "-"}</span><span className="text-slate-400">to</span><span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded break-all">{change.after || "-"}</span></div>)}
                      </div>
                    ) : event.previous_value && event.new_value ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded line-through">{JSON.stringify(event.previous_value).substring(0, 25)}</span>
                        <span className="text-[10px] text-slate-400">→</span>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{JSON.stringify(event.new_value).substring(0, 25)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
