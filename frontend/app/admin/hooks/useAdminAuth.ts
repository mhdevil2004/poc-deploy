// ============================================================
// ADMIN AUTH HOOK — Admin Portal
// POC ONLY: Frontend-only session using localStorage.
// Mirrors the existing useEmployeeAuth pattern.
// Replace with real JWT/SSO session in production.
// ============================================================

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminSession,
  saveAdminSession,
  clearAdminSession,
  type AdminAuthSession,
} from "../../admin-lib/auth";
import type { AdminUser } from "../../admin-data/mockAdminUsers";

export interface UseAdminAuthReturn {
  user: AdminUser | null;
  session: AdminAuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  completeMFAAndLogin: (userId: string) => AdminAuthSession | null;
  logout: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const s = getAdminSession();
    setSession(s);
    setLoading(false);
  }, []);

  const completeMFAAndLogin = useCallback(
    (userId: string): AdminAuthSession | null => {
      const s = saveAdminSession(userId);
      setSession(s);
      return s;
    },
    []
  );

  const logout = useCallback(() => {
    clearAdminSession();
    setSession(null);
    router.push("/admin/login");
  }, [router]);

  return {
    user: session?.user ?? null,
    session,
    loading,
    isAuthenticated: !!session?.mfaVerified,
    completeMFAAndLogin,
    logout,
  };
}

// ── Route guard ────────────────────────────────────────────────────────────
export function useRequireAdminAuth(): UseAdminAuthReturn {
  const auth = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push("/admin/login");
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return auth;
}
