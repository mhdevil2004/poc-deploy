"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { useAgent } from "@/hooks/useAgent";
import type { ApplicationContext } from "@/lib/api/agentService";
import { cn } from "@/lib/utils/formatters";

interface AgentPanelProps {
  appContext?: ApplicationContext;
  customerId?: string;
}

// Minimal markdown renderer (bold + line breaks)
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
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

export function AgentPanel({ appContext, customerId }: AgentPanelProps) {
  const { messages, loading, sendMessage, clearMessages } = useAgent();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage(text, customerId, appContext);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QUICK_PROMPTS = [
    "Am I eligible?",
    "What's my estimated EMI?",
    "Explain the interest rate",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] border border-[#F3F4F6] overflow-hidden">
      {/* Header — always visible, toggles the panel */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] transition-colors"
        type="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#090A0B] flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#111827]">AI Loan Assistant</p>
            <p className="text-xs text-[#9CA3AF]">
              {isOpen ? "Ask about eligibility, EMI or loan terms" : "Need help? Ask LoanBot"}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
        ) : (
          <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
        )}
      </button>

      {/* Expandable chat body */}
      {isOpen && (
        <div className="border-t border-[#F3F4F6]">
          {/* Quick prompts */}
          <div className="flex gap-2 px-4 pt-3 pb-2 flex-wrap">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setInput("");
                  sendMessage(p, customerId, appContext);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] transition-colors font-medium"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="h-52 overflow-y-auto px-4 py-2 flex flex-col gap-3 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.loading ? (
                  <div className="bg-[#F3F4F6] rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-[#090A0B] text-white rounded-tr-sm"
                        : msg.error
                        ? "bg-red-50 text-red-700 border border-red-100 rounded-tl-sm"
                        : "bg-[#F3F4F6] text-[#111827] rounded-tl-sm"
                    )}
                  >
                    {renderMarkdown(msg.content)}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your loan..."
                className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                disabled={loading}
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearMessages}
                  title="Clear chat"
                  className="p-1 text-[#9CA3AF] hover:text-[#374151] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-1.5 bg-[#090A0B] text-white rounded-lg disabled:opacity-40 hover:bg-black transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
