import { apiClient } from "./client";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface QuestionDef {
  id: string;
  text: string;
  input_type?: string;
  options?: QuestionOption[];
}

export interface UIGuide {
  enabled: boolean;
  target?: string;
  message?: string;
}

export interface UIInstruction {
  guide?: UIGuide;
}

export interface ProgressInfo {
  current: number;
  total: number;
}

export interface InterviewResponse {
  session_id: string;
  step: string;
  type: string; // "message", "permission", "tips", "video_question", "video"
  message?: string;
  action?: string; // "show_question", "request_camera_permission", "request_microphone_permission", "request_location_permission", "start_video", "record_video", "completed"
  question?: QuestionDef;
  tips?: string[];
  ui?: UIInstruction;
  progress: ProgressInfo;
}

export async function startInterview(partner: string): Promise<InterviewResponse> {
  const res = await apiClient.get<InterviewResponse>(`/api/v1/interview/start?partner=${encodeURIComponent(partner)}`);
  return res.data;
}

export async function getInterviewState(sessionId: string): Promise<InterviewResponse> {
  const res = await apiClient.get<InterviewResponse>(`/api/v1/interview/state?session_id=${encodeURIComponent(sessionId)}`);
  return res.data;
}

export async function submitInterviewAnswer(sessionId: string, questionId: string, answer: string): Promise<InterviewResponse> {
  const res = await apiClient.post<InterviewResponse>("/api/v1/interview/answer", {
    session_id: sessionId,
    question_id: questionId,
    answer: answer
  });
  return res.data;
}

export async function submitInterviewPermission(sessionId: string, permission: string, status: "granted" | "denied"): Promise<InterviewResponse> {
  const res = await apiClient.post<InterviewResponse>("/api/v1/interview/permission", {
    session_id: sessionId,
    permission: permission,
    status: status
  });
  return res.data;
}
