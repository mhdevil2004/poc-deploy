import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LoanStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Alias for backward compat with customer-facing pages
export const formatCurrency = formatIDR;

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function getStatusLabel(status: LoanStatus): string {
  const labels: Record<LoanStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    active: "Active",
    rejected: "Rejected",
    defaulted: "Defaulted",
    closed: "Closed",
    completed: "Completed",
  };
  return labels[status] || status;
}

export function getStatusColor(status: LoanStatus): string {
  const colors: Record<LoanStatus, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-primary/10 text-primary border-primary/20",
    active: "bg-success/10 text-success border-success/20",
    rejected: "bg-danger/10 text-danger border-danger/20",
    defaulted: "bg-danger/10 text-danger border-danger/20",
    closed: "bg-gray-100 text-gray-600 border-gray-200",
    completed: "bg-[#F1F5F9] text-[#334155] border-[#E5E7EB]",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
}

export function getStatusChartColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#EAB308",
    approved: "#1E3A5F",
    active: "#22C55E",
    rejected: "#EF4444",
    defaulted: "#EF4444",
    closed: "#94A3B8",
    completed: "#090A0B",
  };
  return colors[status] || "#94A3B8";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
