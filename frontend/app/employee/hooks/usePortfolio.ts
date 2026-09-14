"use client";

import { useEffect, useState } from "react";
import { getEmployeePortfolio, type EmployeePortfolioRecord } from "@/lib/api/assessmentService";

/** Shared API-backed source for employee customer, lending and risk screens. */
export function usePortfolio() {
  const [records, setRecords] = useState<EmployeePortfolioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { void getEmployeePortfolio().then((items) => { setRecords(items); setError(""); }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load portfolio")).finally(() => setLoading(false)); }, []);
  return { records, loading, error };
}
