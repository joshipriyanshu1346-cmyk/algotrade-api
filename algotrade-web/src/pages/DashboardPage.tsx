import { useAppSelector } from "../app/hooks";

const stats = [
  { label: "Portfolio Value", value: "$124,580", change: "+2.4%", positive: true },
  { label: "Active Strategies", value: "3", change: "1 running", positive: true },
  { label: "Today's P&L", value: "+$1,842", change: "+1.48%", positive: true },
  { label: "Win Rate", value: "68%", change: "Last 30 days", positive: true },
];

export function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Here&apos;s an overview of your trading activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface-elevated p-5 transition-colors hover:border-emerald-500/30"
          >
            <p className="text-sm text-text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-text">{stat.value}</p>
            <p
              className={`mt-1 text-xs font-medium ${stat.positive ? "text-emerald-400" : "text-red-400"}`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {[
              { action: "Strategy executed", detail: "MA Crossover — BUY AAPL", time: "2 min ago" },
              { action: "Backtest completed", detail: "RSI Mean Reversion — 94% accuracy", time: "1 hr ago" },
              { action: "Order filled", detail: "SELL TSLA @ $248.50", time: "3 hrs ago" },
            ].map((item) => (
              <div
                key={item.detail}
                className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-text-muted">{item.detail}</p>
                </div>
                <span className="text-xs text-text-muted">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-elevated p-6">
          <h2 className="text-lg font-semibold">Account</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-text-muted">Name</dt>
              <dd className="font-medium">{user?.name}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-text-muted">Email</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-text-muted">Role</dt>
              <dd className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                {user?.role}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-text-muted">Auth provider</dt>
              <dd className="font-medium">{user?.authProvider}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
