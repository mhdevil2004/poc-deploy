import type { Loan, LoanStatus, PaginatedResponse } from "@/types";

export interface BackendLoan {
  id: string | number;
  applicant_name: string;
  email: string;
  amount: number;
  term_months: number;
  interest_rate?: number;
  monthly_payment?: number;
  total_payment?: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface BackendEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

const STATUS_MAP: Record<string, LoanStatus> = {
  pending: "pending",
  approved: "approved",
  active: "active",
  rejected: "rejected",
  defaulted: "defaulted",
  completed: "closed",
  closed: "closed",
};

export function mapLoan(raw: BackendLoan): Loan {
  return {
    id: String(raw.id),
    applicantName: raw.applicant_name,
    applicantEmail: raw.email,
    amount: Number(raw.amount),
    termMonths: Number(raw.term_months),
    interestRate: raw.interest_rate != null ? Number(raw.interest_rate) : undefined,
    monthlyPayment: raw.monthly_payment != null ? Number(raw.monthly_payment) : undefined,
    totalPayment: raw.total_payment != null ? Number(raw.total_payment) : undefined,
    status: STATUS_MAP[raw.status] || (raw.status as LoanStatus),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function toCreatePayload(input: {
  applicantName: string;
  applicantEmail: string;
  amount: number;
  termMonths: number;
}) {
  return {
    applicant_name: input.applicantName,
    email: input.applicantEmail,
    amount: input.amount,
    term_months: input.termMonths,
  };
}

export function paginate<T>(items: T[], page = 1, limit = 10): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total,
    page: safePage,
    limit,
    totalPages,
  };
}
