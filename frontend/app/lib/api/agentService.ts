import { apiClient } from "./client";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EligibilityData {
  eligible: boolean;
  reason: string;
  requested_amount: number;
  term_months: number;
  interest_rate?: number;
  estimated_monthly_payment?: number;
  estimated_total_payment?: number;
}

export interface AgentChatResponse {
  response: string;
  tool_used?: string;
  data?: EligibilityData | Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolUsed?: string;
  data?: EligibilityData | Record<string, unknown>;
  timestamp: Date;
  loading?: boolean;
  error?: boolean;
}

// ─── Application context passed from the multi-step form ──────────────────
// This is sent as a preamble in the message so the agent is aware of the
// current application state without exposing any backend internals.
export interface ApplicationContext {
  applicantName?: string;
  loanAmount?: number;
  termMonths?: number;
  monthlyIncome?: number;
  employmentType?: string;
}

function buildContextPreamble(ctx: ApplicationContext): string {
  const parts: string[] = ["[Current application context:"];
  if (ctx.applicantName) parts.push(`Applicant: ${ctx.applicantName}`);
  if (ctx.loanAmount)    parts.push(`Loan amount: Rp ${ctx.loanAmount.toLocaleString("id-ID")}`);
  if (ctx.termMonths)    parts.push(`Tenure: ${ctx.termMonths} months`);
  if (ctx.monthlyIncome) parts.push(`Monthly income: Rp ${ctx.monthlyIncome.toLocaleString("id-ID")}`);
  if (ctx.employmentType) parts.push(`Employment: ${ctx.employmentType}`);
  parts.push("]");
  return parts.join(" | ");
}

// ─── API call ──────────────────────────────────────────────────────────────

export async function sendAgentMessage(
  message: string,
  customerId?: string,
  appContext?: ApplicationContext
): Promise<AgentChatResponse> {
  const fullMessage = appContext
    ? `${buildContextPreamble(appContext)}\n${message}`
    : message;

  const response = await apiClient.post<AgentChatResponse>(
    "/api/v1/agent/chat",
    {
      message: fullMessage,
      customer_id: customerId || "",
    }
  );
  return response.data;
}
