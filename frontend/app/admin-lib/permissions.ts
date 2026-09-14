// ============================================================
// RBAC — Admin Portal Permissions
// POC ONLY: UI-only enforcement.
// IMPORTANT: Real authorization must be enforced by Go backend.
// ============================================================

import type { AdminRole } from "../admin-data/mockAdminUsers";

export type AdminNavSection =
  | "assessments"
  | "audit"
  | "dashboard";

// Which nav sections each role can access
const ADMIN_ROLE_NAV: Record<AdminRole, AdminNavSection[]> = {
  Administrator: ["assessments", "audit", "dashboard"],
  "Risk Officer": ["assessments", "audit", "dashboard"],
  Underwriter: ["assessments", "audit", "dashboard"],
  "Read-Only Auditor": ["assessments", "audit", "dashboard"],
};

export function getAdminAllowedSections(role: AdminRole): AdminNavSection[] {
  return ADMIN_ROLE_NAV[role] ?? ["assessments"];
}

/**
 * Roles that CAN edit assessment information (Score Band, Status, Notes).
 * Read-Only Auditor must NEVER be able to edit.
 */
const EDITABLE_ROLES: AdminRole[] = ["Administrator", "Risk Officer", "Underwriter"];

export function canEditAssessment(role: AdminRole): boolean {
  return EDITABLE_ROLES.includes(role);
}

/**
 * All 4 roles can view the audit log.
 */
export function canViewAudit(role: AdminRole): boolean {
  return true;
}

/**
 * All 4 roles can view/search/filter assessments.
 */
export function canViewAssessments(role: AdminRole): boolean {
  return true;
}
