"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zkcap_token");
}

export default function CommitsPage() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isLoggedIn = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    async function fetchData() {
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

    fetchData();
  }, []);

  const filtered = search
    ? attestations.filter(
        (a) =>
          a.commit_hash?.includes(search) ||
          a.message?.toLowerCase().includes(search.toLowerCase()) ||
          a.author?.toLowerCase().includes(search.toLowerCase())
      )
    : attestations;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 id="page-title" className="text-2xl font-bold tracking-tight">Commits</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          All attested commits from your linked repositories
        </p>
      </div>

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
          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                id="commits-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by hash, message, or author..."
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-colors"
              />
            </div>
          </div>

          {/* Commits Table */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Hash</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Message</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Author</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center text-[var(--text-muted)]">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                        </svg>
                        <p className="text-sm font-medium">No commits found</p>
                        <p className="text-xs mt-1 opacity-60">
                          Run <code className="text-[var(--accent-amber)]">zkcap attest &lt;hash&gt;</code> in the Terminal
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-cyan-400">
                      {a.commit_hash?.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">
                      {a.message?.split("\n")[0] || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                      {a.author || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)] font-mono">
                      {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider border ${
                        a.status === "generated" ? "bg-emerald-900/30 text-emerald-400 border-emerald-900/50" :
                        a.status === "onchain" ? "bg-cyan-900/30 text-cyan-400 border-cyan-900/50" :
                        "bg-amber-900/30 text-amber-400 border-amber-900/50"
                      }`}>
                        {a.status === "onchain" ? "on-chain" : a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
