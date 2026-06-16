export default function DashboardPage() {
  const stats = [
    {
      label: "Total Projects",
      value: "0",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
      ),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Commits",
      value: "0",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      ),
      color: "text-accent-green",
      bgColor: "bg-accent-green/10",
    },
    {
      label: "Attestations",
      value: "0",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      color: "text-accent-amber",
      bgColor: "bg-accent-amber/10",
    },
    {
      label: "Success Rate",
      value: "—",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      color: "text-primary-hover",
      bgColor: "bg-primary-hover/10",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 id="page-title" className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Overview of your commit attestation pipeline
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-surface border border-border rounded-xl p-5 hover:border-border-hover transition-all duration-300 hover:shadow-lg hover:shadow-primary-glow/5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-2.5 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            {/* Subtle hover glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Commits */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Commits</h2>
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
            <p className="text-sm">No commits yet</p>
            <p className="text-xs mt-1 opacity-60">Connect a GitHub repository to get started</p>
          </div>
        </div>

        {/* Recent Attestations */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Attestations</h2>
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <p className="text-sm">No attestations yet</p>
            <p className="text-xs mt-1 opacity-60">Attestations will appear after commits are processed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
