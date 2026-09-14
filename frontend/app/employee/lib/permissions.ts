// ============================================================
// RBAC — Role-Based Access Control (MOCK / Frontend only)
// POC ONLY: This controls UI visibility only.
// IMPORTANT: Real authorization must be enforced by Go backend.
// Structure is ready for backend integration.
// ============================================================

import type { EmployeeRole } from "../types";

export type NavSection =
  | "dashboard"
  | "employees"
  | "risk"
  | "lending"
  | "customers"
  | "assessments"
  | "manual-review"
  | "configuration"
  | "reports"
  | "activity";

// Full permissions per role
// Real backend would enforce these via JWT claims / middleware
const ROLE_PERMISSIONS: Record<EmployeeRole, NavSection[]> = {
  Administrator: [
    "dashboard",
    "customers",
    "assessments",
    "manual-review",
    "lending",
    "risk",
    "configuration",
    "reports",
    "activity",
  ],
  "Branch Manager": [
    "dashboard",
    "customers",
    "assessments",
    "manual-review",
    "lending",
    "risk",
    "reports",
    "activity",
  ],
  "Loan Officer": [
    "dashboard",
    "customers",
    "assessments",
    "manual-review",
    "lending",
  ],
  Underwriter: [
    "dashboard",
    "customers",
    "assessments",
    "manual-review",
    "lending",
    "risk",
    "reports",
    "activity",
  ],
  "Risk Analyst": [
    "dashboard",
    "customers",
    "assessments",
    "manual-review",
    "risk",
    "reports",
  ],
  "Risk Officer": [
    "dashboard",
    "customers",
    "assessments",
    "manual-review",
    "risk",
    "reports",
  ],
  "Operations Officer": [
    "dashboard",
    "customers",
    "assessments",
    "lending",
  ],
  "Read-Only Auditor": [
    "dashboard",
    "customers",
    "assessments",
    "risk",
    "activity",
  ],
};

export function getAllowedSections(role: EmployeeRole): NavSection[] {
  return ROLE_PERMISSIONS[role] ?? ["dashboard"];
}

export function canAccess(role: EmployeeRole, section: NavSection): boolean {
  return getAllowedSections(role).includes(section);
}

// View-only sections (UI shows section but disables write actions)
const VIEW_ONLY_PERMISSIONS: Partial<Record<EmployeeRole, NavSection[]>> = {
  "Read-Only Auditor": ["customers", "assessments", "risk"],
  "Risk Analyst": ["lending"],
  "Operations Officer": ["assessments"],
};

export function isViewOnly(role: EmployeeRole, section: NavSection): boolean {
  return VIEW_ONLY_PERMISSIONS[role]?.includes(section) ?? false;
}

// Assessment mutations are deliberately narrower than navigation access.
// The API enforces the same rules before a database write occurs.
const ASSESSMENT_EDIT_ROLES: EmployeeRole[] = ["Administrator", "Underwriter", "Risk Officer"];
export function canEditAssessment(role: EmployeeRole): boolean { return ASSESSMENT_EDIT_ROLES.includes(role); }
export function canDeleteAssessment(role: EmployeeRole): boolean { return role === "Administrator"; }
