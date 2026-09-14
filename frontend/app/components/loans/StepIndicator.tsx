"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/formatters";

export interface Step {
  id: number;
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center w-full">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border",
                    isCompleted
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : isActive
                      ? "bg-white border-blue-200 text-blue-600 shadow-[0_0_0_4px_rgba(59,130,246,0.10)]"
                      : "bg-white/70 border-white text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-semibold whitespace-nowrap transition-colors",
                    isActive
                      ? "text-slate-900"
                      : isCompleted
                      ? "text-slate-500"
                      : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-3 mb-5">
                  <div
                    className={cn(
                      "h-[2px] rounded-full transition-all duration-500",
                      isCompleted ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-white"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact pill indicator */}
      <div className="flex sm:hidden items-center justify-between px-1">
        <div className="flex gap-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentStep === step.id
                  ? "w-6 bg-blue-600"
                  : currentStep > step.id
                  ? "w-3 bg-blue-600/40"
                  : "w-3 bg-white"
              )}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Step {currentStep} of {steps.length}
        </span>
      </div>
    </div>
  );
}
