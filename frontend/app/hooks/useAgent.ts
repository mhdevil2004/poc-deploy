"use client";

import { useCallback, useState } from "react";
import { sendAgentMessage, type ApplicationContext, type ChatMessage, type EligibilityData } from "@/lib/api/agentService";
import { handleApiError } from "@/lib/api/loanService";

export function useAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm **LoanBot**, your AI loan assistant powered by Gemini. I can help you:\n\n• Check your **loan eligibility**\n• Estimate **monthly payments**\n• Answer questions about our **loan products**\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (
    text: string,
    customerId?: string,
    appContext?: ApplicationContext
  ) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const res = await sendAgentMessage(text, customerId, appContext);

      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? {
                ...m,
                id: `assistant-${Date.now()}`,
                content: res.response,
                toolUsed: res.tool_used,
                data: res.data as EligibilityData,
                loading: false,
              }
            : m
        )
      );
    } catch (err) {
      const apiError = handleApiError(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? {
                ...m,
                id: `error-${Date.now()}`,
                content: apiError.message || "I'm having trouble connecting right now. Please try again.",
                loading: false,
                error: true,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm **LoanBot**, your AI loan assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return { messages, loading, sendMessage, clearMessages };
}
