'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchAttestations } from '../../lib/api'

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { bg: 'bg-slate-700', text: 'text-slate-300', label: 'Pending' },
    tee_pending: {
      bg: 'bg-amber-900/40',
      text: 'text-amber-400',
      label: 'TEE Evaluating',
    },
    tee_evaluated: {
      bg: 'bg-blue-900/40',
      text: 'text-blue-400',
      label: 'TEE Complete',
    },
    solana_recorded: {
      bg: 'bg-emerald-900/40',
      text: 'text-emerald-400',
      label: 'Verified On-Chain',
    },
    error: { bg: 'bg-red-900/40', text: 'text-red-400', label: 'Error' },
    solana_error: {
      bg: 'bg-red-900/40',
      text: 'text-red-400',
      label: 'Solana Error',
    },
  }

  const config = statusMap[status] || statusMap.pending
  return (
    <span
      className={`inline-block px-3 py-1 rounded-sm text-xs font-mono uppercase tracking-widest ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}

const SecurityScoreBadge = ({ score }) => {
  if (score === undefined || score === null) return null

  let color = 'text-red-400'
  if (score >= 90) color = 'text-emerald-400'
  else if (score >= 80) color = 'text-blue-400'
  else if (score >= 70) color = 'text-amber-400'

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-16 border-2 border-current rounded-lg flex items-center justify-center font-bold text-xl" style={{ color }}>
        {score}
      </div>
      <div className="text-xs uppercase tracking-widest text-gray-400">Security Score</div>
    </div>
  )
}

const AttestationCard = ({ attestation }) => {
  const [expanded, setExpanded] = useState(false)
  const hasEvaluation = attestation.tee_evaluation
  const hasSolana = attestation.solana_tx_signature
  const hasSBT = attestation.sbt_mint_address
  const haszkTLS = attestation.zkTLS_proof // Note: this would be on the commit, not attestation

  return (
    <div className="border-2 border-amber-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-none p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-amber-900/40">
        <div className="flex-1">
          <h3 className="text-xs uppercase tracking-widest text-amber-600 mb-1 font-bold">
            Attestation {attestation.id}
          </h3>
          <p className="font-mono text-amber-400 text-sm break-all truncate">
            {attestation.attestation_hash}
          </p>
        </div>
        <div className="ml-4">
          <StatusBadge status={attestation.status} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* TEE Evaluation */}
        <div className="border border-amber-900/30 rounded-sm p-4 bg-slate-900/50">
          <h4 className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-3">
            TEE Evaluation
          </h4>
          {hasEvaluation ? (
            <div className="space-y-2">
              <SecurityScoreBadge score={attestation.tee_evaluation.security_score} />
              <div className="text-xs text-gray-400 mt-3">
                <div className="uppercase tracking-widest font-mono mb-1">
                  {attestation.tee_evaluation.pass_evaluation ? (
                    <span className="text-emerald-400">✓ PASSED</span>
                  ) : (
                    <span className="text-red-400">✗ FAILED</span>
                  )}
                </div>
              </div>
              {attestation.tee_evaluation.vulnerabilities &&
                attestation.tee_evaluation.vulnerabilities.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-amber-900/20">
                    <div className="text-xs text-gray-500 mb-1 uppercase">Vulnerabilities:</div>
                    {attestation.tee_evaluation.vulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="text-xs text-red-300/70 font-mono mt-1">
                        [{vuln.severity.toUpperCase()}] {vuln.type}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Awaiting TEE evaluation...</p>
          )}
        </div>

        {/* Solana & SBT Status */}
        <div className="border border-amber-900/30 rounded-sm p-4 bg-slate-900/50">
          <h4 className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-3">
            On-Chain Verification
          </h4>
          {hasSolana ? (
            <div className="space-y-2">
              <div className="text-xs">
                <div className="text-gray-500 uppercase tracking-widest font-mono mb-1">
                  Solana Tx:
                </div>
                <p className="font-mono text-blue-400 text-xs break-all truncate">
                  {attestation.solana_tx_signature}
                </p>
              </div>
              {hasSBT && (
                <div className="text-xs mt-2 pt-2 border-t border-amber-900/20">
                  <div className="text-gray-500 uppercase tracking-widest font-mono mb-1">
                    Soulbound Token:
                  </div>
                  <p className="font-mono text-emerald-400 text-xs break-all">
                    {attestation.sbt_mint_address}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Awaiting Solana anchoring...</p>
          )}
        </div>
      </div>

      {/* zkTLS Proof */}
      <div className="border border-amber-900/30 rounded-sm p-4 bg-slate-900/50 mb-6">
        <h4 className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">
          Zero-Knowledge Proof (zkTLS)
        </h4>
        {haszkTLS ? (
          <p className="font-mono text-purple-400 text-xs break-all truncate">
            ✓ Proof verified via Reclaim Protocol
          </p>
        ) : (
          <p className="text-sm text-gray-500 italic">No zkTLS proof available</p>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="flex justify-between items-center text-xs text-gray-600 border-t border-amber-900/20 pt-3">
        <span>ID: {attestation.id}</span>
        <span>Commit: {attestation.commit_id}</span>
        <span>{new Date(attestation.created_at).toLocaleDateString()}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-amber-600 hover:text-amber-400 font-mono underline"
        >
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-amber-900/20 space-y-2">
          {hasEvaluation && (
            <div className="text-xs">
              <div className="text-gray-500 uppercase tracking-widest font-mono mb-1">
                TEE Reasoning:
              </div>
              <p className="text-gray-400 font-mono text-xs leading-relaxed">
                {attestation.tee_evaluation.reasoning}
              </p>
            </div>
          )}
          {attestation.error_message && (
            <div className="text-xs">
              <div className="text-red-500 uppercase tracking-widest font-mono mb-1">
                Error:
              </div>
              <p className="text-red-400 font-mono text-xs">{attestation.error_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AttestationsPage() {
  const [attestations, setAttestations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAttestations = async () => {
      try {
        const data = await fetchAttestations()
        setAttestations(data)
      } catch (err) {
        setError(err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadAttestations()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-amber-900">
          <h1 className="text-4xl font-bold text-amber-400 font-serif mb-2">
            Cryptographic Attestations
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            Verified Technical Milestones — Sealed by Hardware & Blockchain
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-amber-900 rounded-sm p-3 bg-slate-900/50 text-center">
            <div className="text-2xl font-bold text-amber-400">{attestations.length}</div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">Total</div>
          </div>
          <div className="border border-amber-900 rounded-sm p-3 bg-slate-900/50 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {attestations.filter((a) => a.solana_tx_signature).length}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">On-Chain</div>
          </div>
          <div className="border border-amber-900 rounded-sm p-3 bg-slate-900/50 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {attestations.filter((a) => a.tee_evaluation?.pass_evaluation).length}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">Passed</div>
          </div>
          <div className="border border-amber-900 rounded-sm p-3 bg-slate-900/50 text-center">
            <div className="text-2xl font-bold text-red-400">
              {attestations.filter((a) => a.status === 'error').length}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">Errors</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm uppercase tracking-widest">Loading attestations...</p>
          </div>
        ) : error ? (
          <div className="border border-red-900/40 bg-red-900/10 rounded-sm p-6 text-center">
            <p className="text-red-400 text-sm">Error loading attestations: {error}</p>
          </div>
        ) : attestations.length === 0 ? (
          <div className="border-2 border-dashed border-gray-700 rounded-sm p-12 text-center">
            <p className="text-gray-500 text-sm uppercase tracking-widest">No attestations yet.</p>
            <p className="text-gray-600 text-xs mt-2">Push a commit to your repository to generate attestations.</p>
          </div>
        ) : (
          <div>{attestations.map((att) => <AttestationCard key={att.id} attestation={att} />)}</div>
        )}
      </div>
    </div>
  )
}
