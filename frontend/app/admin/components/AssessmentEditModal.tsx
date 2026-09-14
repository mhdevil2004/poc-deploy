"use client";

import { useState } from "react";
import { X, CheckCircle, ShieldAlert } from "lucide-react";
import type { AdminAssessment, ScoreBand, AdminAssessmentStatus } from "../../admin-data/assessment";
import { SCORE_BAND_ORDER, SCORE_BAND_DEFINITIONS } from "../../admin-data/assessment";
import { useTranslation } from "@/i18n";

interface AssessmentEditModalProps {
  assessment: AdminAssessment;
  onClose: () => void;
  onSave: (updates: { scoreBand: ScoreBand; status: AdminAssessmentStatus; notes: string; assignedAnalyst: string }) => Promise<void>;
}

export function AssessmentEditModal({ assessment, onClose, onSave }: AssessmentEditModalProps) {
  const { language } = useTranslation();
  const [scoreBand, setScoreBand] = useState<ScoreBand>(assessment.scoreBand);
  const [status, setStatus] = useState<AdminAssessmentStatus>(assessment.status);
  const [notes, setNotes] = useState(assessment.notes);
  const [assignedAnalyst, setAssignedAnalyst] = useState(assessment.assignedAnalyst);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const t = (en: string, id: string) => (language === "en" ? en : id);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave({ scoreBand, status, notes, assignedAnalyst });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("Unable to save assessment.", "Tidak dapat menyimpan penilaian."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-violet-600" />
              {t("Edit Assessment", "Edit Penilaian")}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {assessment.loanRef} • {assessment.borrower}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Score Band */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-3">
              {t("Fintilla Score Band", "Band Penilaian Fintilla")}
            </label>
            <div className="space-y-2">
              {SCORE_BAND_ORDER.map((band) => (
                <label 
                  key={band}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    scoreBand === band 
                      ? "border-violet-600 bg-violet-50/50" 
                      : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="scoreBand"
                    value={band}
                    checked={scoreBand === band}
                    onChange={(e) => setScoreBand(e.target.value as ScoreBand)}
                    className="mt-1 w-4 h-4 text-violet-600 focus:ring-violet-500 border-slate-300"
                  />
                  <div>
                    <p className={`text-sm font-bold font-mono tracking-wide ${
                      scoreBand === band ? "text-violet-900" : "text-slate-800"
                    }`}>
                      {band}
                    </p>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      scoreBand === band ? "text-violet-700/80" : "text-slate-500"
                    }`}>
                      {language === "en" ? SCORE_BAND_DEFINITIONS[band].signal : SCORE_BAND_DEFINITIONS[band].signalId}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                {t("Status", "Status")}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminAssessmentStatus)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-2.5"
              >
                <option value="Pending">{t("Pending", "Tertunda")}</option>
                <option value="Complete">{t("Complete", "Selesai")}</option>
                <option value="Flagged">{t("Flagged", "Ditandai")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                {t("Assigned Analyst", "Analis Penugasan")}
              </label>
              <input
                value={assignedAnalyst}
                onChange={(e) => setAssignedAnalyst(e.target.value)}
                maxLength={100}
                className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-2.5"
                placeholder={t("Enter analyst name", "Masukkan nama analis")}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              {t("Analyst Notes", "Catatan Analis")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-3"
              placeholder={t("Add notes here...", "Tambahkan catatan di sini...")}
            />
          </div>
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            {t("Cancel", "Batal")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-xl shadow-sm shadow-violet-500/20 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {saving ? t("Saving…", "Menyimpan…") : t("Save Changes", "Simpan Perubahan")}
          </button>
        </div>
      </div>
    </div>
  );
}
