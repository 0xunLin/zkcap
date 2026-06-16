export const metadata = {
  title: "Attestations — zkCAP",
  description: "View all attestations generated for your commits.",
};

export default function AttestationsPage() {
  const statusBadge = (status) => {
    const styles = {
      pending: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
      generated: "bg-accent-green/10 text-accent-green border-accent-green/20",
      failed: "bg-accent-red/10 text-accent-red border-accent-red/20",
    };
    return styles[status] || styles.pending;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 id="page-title" className="text-2xl font-bold tracking-tight">Attestations</h1>
        <p className="mt-1 text-sm text-text-muted">
          Verifiable attestations generated for captured commits
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent-amber animate-pulse" />
            <span className="text-sm text-text-muted">Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent-green" />
            <span className="text-sm text-text-muted">Generated</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent-red" />
            <span className="text-sm text-text-muted">Failed</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Attestations List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">All Attestations</h2>
          <select
            id="attestations-filter-status"
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text-muted focus:outline-none focus:border-primary cursor-not-allowed"
            disabled
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Generated</option>
            <option>Failed</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">ID</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Commit</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center text-text-muted">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <p className="text-sm font-medium">No attestations yet</p>
                  <p className="text-xs mt-1 opacity-60">
                    Attestations will be generated once commits are processed
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
