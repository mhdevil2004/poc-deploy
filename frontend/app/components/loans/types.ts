// ─── Loan Application Form Types ──────────────────────────────────────────
// Shared between the apply/page.tsx wizard and all step sub-components.
// Backend fields (applicant_name, email, amount, term_months) + UI-only fields
// for agent context (phone, employment, income, obligations).

export interface ApplicationFormData {
  // Backend fields — sent to POST /api/loans
  applicantName: string;
  applicantEmail: string;
  amount: number | undefined;
  termMonths: number | undefined;
  purpose: string;
  // UI-only / agent-context fields — NOT persisted in the database
  phone: string;
  employmentType: string;
  monthlyIncome: number | undefined;
  existingObligations: number | undefined;
}
