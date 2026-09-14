"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  approveLoan,
  createLoan,
  deleteLoan,
  getAllLoans,
  getLoanById,
  handleApiError,
  rejectLoan,
  updateLoan,
} from "@/lib/api/loanService";
import type { CreateLoanInput, Loan, LoanFilters, PaginatedResponse } from "@/types";

interface UseLoansReturn {
  loans: Loan[];
  pagination: Omit<PaginatedResponse<Loan>, "data"> | null;
  loading: boolean;
  error: string | null;
  fetchLoans: (filters?: LoanFilters) => Promise<void>;
  fetchLoan: (id: string) => Promise<Loan | null>;
  addLoan: (input: CreateLoanInput) => Promise<Loan | null>;
  update: (id: string, input: CreateLoanInput) => Promise<Loan | null>;
  approve: (id: string) => Promise<boolean>;
  reject: (id: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function useLoans(initialFilters?: LoanFilters): UseLoansReturn {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Loan>, "data"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef<LoanFilters | undefined>(initialFilters);

  const fetchLoans = useCallback(async (newFilters?: LoanFilters) => {
    setLoading(true);
    setError(null);
    const appliedFilters = newFilters || filtersRef.current;
    if (newFilters) filtersRef.current = newFilters;

    try {
      const response = await getAllLoans(appliedFilters);
      setLoans(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoan = useCallback(async (id: string): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const loan = await getLoanById(id);
      return loan;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      toast.error(apiError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addLoan = useCallback(async (input: CreateLoanInput): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const loan = await createLoan(input);
      toast.success("Loan application submitted successfully!");
      await fetchLoans();
      return loan;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      toast.error(apiError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const update = useCallback(async (id: string, input: CreateLoanInput): Promise<Loan | null> => {
    setLoading(true);
    setError(null);
    try {
      const loan = await updateLoan(id, input);
      toast.success("Loan updated successfully!");
      await fetchLoans();
      return loan;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      toast.error(apiError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const approve = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await approveLoan(id);
      toast.success("Loan approved successfully!");
      await fetchLoans();
      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      toast.error(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const reject = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await rejectLoan(id);
      toast.success("Loan rejected.");
      await fetchLoans();
      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      toast.error(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await deleteLoan(id);
      toast.success("Loan deleted successfully!");
      await fetchLoans();
      return true;
    } catch (err) {
      const apiError = handleApiError(err);
      toast.error(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchLoans]);

  useEffect(() => {
    fetchLoans(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loans,
    pagination,
    loading,
    error,
    fetchLoans,
    fetchLoan,
    addLoan,
    update,
    approve,
    reject,
    remove,
  };
}
