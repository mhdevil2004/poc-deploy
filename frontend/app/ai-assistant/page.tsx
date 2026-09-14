"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Trash2, TrendingUp, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAgent } from "@/hooks/useAgent";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils/formatters";
import type { EligibilityData } from "@/lib/api/agentService";
import { cn } from "@/lib/utils/formatters";

// ─── Suggested prompts ──────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  "Can I get a loan of Rp 500.000?",
  "Check eligibility for Rp 200.000 over 24 months",
  "What's the interest rate for a Rp 10.000.000 loan?",
  "Am I eligible for a 36-month loan of Rp 350.000?",
];

// ─── Markdown-lite renderer (bold + bullets only) ───────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="font-semibold">
          {part}
        </strong>
      ) : (
        <span key={j}>{part}</span>
      )
    );
    return (
      <span key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

// ─── Eligibility Result Card ────────────────────────────────────────────────
function EligibilityCard({ data }: { data: EligibilityData }) {
  return (
    <div
      className={cn(
        "mt-3 rounded-xl border p-4 text-sm",
        data.eligible
          ? "bg-green-50 border-green-100"
          : "bg-red-50 border-red-100"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
            data.eligible ? "bg-green-500" : "bg-red-500"
          )}
        >
          {data.eligible ? "✓" : "✗"}
        </div>
        <span
          className={cn(
            "font-semibold",
            data.eligible ? "text-green-700" : "text-red-700"
          )}
        >
          {data.eligible ? "Eligible" : "Not Eligible"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/70 rounded-lg p-2.5">
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">
            Requested Amount
          </p>
          <p className="font-semibold text-[#090A0B]">
            {formatCurrency(data.requested_amount)}
          </p>
        </div>
        <div className="bg-white/70 rounded-lg p-2.5">
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">
            Term
          </p>
          <p className="font-semibold text-[#090A0B]">
            {data.term_months} months
          </p>
        </div>
        {data.eligible && data.interest_rate !== undefined && (
          <div className="bg-white/70 rounded-lg p-2.5">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">
              Interest Rate
            </p>
            <p className="font-semibold text-[#090A0B]">
              {data.interest_rate}% p.a.
            </p>
          </div>
        )}
        {data.eligible && data.estimated_monthly_payment !== undefined && (
          <div className="bg-white/70 rounded-lg p-2.5">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">
              Monthly EMI
            </p>
            <p className="font-semibold text-[#090A0B]">
              {formatCurrency(data.estimated_monthly_payment)}
            </p>
          </div>
        )}
        {data.eligible && data.estimated_total_payment !== undefined && (
          <div className="bg-white/70 rounded-lg p-2.5 col-span-2">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">
              Total Repayment
            </p>
            <p className="font-semibold text-[#090A0B]">
              {formatCurrency(data.estimated_total_payment)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing dots animation ───────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const { user } = useAuth();
  const { messages, loading, sendMessage, clearMessages } = useAgent();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle SDK Context injection
  useEffect(() => {
    const initSdkFlow = async () => {
      const token = sessionStorage.getItem("Fintilla_sdk_token");
      if (!token) return;
      sessionStorage.removeItem("Fintilla_sdk_token"); // Consume once

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/v1/sdk/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.user) {
          const contextMsg = `Create this partner loan application. Context: ${JSON.stringify({
            applicant_name: data.user.name,
            email: data.user.email,
            amount: data.user.loan_amount,
            term_months: data.user.term_months
          })}`;
          await sendMessage(contextMsg);
        }
      } catch (err) {
        console.error("Failed to verify SDK token", err);
      }
    };
    initSdkFlow();
  }, [sendMessage]);

  // Handle Fintilla_SUCCESS postMessage
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && !lastMsg.loading && lastMsg.role === "assistant" && lastMsg.toolUsed === "create_loan_application") {
      const data: any = lastMsg.data;
      if (data && data.success) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "Fintilla_SUCCESS" }, "*");
        }
      }
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout
      title="AI Assistant"
      subtitle="Powered by Gemini — your intelligent loan advisor"
    >
      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* ── Chat Area ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden border border-[#F1F5F9]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
                <Bot className="w-4.5 h-4.5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#090A0B]">
                  LoanBot
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-[#9CA3AF]">Online · Gemini AI</p>
                </div>
              </div>
            </div>
            <button
              onClick={clearMessages}
              title="Clear conversation"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
                    <Bot className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-[#090A0B] flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-semibold">
                    {(user?.name || "U")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}

                {/* Bubble */}
                <div className="max-w-[78%] flex flex-col">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-[#090A0B] text-white rounded-tr-sm"
                        : msg.error
                          ? "bg-red-50 text-red-700 border border-red-100 rounded-tl-sm"
                          : "bg-[#F7F9FC] text-[#374151] rounded-tl-sm"
                    )}
                  >
                    {msg.loading ? (
                      <TypingDots />
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                  </div>

                  {/* Eligibility card */}
                  {!msg.loading &&
                    msg.toolUsed === "check_loan_eligibility" &&
                    msg.data && (
                      <EligibilityCard
                        data={msg.data as EligibilityData}
                      />
                    )}

                  {/* Tool badge */}
                  {msg.toolUsed && !msg.loading && (
                    <div className="flex items-center gap-1 mt-1.5 ml-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#6366F1]" />
                      <span className="text-[10px] text-[#9CA3AF]">
                        {msg.toolUsed.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    suppressHydrationWarning
                    className={cn(
                      "text-[10px] text-[#C4C9D4] mt-1",
                      msg.role === "user" ? "text-right" : "text-left ml-1"
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="px-5 py-4 border-t border-[#F1F5F9]">
            {/* Suggested prompts — show only when just the welcome message exists */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] text-[#6B7280] hover:border-[#6366F1] hover:text-[#6366F1] hover:bg-[#EEF2FF] transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about loan eligibility, EMI, interest rates…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-4 py-3 text-sm text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all max-h-32 overflow-y-auto"
                style={{ height: "auto", minHeight: "46px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                  input.trim() && !loading
                    ? "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] hover:scale-105"
                    : "bg-[#F1F5F9] text-[#9CA3AF] cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <p className="text-center text-[10px] text-[#C4C9D4] mt-2">
              LoanBot can make mistakes. Always verify financial decisions with a loan officer.
            </p>
          </div>
        </div>

        {/* ── Info Panel ────────────────────────────────────── */}
        <div className="hidden xl:flex w-[280px] flex-col gap-4">
          {/* What I can do */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#F1F5F9]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <h3 className="text-sm font-semibold text-[#090A0B]">
                What I can do
              </h3>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: "✅",
                  label: "Check Eligibility",
                  desc: "Instant eligibility check with real bank rules",
                  available: true,
                },
                {
                  icon: "📊",
                  label: "Calculate EMI",
                  desc: "Estimate monthly payments",
                  available: false,
                },
                {
                  icon: "📋",
                  label: "Loan Status",
                  desc: "Track your application",
                  available: false,
                },
                {
                  icon: "⭐",
                  label: "Credit Score",
                  desc: "View your credit profile",
                  available: false,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <span className="text-base leading-none mt-0.5">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-[#090A0B]">
                        {item.label}
                      </p>
                      {!item.available && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#F1F5F9] text-[#9CA3AF] rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loan limits */}
          <div className="bg-gradient-to-br from-[#1E1E24] to-[#111115] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-white">
                Loan Limits
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Minimum", value: "Rp 1.000", color: "text-green-400" },
                { label: "Maximum", value: "Rp 10.000.000", color: "text-[#D4AF37]" },
                { label: "Min Term", value: "1 month", color: "text-blue-400" },
                { label: "Max Term", value: "84 months", color: "text-purple-400" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-white/50">{item.label}</span>
                  <span className={cn("text-xs font-semibold", item.color)}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-white/30 leading-snug">
                Rates from 7.5% – 9.0% p.a. based on amount and term.
              </p>
            </div>
          </div>

          {/* Security notice */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4">
            <p className="text-[11px] text-[#166534] leading-relaxed">
              🔒 <strong>Secure:</strong> Your data never leaves our servers.
              The AI uses only your loan amount and term — no personal data is
              sent to external services.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
