import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/formatters";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-600 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border bg-white/70 backdrop-blur-xl text-slate-900",
            "placeholder:text-slate-400 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40",
            error ? "border-danger" : "border-white hover:border-blue-200",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
