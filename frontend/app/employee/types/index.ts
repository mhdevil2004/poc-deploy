// ============================================================
// Fintilla Lender Portal — TypeScript Types
// POC: All data is mock. Replace with real API types later.
// ============================================================

export type EmployeeRole =
  | "Administrator"
  | "Branch Manager"
  | "Loan Officer"
  | "Underwriter"
  | "Risk Analyst"
  | "Risk Officer"
  | "Operations Officer"
  | "Read-Only Auditor";

export type EmployeeStatus = "Active" | "Inactive" | "On Leave";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

// Assessment statuses — Fintilla does NOT make final approval/rejection decisions
export type AssessmentStatus =
  | "Pending"
  | "Submitted"
  | "Under Review"
  | "Assessment Pending"
  | "Assessment Completed"
  | "Flagged"
  | "Manual Review Required"
  | "Documents Pending"
  | "Review Completed"
  | "Approved"
  | "Rejected";

// Legacy alias used in some existing pages
export type LoanApplicationStatus = AssessmentStatus;

export type RiskCaseStatus =
  | "Open"
  | "In Review"
  | "Escalated"
  | "Resolved"
  | "Closed";

export type CustomerStatus = "Active" | "Inactive" | "Blacklisted";

export type FlagSeverity = "Low" | "Medium" | "High" | "Critical";
export type FlagStatus = "Open" | "Reviewed" | "Cleared";

// ── Risk Factor ─────────────────────────────────────────────
export interface RiskFactor {
  name: string;
  level: RiskLevel;
  score: number; // 0-100 (higher = riskier)
  description: string;
}

// ── Assessment Flag ──────────────────────────────────────────
export interface AssessmentFlag {
  type: string;
  severity: FlagSeverity;
  description: string;
  status: FlagStatus;
  createdAt: string;
}

// ── Assessment Insight ───────────────────────────────────────
export interface AssessmentInsight {
  type: "positive" | "warning";
  text: string;
}

// ── Assessment History Entry ─────────────────────────────────
export interface AssessmentHistoryEntry {
  date: string;
  event: string;
  actor: string;
  actorRole: string;
}

// ── Full Assessment Record ───────────────────────────────────
export interface Assessment {
  assessmentId: string;
  loanId: string;
  customerId: string;
  customerName: string;
  businessName: string;
  businessType: string;
  province: string;
  city: string;
  assessmentDate: string;
  status: AssessmentStatus;
  riskLevel: RiskLevel;
  // Sub-scores (0-100)
  creditScore: number;        // Credit worthiness assessment
  psychometricScore: number;  // Psychometric/behavioral assessment
  integrityScore: number;     // Integrity assessment
  riskScore: number;          // Risk score (higher = more risky)
  overallScore: number;       // Fintilla composite score (higher = better)
  riskFactors: RiskFactor[];
  flags: AssessmentFlag[];
  insights: AssessmentInsight[];
  history: AssessmentHistoryEntry[];
  assignedAnalystId: string;
  assignedAnalystName: string;
  notes: string;
}

// ── Employee ─────────────────────────────────────────────────
export interface Employee {
  employeeId: string;
  name: string;
  role: EmployeeRole;
  department: string;
  branch: string;
  email: string;
  phone: string;
  joiningDate: string;
  status: EmployeeStatus;
  assignedLoans: number;
  pendingCases: number;
  completedCases: number;
  avatar?: string;
}

// ── Loan Application (EmployeeLoan) ──────────────────────────
export interface EmployeeLoan {
  loanId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  tenureMonths: number;
  creditScore: number;        // Raw bureau score (300-900)
  riskLevel: RiskLevel;
  status: AssessmentStatus;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  applicationDate: string;
  lastUpdated: string;
  businessName: string;
  businessType: string;
  monthlyRevenue: number;
  existingOutstandingLoan: number;
  purpose: string;
  notes?: string;
  creditworthiness: number;   // 0-100
  psychometricScore: number;  // 0-100
  integrityScore: number;     // 0-100
  riskScore: number;          // 0-100 (higher = riskier)
  overallScore: number;       // 0-100 (Fintilla Score)
}

// ── Customer ─────────────────────────────────────────────────
export interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email: string;
  branch: string;
  creditScore: number;        // Raw bureau score (300-900)
  activeLoans: number;
  totalLoans: number;
  status: CustomerStatus;
  joiningDate: string;
  address: string;
  // Business
  businessName: string;
  businessType: string;
  businessAge: string;
  businessStatus: string;
  ownershipType: string;
  operatingDays: string;
  // Financials
  dailySales: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netIncome: number;
  profitMargin: number;       // Percentage
  outstandingLoan: number;
  monthlyDebtObligation: number;
  // Location
  province: string;
  city: string;
  district: string;
  village: string;
  street: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  // Staff
  employees: number;
  // Scores
  creditworthiness: number;
  psychometricScore: number;
  integrityScore: number;
  riskScore: number;
  overallScore: number;
  // Relations
  loanIds: string[];
}

// ── Risk Case ─────────────────────────────────────────────────
export interface RiskCase {
  caseId: string;
  loanId: string;
  customerId: string;
  customerName: string;
  businessName: string;
  businessType: string;
  creditScore: number;
  creditworthiness: number;
  riskLevel: RiskLevel;
  assignedAnalystId: string;
  assignedAnalystName: string;
  status: RiskCaseStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
  flags: string[];
  psychometricScore: number;
  integrityScore: number;
  riskScore: number;
  overallScore: number;
}

// ── Configuration ─────────────────────────────────────────────
export interface LoanConfig {
  maxLoanAmount: number;
  maxTenureMonths: number;
  minMonthlyRevenue: number;
  interestRateMin: number;
  interestRateMax: number;
  processingFeePercent: number;
}

export interface RiskConfig {
  creditScoreThreshold: number;
  highRiskThreshold: number;
  criticalRiskThreshold: number;
  maxDebtToIncomeRatio: number;
}

export interface NotificationConfig {
  loanApprovalNotifications: boolean;
  paymentReminder: boolean;
  riskAlerts: boolean;
  dailyReports: boolean;
}

export interface EmployeeConfiguration {
  loanSettings: LoanConfig;
  riskSettings: RiskConfig;
  notificationSettings: NotificationConfig;
}

// ── Auth Session ──────────────────────────────────────────────
export interface EmployeeAuthSession {
  employee: Employee;
  // MOCK AUTH — POC ONLY: token is fake, not cryptographically secure
  token: string;
  expiresAt: number;
}
