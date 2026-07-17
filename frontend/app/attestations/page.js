"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zkcap_token");
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-900/30 text-amber-400 border-amber-900/50",
    generated: "bg-emerald-900/30 text-emerald-400 border-emerald-900/50",
    onchain: "bg-cyan-900/30 text-cyan-400 border-cyan-900/50",
    failed: "bg-red-900/30 text-red-400 border-red-900/50",
  };
  const cls = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider border ${cls}`}>
      {status === "onchain" ? "on-chain" : status}
    </span>
  );
}

export default function AttestationsPage() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const isLoggedIn = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    async function fetchAttestations() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`${API_URL}/api/attestations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setAttestations(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    fetchAttestations();
  }, []);

  const counts = {
    pending: attestations.filter((a) => a.status === "pending").length,
    generated: attestations.filter((a) => a.status === "generated").length,
    onchain: attestations.filter((a) => a.status === "onchain").length,
    failed: attestations.filter((a) => a.status === "failed").length,
  };

  const filtered =
    filter === "all"
      ? attestations
      : attestations.filter((a) => a.status === filter);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 id="page-title" className="text-2xl font-bold tracking-tight">Attestations</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Verifiable attestations generated for your commits
        </p>
      </div>

      {/* Not logged in */}
      {!isLoggedIn && !loading && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-2">Not logged in</p>
          <p className="text-xs text-[var(--text-muted)] opacity-60">
            Go to <Link href="/terminal" className="text-[var(--accent-amber)] hover:underline">Terminal</Link> and run <code className="text-[var(--accent-amber)]">zkcap login</code>
          </p>
        </div>
      )}

      {isLoggedIn && (
        <>
          {/* Status Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
              className={`bg-[var(--surface)] border rounded-xl p-5 text-left transition-colors ${filter === "pending" ? "border-amber-500" : "border-[var(--border)] hover:border-[var(--border-hover)]"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-[var(--text-muted)]">Pending</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{counts.pending}</p>
            </button>
            <button
              onClick={() => setFilter(filter === "generated" ? "all" : "generated")}
              className={`bg-[var(--surface)] border rounded-xl p-5 text-left transition-colors ${filter === "generated" ? "border-emerald-500" : "border-[var(--border)] hover:border-[var(--border-hover)]"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-[var(--text-muted)]">Generated</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{counts.generated}</p>
            </button>
            <button
              onClick={() => setFilter(filter === "onchain" ? "all" : "onchain")}
              className={`bg-[var(--surface)] border rounded-xl p-5 text-left transition-colors ${filter === "onchain" ? "border-cyan-500" : "border-[var(--border)] hover:border-[var(--border-hover)]"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs text-[var(--text-muted)]">On-Chain</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{counts.onchain}</p>
            </button>
            <button
              onClick={() => setFilter(filter === "failed" ? "all" : "failed")}
              className={`bg-[var(--surface)] border rounded-xl p-5 text-left transition-colors ${filter === "failed" ? "border-red-500" : "border-[var(--border)] hover:border-[var(--border-hover)]"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-xs text-[var(--text-muted)]">Failed</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{counts.failed}</p>
            </button>
          </div>

          {/* Attestations Table */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {filter === "all" ? "All Attestations" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Attestations`}
              </h2>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)]"
                >
                  Show all
                </button>
              )}
            </div>

            {loading && (
              <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">Loading...</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center text-[var(--text-muted)]">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <p className="text-sm font-medium">No attestations yet</p>
                  <p className="text-xs mt-1 opacity-60">
                    Use the <Link href="/terminal" className="text-[var(--accent-amber)] hover:underline">Terminal</Link> to run <code className="text-[var(--accent-amber)]">zkcap attest &lt;hash&gt;</code>
                  </p>
                </div>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Commit</th>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Message</th>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-cyan-400">
                        {a.commit_hash?.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--foreground)] max-w-xs truncate">
                        {a.message?.split("\n")[0] || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">
                        {a.attestation_hash?.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
