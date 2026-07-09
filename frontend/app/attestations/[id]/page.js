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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 p-8 flex items-center justify-center">
        <p className="text-gray-500 text-sm uppercase tracking-widest">Loading attestation...</p>
      </div>
    )
  }

  if (error || !attestation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/attestations" className="text-amber-400 hover:text-amber-300 text-sm uppercase tracking-widest mb-6 inline-block">
            ← Back to Attestations
          </Link>
          <div className="border border-red-900/40 bg-red-900/10 rounded-sm p-6 text-center">
            <p className="text-red-400">{error || 'Attestation not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const formatJSON = (obj) => JSON.stringify(obj, null, 2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <Link href="/attestations" className="text-amber-400 hover:text-amber-300 text-sm uppercase tracking-widest mb-8 inline-block">
          ← Back to Attestations
        </Link>

        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-amber-900">
          <h1 className="text-4xl font-bold text-amber-400 font-serif mb-2">
            Attestation #{attestation.id}
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-mono break-all">
            {attestation.attestation_hash}
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-8">
          <span
            className={`inline-block px-3 py-1 rounded-sm text-xs font-mono uppercase tracking-widest ${
              attestation.status === 'solana_recorded'
                ? 'bg-emerald-900/40 text-emerald-400'
                : 'bg-amber-900/40 text-amber-400'
            }`}
          >
            {attestation.status}
          </span>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* TEE Evaluation */}
          <section className="border-2 border-amber-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-none p-6">
            <h2 className="text-xl font-bold text-amber-400 font-serif mb-6 pb-3 border-b border-amber-900/40">
              TEE Evaluation Results
            </h2>
            {attestation.tee_evaluation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Security Score</h3>
                    <div className="text-5xl font-bold text-amber-400">{attestation.tee_evaluation.security_score}</div>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Out of 100</p>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Evaluation Result</h3>
                    <div
                      className={`text-2xl font-bold uppercase tracking-widest ${
                        attestation.tee_evaluation.pass_evaluation
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {attestation.tee_evaluation.pass_evaluation ? '✓ PASSED' : '✗ FAILED'}
                    </div>
                  </div>
                </div>

                {attestation.tee_evaluation.vulnerabilities &&
                  attestation.tee_evaluation.vulnerabilities.length > 0 && (
                    <div className="border border-red-900/30 rounded-sm p-4 bg-red-900/10 mt-4">
                      <h3 className="text-xs uppercase tracking-widest text-red-400 mb-3 font-bold">
                        Vulnerabilities Detected
                      </h3>
                      <div className="space-y-2">
                        {attestation.tee_evaluation.vulnerabilities.map((vuln, idx) => (
                          <div key={idx} className="border-l-2 border-red-900 pl-3">
                            <div className="text-xs uppercase tracking-widest font-mono text-red-400 mb-1">
                              [{vuln.severity.toUpperCase()}] {vuln.type}
                            </div>
                            <div className="text-sm text-red-300/80 font-mono">{vuln.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="border border-amber-900/30 rounded-sm p-4 bg-slate-900/50">
                  <h3 className="text-xs uppercase tracking-widest text-amber-600 mb-2 font-bold">Analysis Reasoning</h3>
                  <p className="text-sm text-gray-400 font-mono leading-relaxed">
                    {attestation.tee_evaluation.reasoning}
                  </p>
                </div>

                {attestation.tee_execution && (
                  <div className="border border-blue-900/30 rounded-sm p-4 bg-slate-900/50">
                    <h3 className="text-xs uppercase tracking-widest text-blue-400 mb-2 font-bold">TEE Execution Proof</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 uppercase">Hardware Signature:</span>
                        <p className="font-mono text-xs text-blue-400 break-all">
                          {attestation.tee_execution.hardware_signature}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase">Timestamp:</span>
                        <p className="font-mono text-xs text-gray-400">
                          {attestation.tee_execution.timestamp}
                        </p>
                      </div>
                      {attestation.tee_execution.quote && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Remote Attestation Quote:</span>
                          <p className="font-mono text-xs text-gray-400 break-all">
                            {attestation.tee_execution.quote.substring(0, 64)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">TEE evaluation pending...</p>
            )}
          </section>

          {/* Solana Blockchain */}
          <section className="border-2 border-amber-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-none p-6">
            <h2 className="text-xl font-bold text-amber-400 font-serif mb-6 pb-3 border-b border-amber-900/40">
              On-Chain Verification
            </h2>
            {attestation.solana_tx_signature ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Solana Transaction</h3>
                  <p className="font-mono text-sm text-green-400 break-all">
                    {attestation.solana_tx_signature}
                  </p>
                  <a
                    href={`https://explorer.solana.com/tx/${attestation.solana_tx_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-400/70 hover:text-green-400 mt-1 inline-block"
                  >
                    View on Solana Explorer →
                  </a>
                </div>

                {attestation.solana_pda_address && (
                  <div className="border border-green-900/30 rounded-sm p-4 bg-slate-900/50">
                    <h3 className="text-xs uppercase tracking-widest text-green-400 mb-2 font-mono">PDA Address</h3>
                    <p className="font-mono text-sm text-green-400 break-all">
                      {attestation.solana_pda_address}
                    </p>
                  </div>
                )}

                {attestation.sbt_mint_address && (
                  <div className="border border-emerald-900/30 rounded-sm p-4 bg-slate-900/50">
                    <h3 className="text-xs uppercase tracking-widest text-emerald-400 mb-2 font-mono">Soulbound Token</h3>
                    <p className="font-mono text-sm text-emerald-400 break-all">
                      {attestation.sbt_mint_address}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Non-transferable milestone token issued to developer wallet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">Awaiting Solana anchoring...</p>
            )}
          </section>

          {/* Metadata */}
          <section className="border-2 border-amber-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-none p-6">
            <h2 className="text-xl font-bold text-amber-400 font-serif mb-6 pb-3 border-b border-amber-900/40">
              Metadata
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 uppercase tracking-widest">ID:</span>
                <p className="font-mono text-gray-300">{attestation.id}</p>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-widest">Commit ID:</span>
                <p className="font-mono text-gray-300">{attestation.commit_id}</p>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-widest">Created:</span>
                <p className="font-mono text-gray-300">
                  {new Date(attestation.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-widest">Updated:</span>
                <p className="font-mono text-gray-300">
                  {new Date(attestation.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            {attestation.error_message && (
              <div className="border border-red-900/30 rounded-sm p-4 bg-red-900/10 mt-4">
                <h3 className="text-xs uppercase tracking-widest text-red-400 mb-2 font-bold">Error</h3>
                <p className="text-sm text-red-300/80 font-mono">{attestation.error_message}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
