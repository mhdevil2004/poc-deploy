// ============================================================
// DATETIME — Indonesian Timestamps (Asia/Jakarta / WIB)
// All user-facing timestamps must use WIB (UTC+7), never IST.
// Uses IANA timezone "Asia/Jakarta" explicitly.
// ============================================================

const WIB_TIMEZONE = "Asia/Jakarta";
const WIB_LOCALE = "id-ID";

/**
 * Format a date as "DD/MM/YYYY HH:mm WIB"
 * e.g. "04/09/2026 17:42 WIB"
 */
export function formatWIBTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatted = new Intl.DateTimeFormat(WIB_LOCALE, {
    timeZone: WIB_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  // Intl output: "04/09/2026, 17.42" — normalize separators
  return formatted.replace(",", "").replace(".", ":") + " WIB";
}

/**
 * Format a date as "DD/MM/YYYY"
 * e.g. "04/09/2026"
 */
export function formatWIBDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(WIB_LOCALE, {
    timeZone: WIB_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Format as "04 Sep 2026" (readable format for cards/details)
 */
export function formatWIBReadableDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(WIB_LOCALE, {
    timeZone: WIB_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format an ISO assessment date string (stored as "YYYY-MM-DD") as DD/MM/YYYY
 * These are stored without time, so we parse as noon WIB to avoid midnight edge cases.
 */
export function formatAssessmentDate(isoDate: string): string {
  // Append noon WIB to avoid timezone drift
  const d = new Date(`${isoDate}T12:00:00+07:00`);
  return new Intl.DateTimeFormat(WIB_LOCALE, {
    timeZone: WIB_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Parse a DD/MM/YYYY string into a Date object (interpreted as noon WIB)
 */
export function parseWIBDate(ddmmyyyy: string): Date | null {
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const iso = `${yyyy}-${mm}-${dd}T12:00:00+07:00`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Get current WIB timestamp as ISO string (for new audit events)
 */
export function nowWIB(): string {
  return new Date().toISOString();
}

/**
 * Compare an assessment date string against a date range filter.
 * assessmentDate: "YYYY-MM-DD"
 * startDate, endDate: "YYYY-MM-DD" (from date input value)
 */
export function isInDateRange(
  assessmentDate: string,
  startDate?: string,
  endDate?: string
): boolean {
  if (!startDate && !endDate) return true;
  // Compare as strings (YYYY-MM-DD sorts lexicographically correctly)
  if (startDate && assessmentDate < startDate) return false;
  if (endDate && assessmentDate > endDate) return false;
  return true;
}
