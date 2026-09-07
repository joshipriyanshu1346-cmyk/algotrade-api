import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:
    "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 disabled:bg-emerald-500/50",
  secondary:
    "bg-surface-muted hover:bg-border border border-border text-text disabled:opacity-50",
  ghost: "bg-transparent hover:bg-surface-muted text-text-muted hover:text-text",
  danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30",
};

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        "disabled:cursor-not-allowed",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
