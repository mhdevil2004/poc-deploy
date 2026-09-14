// ============================================================
// MOCK DATA — Admin Portal Users
// POC ONLY: Frontend-only. Replace with Go API + real SSO later.
// ============================================================

export type AdminRole =
  | "Administrator"
  | "Risk Officer"
  | "Underwriter"
  | "Read-Only Auditor";

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
  email: string;
  department: string;
  branch: string;
  // Mock credential — never expose real credentials
  mockPassword: string;
}

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "USR-001",
    name: "Andi Wijaya",
    role: "Administrator",
    email: "admin@fintilla.id",
    department: "Operations",
    branch: "Head Office",
    mockPassword: "Admin@123",
  },
  {
    id: "USR-002",
    name: "Siti Rahma",
    role: "Risk Officer",
    email: "risk.analyst@fintilla.id",
    department: "Risk Management",
    branch: "Jakarta Pusat",
    mockPassword: "Analyst@123",
  },
  {
    id: "USR-003",
    name: "Budi Hartono",
    role: "Underwriter",
    email: "ops.officer@fintilla.id",
    department: "Credit Underwriting",
    branch: "Jakarta Selatan",
    mockPassword: "Officer@123",
  },
  {
    id: "USR-004",
    name: "Dewi Lestari",
    role: "Read-Only Auditor",
    email: "auditor@fintilla.id",
    department: "Compliance & Audit",
    branch: "Head Office",
    mockPassword: "Auditor@123",
  },
];

// Lookup by email for SSO mock
export function findAdminUserByEmail(email: string): AdminUser | undefined {
  return MOCK_ADMIN_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

// Lookup by id
export function findAdminUserById(id: string): AdminUser | undefined {
  return MOCK_ADMIN_USERS.find((u) => u.id === id);
}
