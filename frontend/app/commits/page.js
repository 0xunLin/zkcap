export const metadata = {
  title: "Commits — zkCAP",
  description: "View all commits captured from your GitHub repositories.",
};

export default function CommitsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 id="page-title" className="text-2xl font-bold tracking-tight">Commits</h1>
        <p className="mt-1 text-sm text-text-muted">
          All commits captured from connected GitHub repositories
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="commits-search"
            type="text"
            placeholder="Search commits by hash, message, or author..."
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            disabled
          />
        </div>
        <select
          id="commits-filter-status"
          className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-muted focus:outline-none focus:border-primary cursor-not-allowed"
          disabled
        >
          <option>All Projects</option>
        </select>
      </div>

      {/* Commits Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Hash</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Message</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Author</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Date</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center text-text-muted">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                  <p className="text-sm font-medium">No commits captured yet</p>
                  <p className="text-xs mt-1 opacity-60">
                    Commits will appear here once a GitHub webhook is configured
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
