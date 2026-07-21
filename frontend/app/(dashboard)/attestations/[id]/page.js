'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export default function AttestationDetailPage() {
  const params = useParams()
  const attestationId = params.id

  const [attestation, setAttestation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAttestation = async () => {
      try {
        const res = await fetch(`${API_URL}/attestations/${attestationId}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`Failed to fetch attestation: ${res.statusText}`)
        const data = await res.json()
        setAttestation(data)
      } catch (err) {
        setError(err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (attestationId) {
      loadAttestation()
    }
  }, [attestationId])

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400 text-sm font-mono animate-pulse">Loading attestation verification details...</p>
      </div>
    )
  }

  if (error || !attestation) {
    return (
      <div className="space-y-6">
        <Link href="/attestations" className="text-orange-400 hover:text-orange-300 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1">
          ← Back to Attestations
        </Link>
        <div className="border border-rose-500/30 bg-rose-500/10 rounded-2xl p-8 text-center backdrop-blur-xl">
          <p className="text-rose-400 font-semibold">{error || 'Attestation not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Navigation */}
      <Link href="/attestations" className="text-orange-400 hover:text-orange-300 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1">
        ← Back to Attestations
      </Link>

      {/* Header */}
      <div className="pb-6 border-b border-white/10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            Attestation #{attestation.id}
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400">
              {attestation.status}
            </span>
          </h1>
          <p className="text-gray-400 text-xs font-mono break-all">
            HASH: {attestation.attestation_hash}
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* TEE Evaluation */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Phala TEE Execution Vault Evaluation
          </h2>
          {attestation.tee_evaluation ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/30 border border-white/10 p-5 rounded-xl">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Security Score</h3>
                  <div className="text-5xl font-black text-orange-400">{attestation.tee_evaluation.security_score}</div>
                  <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider font-mono">Out of 100</p>
                </div>
                <div className="bg-black/30 border border-white/10 p-5 rounded-xl">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Evaluation Result</h3>
                  <div
                    className={`text-3xl font-black uppercase tracking-wider ${
                      attestation.tee_evaluation.pass_evaluation
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {attestation.tee_evaluation.pass_evaluation ? '✓ PASSED' : '✗ FAILED'}
                  </div>
                </div>
              </div>

              {attestation.tee_evaluation.vulnerabilities &&
                attestation.tee_evaluation.vulnerabilities.length > 0 && (
                  <div className="border border-rose-500/30 rounded-xl p-5 bg-rose-500/10">
                    <h3 className="text-xs uppercase tracking-wider text-rose-400 mb-3 font-bold">
                      Vulnerabilities Detected
                    </h3>
                    <div className="space-y-3">
                      {attestation.tee_evaluation.vulnerabilities.map((vuln, idx) => (
                        <div key={idx} className="border-l-2 border-rose-500 pl-4">
                          <div className="text-xs uppercase tracking-wider font-mono text-rose-300 font-bold mb-1">
                            [{vuln.severity.toUpperCase()}] {vuln.type}
                          </div>
                          <div className="text-xs text-rose-200/80 font-mono">{vuln.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="border border-white/10 rounded-xl p-5 bg-black/30">
                <h3 className="text-xs uppercase tracking-wider text-orange-400 mb-2 font-bold">DevSecOps Reasoning</h3>
                <p className="text-xs text-gray-300 font-mono leading-relaxed">
                  {attestation.tee_evaluation.reasoning}
                </p>
              </div>

              {attestation.tee_execution && (
                <div className="border border-cyan-500/30 rounded-xl p-5 bg-cyan-500/5">
                  <h3 className="text-xs uppercase tracking-wider text-cyan-400 mb-3 font-bold">Hardware Signature & Quote</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Hardware Signature:</span>
                      <p className="font-mono text-xs text-cyan-300 break-all bg-black/40 p-2 rounded border border-white/10 mt-1">
                        {attestation.tee_execution.hardware_signature}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Attestation Timestamp:</span>
                      <p className="font-mono text-xs text-gray-300 mt-0.5">
                        {attestation.tee_execution.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">TEE evaluation pending...</p>
          )}
        </section>

        {/* Midnight Ledger Anchoring */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Midnight On-Chain ZK Proof Anchoring
          </h2>
          {attestation.onchain_tx ? (
            <div className="space-y-4">
              <div className="bg-black/30 border border-white/10 p-5 rounded-xl">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">On-Chain Transaction Hash</h3>
                <p className="font-mono text-sm text-emerald-400 break-all mb-3">
                  {attestation.onchain_tx}
                </p>
                <a
                  href={`https://explorer.testnet.midnight.network/transaction/${attestation.onchain_tx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  View on Midnight Explorer ↗
                </a>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">Awaiting Midnight zero-knowledge proof anchoring...</p>
          )}
        </section>
      </div>
    </div>
  )
}
