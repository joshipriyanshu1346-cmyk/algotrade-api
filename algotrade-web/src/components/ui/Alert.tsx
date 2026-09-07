interface AlertProps {
  variant?: "error" | "success" | "info";
  message: string;
}

const styles = {
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  info: "border-border bg-surface-muted text-text-muted",
};

export function Alert({ variant = "error", message }: AlertProps) {
  if (!message) return null;
  return (
    <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles[variant]}`} role="alert">
      {message}
    </div>
  );
}
