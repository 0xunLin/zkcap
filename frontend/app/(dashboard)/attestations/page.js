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
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    generated: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    onchain: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    failed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };
  const cls = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border backdrop-blur-md ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'pending' ? 'bg-amber-400 animate-pulse' : status === 'generated' ? 'bg-emerald-400' : status === 'onchain' ? 'bg-cyan-400' : 'bg-rose-400'}`} />
      {status === "onchain" ? "on-chain" : status}
    </span>
  );
}

function AttestationRow({ attestation }) {
  const [status, setStatus] = useState(attestation.status);

  const anchorAttestation = async () => {
    setStatus('pending');
    const token = getToken();
    const res = await fetch(`${API_URL}/api/attestations/${attestation.id}/onchain`, { 
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setStatus('failed');
    }
  };

  return (
    <tr className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 font-mono text-sm font-semibold text-orange-400">
        {attestation.commit_hash?.substring(0, 8)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-200 max-w-xs truncate">
        {attestation.message?.split("\n")[0] || "—"}
      </td>
      <td className="px-6 py-4">
        {status === 'generated' ? (
          <button 
            onClick={anchorAttestation}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md shadow-orange-500/20 active:scale-95"
          >
            Anchor to Midnight ↗
          </button>
        ) : (
          <StatusBadge status={status} />
        )}
      </td>
      <td className="px-6 py-4 font-mono text-xs text-gray-400">
        {status === 'onchain' && attestation.onchain_tx ? (
          <a 
            href={`https://explorer.testnet.midnight.network/transaction/${attestation.onchain_tx}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-mono"
          >
            {attestation.onchain_tx.substring(0, 16)}...
          </a>
        ) : (
          attestation.attestation_hash?.substring(0, 16) + "..."
        )}
      </td>
    </tr>
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 id="page-title" className="text-3xl font-black tracking-tight flex items-center gap-2">
          Attestations <span className="text-orange-500">.</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Verifiable zero-knowledge proofs generated for your commits
        </p>
      </div>

      {/* Not logged in */}
      {!isLoggedIn && !loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-xl">
          <p className="text-base text-gray-300 font-medium mb-2">Not Logged In</p>
          <p className="text-xs text-gray-400">
            Go to <Link href="/terminal" className="text-orange-400 hover:underline font-mono">Terminal</Link> and run <code className="text-orange-400 bg-black/40 px-2 py-1 rounded border border-white/10">zkcap login</code>
          </p>
        </div>
      )}

      {isLoggedIn && (
        <>
          {/* Status Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <button
              onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
              className={`bg-white/5 border rounded-2xl p-5 text-left transition-all backdrop-blur-xl ${filter === "pending" ? "border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/10" : "border-white/10 hover:border-white/20"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending</span>
              </div>
              <p className="mt-3 text-3xl font-black">{counts.pending}</p>
            </button>
            <button
              onClick={() => setFilter(filter === "generated" ? "all" : "generated")}
              className={`bg-white/5 border rounded-2xl p-5 text-left transition-all backdrop-blur-xl ${filter === "generated" ? "border-emerald-500/80 bg-emerald-500/10 shadow-lg shadow-emerald-500/10" : "border-white/10 hover:border-white/20"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Generated</span>
              </div>
              <p className="mt-3 text-3xl font-black">{counts.generated}</p>
            </button>
            <button
              onClick={() => setFilter(filter === "onchain" ? "all" : "onchain")}
              className={`bg-white/5 border rounded-2xl p-5 text-left transition-all backdrop-blur-xl ${filter === "onchain" ? "border-cyan-500/80 bg-cyan-500/10 shadow-lg shadow-cyan-500/10" : "border-white/10 hover:border-white/20"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">On-Chain</span>
              </div>
              <p className="mt-3 text-3xl font-black">{counts.onchain}</p>
            </button>
            <button
              onClick={() => setFilter(filter === "failed" ? "all" : "failed")}
              className={`bg-white/5 border rounded-2xl p-5 text-left transition-all backdrop-blur-xl ${filter === "failed" ? "border-rose-500/80 bg-rose-500/10 shadow-lg shadow-rose-500/10" : "border-white/10 hover:border-white/20"}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Failed</span>
              </div>
              <p className="mt-3 text-3xl font-black">{counts.failed}</p>
            </button>
          </div>

          {/* Attestations Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {filter === "all" ? "All Attestations" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Attestations`}
              </h2>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="text-xs font-semibold text-orange-400 hover:underline"
                >
                  Show all
                </button>
              )}
            </div>

            {loading && (
              <div className="px-6 py-16 text-center text-gray-400 text-sm font-mono animate-pulse">Loading attestations...</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center text-gray-400">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 text-orange-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-white">No Attestations Found</p>
                  <p className="text-xs mt-1 text-gray-400">
                    Use the <Link href="/terminal" className="text-orange-400 hover:underline font-mono">Terminal</Link> to run <code className="text-orange-400 bg-black/40 px-2 py-0.5 rounded border border-white/10">zkcap attest &lt;hash&gt;</code>
                  </p>
                </div>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Commit</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Message</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <AttestationRow key={a.id} attestation={a} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
