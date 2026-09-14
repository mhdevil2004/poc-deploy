import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/formatters";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all focus:ring-blue-500/50",
      secondary: "bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary/50",
      outline: "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary/50",
      ghost: "text-primary hover:bg-primary/5 focus:ring-primary/50",
      danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger/50",
      success: "bg-success text-white hover:bg-green-600 focus:ring-success/50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
