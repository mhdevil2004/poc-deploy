"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, User, TrendingUp, AlertTriangle, Flag, StickyNote, Pencil, Shield, Ban, Trash2 } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";
import { ScoreBandBadge, ScoreBandCard } from "../../components/ScoreBandBadge";
import { AssessmentEditModal } from "../../components/AssessmentEditModal";
import { type ScoreBand, type AdminAssessmentStatus, type AdminAssessment } from "../../../admin-data/assessment";
import { formatAssessmentDate } from "../../../admin-lib/dateTime";
import { canEditAssessment } from "../../../admin-lib/permissions";
import { deleteAssessment, getAssessment, updateAssessment } from "../../../lib/api/assessmentService";
import { useRequireAdminAuth } from "../../hooks/useAdminAuth";
import { useTranslation } from "@/i18n";
import { formatIDR } from "@/lib/utils/formatters";

const STATUS_STYLES: Record<AdminAssessmentStatus, string> = {
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  Complete: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Flagged: "bg-red-50 text-red-800 border-red-200",
};

export default function AdminAssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useRequireAdminAuth();
  const { language } = useTranslation();
  
  const [assessmentData, setAssessmentData] = useState<AdminAssessment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { getAssessment(id).then(setAssessmentData).catch((e) => setError(e.message)); }, [id]);

  const t = (en: string, id: string) => language === "en" ? en : id;

  if (!assessmentData) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">{t("Assessment not found.", "Penilaian tidak ditemukan.")}</p>
          <Link href="/admin/assessments" className="text-violet-600 text-sm font-semibold mt-3 inline-block">
            ← {t("Back to Assessments", "Kembali ke Penilaian")}
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const canEdit = user ? canEditAssessment(user.role) : false;

  const handleSave = async (updates: { scoreBand: ScoreBand; status: AdminAssessmentStatus; notes: string; assignedAnalyst: string }) => {
    if (!assessmentData) throw new Error("Assessment not loaded");
    const updated = await updateAssessment(id, updates);
    setAssessmentData(updated);
    setEditOpen(false);
    setError("");
  };
  const handleDelete = async () => { if (!confirm(t("Delete this assessment? This cannot be undone.", "Hapus penilaian ini? Tindakan ini tidak dapat dibatalkan."))) return; try { await deleteAssessment(id); window.location.assign("/admin/assessments"); } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete assessment"); } };

  return (
    <AdminLayout>
      {/* Back + Edit */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/assessments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Back to Assessments", "Kembali ke Penilaian")}
        </Link>

        {canEdit ? (
          <div className="flex gap-2"><button
            id="admin-edit-assessment-btn"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-violet-500/20 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            {t("Edit Assessment", "Edit Penilaian")}
          </button>{user?.role === "Administrator" && <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"><Trash2 className="w-4 h-4" />{t("Delete", "Hapus")}</button>}</div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 text-sm font-semibold rounded-xl border border-slate-200 cursor-not-allowed select-none">
            <Ban className="w-4 h-4" />
            {t("View Only", "Hanya Lihat")}
          </div>
        )}
      </div>
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Summary card ── */}
        <div className="space-y-4">
          {/* Identity card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t("Loan Reference", "Referensi Pinjaman")}
                </p>
                <p className="text-base font-black text-violet-700 font-mono">{assessmentData.loanRef}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[assessmentData.status]}`}>
                {assessmentData.status === "Pending" ? t("Pending", "Tertunda")
                  : assessmentData.status === "Complete" ? t("Complete", "Selesai")
                  : t("Flagged", "Ditandai")}
              </span>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">{t("Borrower", "Peminjam")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{assessmentData.borrower}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-medium">{t("Business", "Usaha")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{assessmentData.businessName}</p>
                    <p className="text-[10px] text-slate-500">{assessmentData.businessType}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-medium">{t("Location", "Lokasi")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-sm text-slate-700">{assessmentData.location}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-medium">{t("Assessment Date", "Tanggal Penilaian")}</p>
                <p className="text-sm font-mono text-slate-700 mt-0.5">
                  {formatAssessmentDate(assessmentData.assessmentDate)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-medium">{t("Assigned Analyst", "Analis Penugasan")}</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{assessmentData.assignedAnalyst}</p>
              </div>
            </div>
          </div>

          {/* Score Band Card */}
          <ScoreBandCard band={assessmentData.scoreBand} language={language as "en" | "id"} />

          {/* Read-Only notice for auditor */}
          {!canEdit && user && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">
                  {t("Read-Only Access", "Akses Hanya Baca")}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {t(
                    `Your role (${user.role}) does not have permission to edit assessments.`,
                    `Peran Anda (${user.role}) tidak memiliki izin untuk mengedit penilaian.`
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Details ── */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Financials */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              {t("Financial Overview", "Ringkasan Keuangan")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: t("Requested Amount", "Jumlah Pengajuan"), value: formatIDR(assessmentData.requestedAmount) },
                { label: t("Tenor", "Tenor"), value: `${assessmentData.tenureMonths} ${t("months", "bulan")}` },
                { label: t("Monthly Revenue", "Pendapatan Bulanan"), value: formatIDR(assessmentData.monthlyRevenue) },
                { label: t("Existing Debt", "Utang Berjalan"), value: assessmentData.existingDebt > 0 ? formatIDR(assessmentData.existingDebt) : t("None", "Tidak ada") },
                { label: t("Credit Bureau Score", "Skor Biro Kredit"), value: `${assessmentData.creditBureauScore}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t("Risk Factors", "Faktor Risiko")} ({assessmentData.riskFactors.length})
            </h3>
            {assessmentData.riskFactors.length === 0 ? (
              <p className="text-sm text-slate-400">{t("No risk factors identified.", "Tidak ada faktor risiko yang teridentifikasi.")}</p>
            ) : (
              <ul className="space-y-2">
                {assessmentData.riskFactors.map((rf, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                    <span className="text-sm text-slate-700">{rf}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Red Flags */}
          {assessmentData.flags.length > 0 && (
            <div className="bg-red-50/70 rounded-2xl border border-red-200/60 p-5">
              <h3 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-600" />
                {t("Red Flags", "Tanda Bahaya")} ({assessmentData.flags.length})
              </h3>
              <div className="space-y-3">
                {assessmentData.flags.map((flag, i) => (
                  <div key={i} className="bg-white/80 rounded-xl p-3.5 border border-red-100 flex gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${flag.severity === "Critical" ? "bg-red-600" : flag.severity === "High" ? "bg-orange-500" : "bg-amber-500"}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800">{flag.type}</p>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          flag.severity === "Critical" ? "bg-red-100 text-red-700" : flag.severity === "High" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{flag.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyst Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-slate-500" />
              {t("Analyst Notes", "Catatan Analis")}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{assessmentData.notes}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <AssessmentEditModal
          assessment={assessmentData}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
