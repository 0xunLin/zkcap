import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Welcome to zkCAP — Verifiable Commit Attestation Protocol
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-text-muted">Projects</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent-green" />
            <span className="text-sm text-text-muted">Attestations</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent-amber" />
            <span className="text-sm text-text-muted">On-Chain</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/terminal"
          className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Terminal →</h2>
          </div>
          <p className="text-sm text-text-muted">Use CLI commands to attest commits and manage repos.</p>
        </Link>

        <Link
          href="/projects"
          className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-green/20 flex items-center justify-center group-hover:bg-accent-green/30 transition-colors">
              <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Projects →</h2>
          </div>
          <p className="text-sm text-text-muted">View and manage linked GitHub repositories.</p>
        </Link>

        <Link
          href="/attestations"
          className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-amber/20 flex items-center justify-center group-hover:bg-accent-amber/30 transition-colors">
              <svg className="w-5 h-5 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Attestations →</h2>
          </div>
          <p className="text-sm text-text-muted">Verify cryptographic proofs for your commits.</p>
        </Link>
      </div>
    </div>
  );
}
