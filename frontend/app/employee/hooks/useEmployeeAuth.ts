// ============================================================
// MOCK AUTHENTICATION — Bank Portal
// POC ONLY: Frontend-only auth using localStorage.
// Key: "employee_portal_session" (separate from customer "bank_portal_session")
// This is intentionally separate from the customer useAuth hook.
// IMPORTANT: This is NOT production authentication.
// Replace with real JWT/OAuth from Go backend later.
// ============================================================

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MOCK_EMPLOYEES, MOCK_EMPLOYEE_CREDENTIALS } from "../mock/employees";
import type { Employee, EmployeeAuthSession } from "../types";

// Separate storage key — never conflicts with customer session
const EMPLOYEE_SESSION_KEY = "employee_portal_session";

// ── Session helpers ────────────────────────────────────────────────────────

function getStoredEmployeeSession(): EmployeeAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(EMPLOYEE_SESSION_KEY);
    if (!stored) return null;
    const session: EmployeeAuthSession = JSON.parse(stored);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(EMPLOYEE_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveEmployeeSession(employee: Employee): EmployeeAuthSession {
  // MOCK AUTH — POC ONLY: Token is not cryptographically secure
  const session: EmployeeAuthSession = {
    employee,
    token: `mock_emp_token_${employee.employeeId}_${Date.now()}`,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8-hour work-day session
  };
  localStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(session));
  return session;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export interface UseEmployeeAuthReturn {
  employee: Employee | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useEmployeeAuth(): UseEmployeeAuthReturn {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getStoredEmployeeSession();
    setEmployee(session?.employee || null);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (employeeId: string, password: string): Promise<boolean> => {
      setLoading(true);
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 600));

      const id = employeeId.toUpperCase().trim();
      const emp = MOCK_EMPLOYEES.find((e) => e.employeeId === id);
      const expectedPassword = MOCK_EMPLOYEE_CREDENTIALS[id];

      if (!emp || !expectedPassword || expectedPassword !== password) {
        toast.error("Invalid Employee ID or password");
        setLoading(false);
        return false;
      }

      const session = saveEmployeeSession(emp);
      setEmployee(session.employee);
      // Store MFA pending flag — MFA page guards on this
      if (typeof window !== "undefined") {
        sessionStorage.setItem("employee_mfa_pending", JSON.stringify({ employeeId: emp.employeeId, ts: Date.now() }));
      }
      toast.success(`Welcome, ${emp.name}! Please complete MFA.`);
      setLoading(false);
      router.push("/employee/mfa");
      return true;
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(EMPLOYEE_SESSION_KEY);
    setEmployee(null);
    toast.success("Logged out successfully");
    router.push("/employee/login");
  }, [router]);

  return {
    employee,
    loading,
    isAuthenticated: !!employee,
    login,
    logout,
  };
}

// ── Route guard ───────────────────────────────────────────────────────────

export function useRequireEmployeeAuth(): UseEmployeeAuthReturn {
  const auth = useEmployeeAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push("/employee/login");
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return auth;
}
