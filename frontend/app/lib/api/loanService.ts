import { apiClient, handleApiError } from "./client";
import { mapLoan, paginate, toCreatePayload, type BackendEnvelope, type BackendLoan } from "./mappers";
import type { CreateLoanInput, Loan, LoanFilters, PaginatedResponse } from "@/types";

function matchesFilters(loan: Loan, filters?: LoanFilters): boolean {
  if (!filters) return true;
  if (filters.status && filters.status !== "all" && loan.status !== filters.status) {
    return false;
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    return (
      loan.applicantName.toLowerCase().includes(search) ||
      loan.applicantEmail.toLowerCase().includes(search) ||
      loan.id.toLowerCase().includes(search)
    );
  }
  return true;
}

async function fetchAllFromApi(): Promise<Loan[]> {
  const response = await apiClient.get<BackendEnvelope<BackendLoan[]>>("/api/loans");
  const rows = response.data.data || [];
  const uniqueLoans = new Map<string, Loan>();

  rows.map(mapLoan).forEach((loan) => {
    uniqueLoans.set(loan.id, loan);
  });

  return Array.from(uniqueLoans.values());
}

export async function getAllLoans(filters?: LoanFilters): Promise<PaginatedResponse<Loan>> {
  const loans = (await fetchAllFromApi()).filter((loan) => matchesFilters(loan, filters));
  return paginate(loans, filters?.page || 1, filters?.limit || 10);
}

export async function getLoanById(id: string): Promise<Loan> {
  const response = await apiClient.get<BackendEnvelope<BackendLoan>>(`/api/loans/${id}`);
  return mapLoan(response.data.data);
}

export async function createLoan(input: CreateLoanInput): Promise<Loan> {
  const response = await apiClient.post<BackendEnvelope<BackendLoan>>(
    "/api/loans",
    toCreatePayload(input)
  );
  return mapLoan(response.data.data);
}

export async function updateLoan(id: string, input: CreateLoanInput): Promise<Loan> {
  const response = await apiClient.put<BackendEnvelope<BackendLoan>>(
    `/api/loans/${id}`,
    toCreatePayload(input)
  );
  return mapLoan(response.data.data);
}

export async function approveLoan(id: string): Promise<Loan> {
  const response = await apiClient.put<BackendEnvelope<BackendLoan>>(`/api/loans/${id}/status`, {
    status: "approve",
  });
  return mapLoan(response.data.data);
}

export async function rejectLoan(id: string): Promise<Loan> {
  const response = await apiClient.put<BackendEnvelope<BackendLoan>>(`/api/loans/${id}/status`, {
    status: "reject",
  });
  return mapLoan(response.data.data);
}

export async function deleteLoan(id: string): Promise<void> {
  await apiClient.delete(`/api/loans/${id}`);
}

export { handleApiError };
