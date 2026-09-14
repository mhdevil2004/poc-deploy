// ============================================================
// MOCK SSO AUTH — Admin Portal
// POC ONLY: This is a simulated SSO flow, not a real integration.
// Designed as an abstraction so real SSO (Okta, Azure AD, etc.)
// can replace the mock implementation without touching UI code.
// ============================================================

import { MOCK_ADMIN_USERS, findAdminUserByEmail, type AdminUser } from "../admin-data/mockAdminUsers";

export interface SSOLoginResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface AdminAuthSession {
  userId: string;
  user: AdminUser;
  // MOCK: token is not cryptographically secure
  token: string;
  expiresAt: number;
  mfaVerified: boolean;
}

const ADMIN_SESSION_KEY = "admin_portal_session";
const SSO_PENDING_KEY = "admin_sso_pending";

// ── Mock SSO Initiation ───────────────────────────────────────────────────
/**
 * Simulates initiating SSO login with an email.
 * In production: redirect to real IdP (Okta, Azure AD, etc.)
 * Returns success if the email matches a known mock user.
 */
export async function mockSSOLogin(email: string): Promise<SSOLoginResult> {
  // Simulate SSO redirect delay
  await new Promise((r) => setTimeout(r, 1200));

  const user = findAdminUserByEmail(email.trim());
  if (!user) {
    return { success: false, error: "No account found for this email address." };
  }

  // Store pending SSO state (would be an OAuth code in real flow)
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SSO_PENDING_KEY, JSON.stringify({ userId: user.id }));
  }

  return { success: true, userId: user.id };
}

// ── Session Management ─────────────────────────────────────────────────────
export function getAdminSession(): AdminAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminAuthSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveAdminSession(userId: string): AdminAuthSession | null {
  const user = MOCK_ADMIN_USERS.find((u) => u.id === userId);
  if (!user) return null;

  const session: AdminAuthSession = {
    userId: user.id,
    user,
    token: `mock_admin_token_${user.id}_${Date.now()}`,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    mfaVerified: true,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    sessionStorage.removeItem(SSO_PENDING_KEY);
  }
  return session;
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(SSO_PENDING_KEY);
}

export function getPendingSSOUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SSO_PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.userId ?? null;
  } catch {
    return null;
  }
}
