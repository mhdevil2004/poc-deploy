"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { AuthSession, LoginCredentials, SignupData, User } from "@/types";

const SESSION_KEY = "bank_portal_session";

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  // ── Administrator ──────────────────────────────────────────────
  "admin@fintilla.id": {
    password: "Admin@123",
    user: {
      id: "1",
      name: "Ahmad Wijaya",
      email: "admin@fintilla.id",
      role: "administrator",
      department: "Administration",
      phone: "+62 21 5000 0001",
    },
  },
  // Legacy admin alias
  "admin@bank.com": {
    password: "Admin@123",
    user: {
      id: "1",
      name: "Ahmad Wijaya",
      email: "admin@fintilla.id",
      role: "administrator",
      department: "Administration",
      phone: "+62 21 5000 0001",
    },
  },

  // ── Loan Manager ──────────────────────────────────────────────
  "loan.manager@fintilla.id": {
    password: "Manager@123",
    user: {
      id: "2",
      name: "Budi Santoso",
      email: "loan.manager@fintilla.id",
      role: "loan_manager",
      department: "Manajemen Pinjaman",
      phone: "+62 21 5000 0002",
    },
  },
  // Legacy manager alias
  "manager@bank.com": {
    password: "Manager@123",
    user: {
      id: "2",
      name: "Budi Santoso",
      email: "loan.manager@fintilla.id",
      role: "loan_manager",
      department: "Manajemen Pinjaman",
      phone: "+62 21 5000 0002",
    },
  },

  // ── Risk Analyst ──────────────────────────────────────────────
  "risk.analyst@fintilla.id": {
    password: "Analyst@123",
    user: {
      id: "3",
      name: "Dewi Rahayu",
      email: "risk.analyst@fintilla.id",
      role: "risk_analyst",
      department: "Analisis Risiko",
      phone: "+62 21 5000 0003",
    },
  },

  // ── Branch Manager ────────────────────────────────────────────
  "branch.manager@fintilla.id": {
    password: "Branch@123",
    user: {
      id: "4",
      name: "Eko Prasetyo",
      email: "branch.manager@fintilla.id",
      role: "branch_manager",
      department: "Manajemen Cabang",
      phone: "+62 21 5000 0004",
    },
  },

  // ── Operations Officer ────────────────────────────────────────
  "ops.officer@fintilla.id": {
    password: "Officer@123",
    user: {
      id: "5",
      name: "Fitri Handayani",
      email: "ops.officer@fintilla.id",
      role: "operations_officer",
      department: "Operasional",
      phone: "+62 21 5000 0005",
    },
  },
  // Legacy officer alias
  "officer@bank.com": {
    password: "Officer@123",
    user: {
      id: "5",
      name: "Fitri Handayani",
      email: "ops.officer@fintilla.id",
      role: "operations_officer",
      department: "Operasional",
      phone: "+62 21 5000 0005",
    },
  },

  // ── Read-Only Auditor ─────────────────────────────────────────
  "auditor@fintilla.id": {
    password: "Auditor@123",
    user: {
      id: "6",
      name: "Gunawan Setiawan",
      email: "auditor@fintilla.id",
      role: "read_only_auditor",
      department: "Audit Internal",
      phone: "+62 21 5000 0006",
    },
  },
};

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session: AuthSession = JSON.parse(stored);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(user: User): AuthSession {
  const session: AuthSession = {
    user,
    token: `mock_token_${user.id}_${Date.now()}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    setUser(session?.user || null);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockUser = MOCK_USERS[credentials.email.toLowerCase()];
      if (!mockUser || mockUser.password !== credentials.password) {
        toast.error("Invalid email or password / Email atau kata sandi tidak valid");
        setLoading(false);
        return false;
      }

      const session = saveSession(mockUser.user);
      setUser(session.user);
      toast.success(`Welcome / Selamat datang, ${session.user.name}!`);
      setLoading(false);
      router.push("/dashboard");
      return true;
    },
    [router]
  );

  const signup = useCallback(
    async (data: SignupData): Promise<boolean> => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUser: User = {
        id: String(Date.now()),
        name: data.name,
        email: data.email,
        role: "officer",
        department: "New Accounts",
      };

      const session = saveSession(newUser);
      setUser(session.user);
      toast.success("Account created / Akun berhasil dibuat!");
      setLoading(false);
      router.push("/dashboard");
      return true;
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    toast.success("Logged out / Berhasil keluar");
    router.push("/login");
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      const session = getStoredSession();
      if (session) {
        saveSession(updated);
      }
      return updated;
    });
    toast.success("Profile updated / Profil berhasil diperbarui!");
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  };
}

export function useRequireAuth(): UseAuthReturn {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return auth;
}
