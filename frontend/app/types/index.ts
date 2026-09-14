export type LoanStatus =
  | "pending"
  | "approved"
  | "active"
  | "rejected"
  | "defaulted"
  | "closed"
  | "completed";

export type UserRole =
  | "admin"
  | "manager"
  | "officer"
  | "administrator"
  | "loan_manager"
  | "risk_analyst"
  | "branch_manager"
  | "operations_officer"
  | "read_only_auditor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface Loan {
  id: string;
  applicantName: string;
  applicantEmail: string;
  amount: number;
  termMonths: number;
  interestRate?: number;
  monthlyPayment?: number;
  totalPayment?: number;
  status: LoanStatus;
  purpose?: string;
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface CreateLoanInput {
  applicantName: string;
  applicantEmail: string;
  amount: number;
  termMonths: number;
  purpose?: string;
}

export interface UpdateLoanInput {
  applicantName?: string;
  applicantEmail?: string;
  amount?: number;
  termMonths?: number;
  purpose?: string;
  status?: LoanStatus;
}

export interface LoanFilters {
  search?: string;
  status?: LoanStatus | "all";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface DashboardStats {
  totalLoans: number;
  pendingLoans: number;
  activeLoans: number;
  defaultedLoans: number;
}

export interface LoanTrendData {
  month: string;
  loans: number;
  amount: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  fill: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  loanUpdates: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
