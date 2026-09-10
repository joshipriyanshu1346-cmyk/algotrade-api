import { Link } from "react-router-dom";

interface AuthLayoutProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-linear-to-br from-surface-elevated via-surface to-emerald-950/30 p-12 lg:flex">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-text">AlgoTrade</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-text">
            Trade smarter with <span className="block text-emerald-400">algorithmic precision</span>
          </h2>
          <p className="max-w-md text-lg text-text-muted">
            Build, backtest, and deploy strategies from one dashboard. Secure auth powered by
            JWT with Google sign-in.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Strategies", value: "12+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Markets", value: "50+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/50 bg-surface-elevated/50 p-4"
              >
                <p className="text-2xl font-bold text-emerald-400">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-text-muted">&copy; {new Date().getFullYear()} AlgoTrade</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold">AlgoTrade</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text">{title}</h1>
            <p className="text-sm text-text-muted">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="text-center text-sm text-text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
