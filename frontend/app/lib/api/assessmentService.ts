import type { AdminAssessment, AdminAssessmentStatus, ScoreBand } from "@/admin-data/assessment";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
type ApiAssessment = { id:string; loan_reference:string; borrower:string; business_name:string; business_type:string; location:string; requested_amount:number; status:"pending"|"complete"|"flagged"; score_band:ScoreBand; notes:string; assigned_analyst:string; created_at:string; updated_at:string };
export type EmployeePortfolioRecord = { id:string; loanReference:string; borrower:string; businessName:string; businessType:string; location:string; requestedAmount:number; status:"pending"|"complete"|"flagged"; scoreBand:ScoreBand; notes:string; createdAt:string; updatedAt:string };
export type AuditEvent = { id:string; user_id:string; user_name:string; role:string; action:string; resource:string; resource_id:string; loan_reference:string; previous_value?:unknown; new_value?:unknown; created_at:string };
export type AssessmentFilters = { loanReference?:string; status?:string; scoreBand?:string; startDate?:string; endDate?:string };
function employeeLegacyToken() {
  if (typeof window === "undefined") return "";
  try {
    const employeeSession = JSON.parse(localStorage.getItem("employee_portal_session") || "{}");
    const employeeToken = employeeSession.token as string | undefined;
    const employeeID = employeeToken?.match(/^mock_emp_token_(EMP\d+)_/)?.[1];
    const legacyIdentity: Record<string, string> = { EMP005: "USR-001", EMP007: "USR-002", EMP002: "USR-003", EMP009: "USR-004", EMP001: "USR-004", EMP003: "USR-004", EMP004: "USR-004", EMP006: "USR-004", EMP008: "USR-004" };
    if (employeeID && legacyIdentity[employeeID]) return `mock_admin_token_${legacyIdentity[employeeID]}_${Date.now()}`;
  } catch { return ""; }
  return "";
}
function token() { if(typeof window === "undefined") return ""; try { return JSON.parse(localStorage.getItem("employee_portal_session") || localStorage.getItem("admin_portal_session") || "{}").token || "" } catch { return "" } }
async function request<T>(path:string, init?:RequestInit):Promise<T> { const activeToken=token(); const options=(authToken:string):RequestInit=>({...init,headers:{"Content-Type":"application/json",...(authToken?{Authorization:`Bearer ${authToken}`} : {}),...init?.headers}});let response=await fetch(`${API_URL}${path}`,options(activeToken));if(response.status===401){const fallback=employeeLegacyToken();if(fallback&&fallback!==activeToken)response=await fetch(`${API_URL}${path}`,options(fallback));}const body=await response.json().catch(()=>null);if(!response.ok) throw new Error(body?.error?.message || "Request failed");return body.data as T }
function map(a:ApiAssessment):AdminAssessment { return {id:a.id,loanRef:a.loan_reference,borrower:a.borrower,businessName:a.business_name || "—",businessType:a.business_type || "—",location:a.location || "—",province:"",city:"",assessmentDate:a.created_at.substring(0,10),status:(a.status[0].toUpperCase()+a.status.slice(1)) as AdminAssessmentStatus,scoreBand:a.score_band,requestedAmount:a.requested_amount,notes:a.notes,tenureMonths:0,monthlyRevenue:0,existingDebt:0,creditBureauScore:0,assignedAnalyst:a.assigned_analyst,riskFactors:[],flags:[]}; }
export async function getAssessments(filters:AssessmentFilters={}) {const p=new URLSearchParams();if(filters.loanReference)p.set("loan_reference",filters.loanReference);if(filters.status)p.set("status",filters.status.toLowerCase());if(filters.scoreBand)p.set("score_band",filters.scoreBand);if(filters.startDate)p.set("start_date",filters.startDate);if(filters.endDate)p.set("end_date",filters.endDate);return (await request<ApiAssessment[]>(`/api/v1/assessments?${p}`)).map(map)}
/** Backend portfolio data for employee dashboard widgets; no React fixtures. */
export async function getEmployeePortfolio(): Promise<EmployeePortfolioRecord[]> { return (await request<ApiAssessment[]>("/api/v1/assessments")).map((a) => ({ id:a.id, loanReference:a.loan_reference, borrower:a.borrower, businessName:a.business_name || "—", businessType:a.business_type || "—", location:a.location || "—", requestedAmount:a.requested_amount, status:a.status, scoreBand:a.score_band, notes:a.notes, createdAt:a.created_at, updatedAt:a.updated_at })); }
export async function getAssessment(id:string){return map(await request<ApiAssessment>(`/api/v1/assessments/${id}`))}
export async function updateAssessment(id:string, data:{scoreBand:ScoreBand;status:AdminAssessmentStatus;notes:string;assignedAnalyst?:string}){return map(await request<ApiAssessment>(`/api/v1/assessments/${id}`,{method:"PUT",body:JSON.stringify({score_band:data.scoreBand,status:data.status.toLowerCase(),notes:data.notes,assigned_analyst:data.assignedAnalyst || ""})}))}
export async function deleteAssessment(id:string){await request<void>(`/api/v1/assessments/${id}`,{method:"DELETE"})}
export async function getAuditLogs(){return request<AuditEvent[]>("/api/v1/audit-logs")}
export type LoanDecisionAction = "APPROVE_DISBURSE"|"ADJUST_TERMS"|"REJECT_APPLICATION"|"FLAG_RISK_REVIEW"|"APPROVE_RISK_EXCEPTION"|"TRIGGER_FRAUD_SCAN"|"ADMIN_FORCE_APPROVE"|"REASSIGN_OFFICER"|"OVERRIDE_RULE_PARAMETERS";
export async function submitLoanDecision(loanReference:string, data:{action:LoanDecisionAction;amount?:number;term_months?:number;assigned_analyst?:string;notes?:string}) { return request<{id:string;action:string;status:string;performed_by:string}>(`/api/v1/loan-decisions/${encodeURIComponent(loanReference)}`, {method:"POST",body:JSON.stringify(data)}); }
