import axios, { AxiosError } from "axios";
import type { ApiError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("bank_portal_session");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch {
        // ignore invalid session
      }
    }
  }
  return config;
});

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: string[] | Record<string, string[]>;
    }>;
    const payload = axiosError.response?.data;
    const messageFromList = Array.isArray(payload?.errors) ? payload?.errors[0] : undefined;
    return {
      message:
        payload?.message ||
        messageFromList ||
        axiosError.message ||
        "An unexpected error occurred",
      status: axiosError.response?.status,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "An unexpected error occurred" };
}
