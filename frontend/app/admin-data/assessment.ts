// Presentation types and canonical Fintilla band definitions. Assessment
// records themselves are loaded exclusively from the Go API.
export type ScoreBand = "VERIFIED-STRONG" | "VERIFIED-ADEQUATE" | "VERIFIED-THIN" | "UNVERIFIED" | "CONTRADICTED";
export type AdminAssessmentStatus = "Pending" | "Complete" | "Flagged";
export interface AdminAssessment {
  id: string; loanRef: string; borrower: string; businessName: string; businessType: string; location: string;
  province: string; city: string; assessmentDate: string; status: AdminAssessmentStatus; scoreBand: ScoreBand;
  requestedAmount: number; notes: string; tenureMonths: number; monthlyRevenue: number; existingDebt: number;
  creditBureauScore: number; assignedAnalyst: string; riskFactors: string[];
  flags: { type: string; severity: "Low" | "Medium" | "High" | "Critical"; description: string }[];
}
export const SCORE_BAND_ORDER: ScoreBand[] = ["VERIFIED-STRONG", "VERIFIED-ADEQUATE", "VERIFIED-THIN", "UNVERIFIED", "CONTRADICTED"];
export const SCORE_BAND_DEFINITIONS: Record<ScoreBand, { signal: string; signalId: string }> = {
  "VERIFIED-STRONG": { signal: "Top band — affordability is solid, business substance and reconciliation confidence are both high, completeness is good, integrity is clean.", signalId: "Band teratas — keterjangkauan solid, substansi bisnis dan kepercayaan rekonsiliasi keduanya tinggi, kelengkapan baik, integritas bersih." },
  "VERIFIED-ADEQUATE": { signal: "Affordability and reconciliation hold up well enough to lend against, just short of the top tier.", signalId: "Keterjangkauan dan rekonsiliasi cukup untuk dipinjamkan, sedikit di bawah tier teratas." },
  "VERIFIED-THIN": { signal: "Some independent verification exists but it's sparse — thin reconciliation, weaker completeness, or a business substance rating on the low end.", signalId: "Ada verifikasi independen tetapi terbatas — rekonsiliasi tipis atau kelengkapan lebih lemah." },
  UNVERIFIED: { signal: "Not enough independent evidence to confirm the claims either way — an insufficient-evidence outcome, not necessarily a bad one.", signalId: "Tidak cukup bukti independen untuk mengonfirmasi klaim; bukan berarti hasil yang buruk." },
  CONTRADICTED: { signal: "The evidence actively conflicts with what the borrower claimed.", signalId: "Bukti bertentangan dengan apa yang diklaim peminjam." },
};
