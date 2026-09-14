"use client";

import React from "react";
import type { ScoreBand } from "../../admin-data/assessment";
import { SCORE_BAND_DEFINITIONS } from "../../admin-data/assessment";

interface ScoreBandBadgeProps {
  band: ScoreBand;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

const BAND_STYLES: Record<ScoreBand, { bg: string; text: string; border: string; dot: string }> = {
  "VERIFIED-STRONG": {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  "VERIFIED-ADEQUATE": {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  "VERIFIED-THIN": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  UNVERIFIED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    dot: "bg-slate-500",
  },
  CONTRADICTED: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[10px] font-bold tracking-wide",
  md: "px-2.5 py-1 text-xs font-bold tracking-wide",
  lg: "px-3 py-1.5 text-sm font-bold tracking-wider",
};

export function ScoreBandBadge({ band, showDescription = false, size = "md" }: ScoreBandBadgeProps) {
  const styles = BAND_STYLES[band];
  const def = SCORE_BAND_DEFINITIONS[band];

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${SIZE_CLASSES[size]} font-mono`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
        {band}
      </span>
      {showDescription && (
        <p className="text-xs text-slate-500 leading-relaxed">{def.signal}</p>
      )}
    </div>
  );
}

/** Large card for assessment detail page */
export function ScoreBandCard({ band, language = "en" }: { band: ScoreBand; language?: "en" | "id" }) {
  const styles = BAND_STYLES[band];
  const def = SCORE_BAND_DEFINITIONS[band];
  const description = language === "id" ? def.signalId : def.signal;

  return (
    <div className={`rounded-2xl border-2 ${styles.border} ${styles.bg} p-5`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${styles.text} opacity-70`}>
        {language === "id" ? "Band Penilaian" : "Assessment Band"}
      </p>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
        <span className={`text-base font-black tracking-wide ${styles.text} font-mono`}>{band}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-700">{language === "id" ? "Sinyal: " : "Signal: "}</span>
        {description}
      </p>
    </div>
  );
}
