// Role-based access control for Fintilla Lender Portal

export type LenderRole =
  | 'administrator'
  | 'loan_manager'
  | 'risk_analyst'
  | 'branch_manager'
  | 'operations_officer'
  | 'read_only_auditor'
  // Legacy roles (mapped to lender equivalents)
  | 'admin'
  | 'manager'
  | 'officer';

// ─── Route Definitions ────────────────────────────────────────────────────────

export type AppRoute =
  | '/dashboard'
  | '/loans'
  | '/balance'
  | '/settings'
  | '/transactions'
  | '/investments'
  | '/cards'
  | '/ai-assistant';

// ─── Permission Map ───────────────────────────────────────────────────────────
// Each role maps to the set of routes it is allowed to access

const ROLE_PERMISSIONS: Record<LenderRole, AppRoute[]> = {
  administrator: [
    '/dashboard',
    '/loans',        // Lending
    '/balance',      // Reports
    '/settings',     // Configuration
    '/transactions', // Audit Log
    '/investments',  // (generic)
    '/cards',
    '/ai-assistant',
  ],

  loan_manager: [
    '/dashboard',
    '/loans',        // Lending
    '/investments',  // Assessments (mapped)
    '/cards',        // Customers (mapped)
  ],

  risk_analyst: [
    '/dashboard',
    '/cards',        // Customers
    '/investments',  // Assessments
    '/balance',      // Risk Analysis / Reports
    '/ai-assistant', // Risk Analysis tools
  ],

  branch_manager: [
    '/dashboard',
    '/loans',        // Lending
    '/cards',        // Customers
    '/investments',  // Assessments
    '/balance',      // Risk Analysis / Reports
    '/transactions', // Audit Log
  ],

  operations_officer: [
    '/dashboard',
    '/loans',        // Lending
    '/cards',        // Customers
    '/investments',  // Assessments
  ],

  read_only_auditor: [
    '/dashboard',
    '/cards',        // Customers
    '/investments',  // Assessments
    '/balance',      // Risk Analysis
    '/transactions', // Audit Log
  ],

  // Legacy role mappings
  admin:    [], // populated below
  manager:  [], // populated below
  officer:  [], // populated below
};

// Map legacy roles to their lender equivalents
ROLE_PERMISSIONS.admin    = ROLE_PERMISSIONS.administrator;
ROLE_PERMISSIONS.manager  = ROLE_PERMISSIONS.loan_manager;
ROLE_PERMISSIONS.officer  = ROLE_PERMISSIONS.operations_officer;

// ─── Navigation Items ─────────────────────────────────────────────────────────
// Each nav item maps a translation key to a route

export interface NavItem {
  href: AppRoute;
  labelKey: string; // e.g. 'nav.dashboard'
  icon: string;     // icon name string (resolved in Sidebar)
}

// Full navigation definition — filtered per role in Sidebar
export const ALL_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    labelKey: 'nav.dashboard',    icon: 'Home' },
  { href: '/cards',        labelKey: 'nav.customers',    icon: 'Users' },
  { href: '/investments',  labelKey: 'nav.assessments',  icon: 'ClipboardList' },
  { href: '/loans',        labelKey: 'nav.lending',      icon: 'Banknote' },
  { href: '/balance',      labelKey: 'nav.riskAnalysis', icon: 'ShieldAlert' },
  { href: '/settings',     labelKey: 'nav.configuration',icon: 'Settings' },
  { href: '/ai-assistant', labelKey: 'nav.reports',      icon: 'FileBarChart' },
  { href: '/transactions', labelKey: 'nav.auditLog',     icon: 'ClipboardCheck' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check if a role has access to a given route.
 * Returns true if role is allowed, false otherwise.
 */
export function hasAccess(role: LenderRole | string | undefined, route: string): boolean {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role as LenderRole];
  if (!allowed) return false;
  return allowed.some((r) => route === r || route.startsWith(r + '/'));
}

/**
 * Get nav items visible for a given role.
 */
export function getNavItemsForRole(role: LenderRole | string | undefined): NavItem[] {
  if (!role) return [];
  return ALL_NAV_ITEMS.filter((item) => hasAccess(role, item.href));
}

/**
 * Normalize a legacy role to a lender role display name key.
 */
export function roleToKey(role: string): string {
  const map: Record<string, string> = {
    admin:             'administrator',
    manager:           'loan_manager',
    officer:           'operations_officer',
    administrator:     'administrator',
    loan_manager:      'loan_manager',
    risk_analyst:      'risk_analyst',
    branch_manager:    'branch_manager',
    operations_officer:'operations_officer',
    read_only_auditor: 'read_only_auditor',
  };
  return map[role] || role;
}
