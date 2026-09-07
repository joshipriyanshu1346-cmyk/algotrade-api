import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-text-muted">
        {label}
      </label>
      <input
        id={inputId}
        className={[
          "w-full rounded-lg border bg-surface-elevated px-3.5 py-2.5 text-sm text-text",
          "placeholder:text-text-muted/60 transition-colors",
          "focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          error ? "border-red-500/50" : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
