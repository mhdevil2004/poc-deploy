// ============================================================
// MOCK DATA — Configuration
// POC ONLY: Changes update frontend state only.
// This will later be connected to the Config Agent via Go backend.
// ============================================================

import type { EmployeeConfiguration } from "../types";

export const MOCK_CONFIGURATION: EmployeeConfiguration = {
  loanSettings: {
    maxLoanAmount: 500000000,
    maxTenureMonths: 60,
    minMonthlyRevenue: 5000000,
    interestRateMin: 8.5,
    interestRateMax: 18.0,
    processingFeePercent: 1.5,
  },
  riskSettings: {
    creditScoreThreshold: 650,
    highRiskThreshold: 600,
    criticalRiskThreshold: 550,
    maxDebtToIncomeRatio: 0.45,
  },
  notificationSettings: {
    loanApprovalNotifications: true,
    paymentReminder: true,
    riskAlerts: true,
    dailyReports: false,
  },
};
