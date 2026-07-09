'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchCommits } from '../../lib/api'

export default function CommitsPage() {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCommits = async () => {
      try {
        const data = await fetchCommits()
        setCommits(data)
      } catch (err) {
        setError(err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadCommits()
  }, [])

  const zktlsProofBadge = (hasProof) =>
    hasProof ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs bg-purple-900/40 text-purple-400 uppercase tracking-widest font-mono">
        <span>🔐</span> Proof
      </span>
    ) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-amber-900">
          <h1 className="text-4xl font-bold text-amber-400 font-serif mb-2">Ingested Commits</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            All commits captured from GitHub webhooks
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm uppercase tracking-widest">Loading commits...</p>
          </div>
        ) : error ? (
          <div className="border border-red-900/40 bg-red-900/10 rounded-sm p-6 text-center">
            <p className="text-red-400 text-sm">Error loading commits: {error}</p>
          </div>
        ) : commits.length === 0 ? (
          <div className="border-2 border-dashed border-gray-700 rounded-sm p-12 text-center">
            <p className="text-gray-500 text-sm uppercase tracking-widest">No commits yet.</p>
            <p className="text-gray-600 text-xs mt-2">Push to your connected repository to ingest commits.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-amber-900 text-gray-400 text-xs uppercase tracking-widest">
                  <th className="py-4 px-4 font-mono">Hash</th>
                  <th className="py-4 px-4">Author</th>
                  <th className="py-4 px-4">Message</th>
                  <th className="py-4 px-4">Proof</th>
                  <th className="py-4 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {commits.map((commit) => (
                  <tr
                    key={commit.id}
                    className="border-b border-amber-900/20 hover:bg-amber-900/10 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-sm text-amber-400">
                      <Link
                        href={`/commits/${commit.id}`}
                        className="hover:text-amber-300 hover:underline"
                      >
                        {commit.commit_hash.substring(0, 7)}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">{commit.author}</td>
                    <td className="py-4 px-4 text-sm text-gray-400 truncate max-w-xs">
                      {commit.message}
                    </td>
                    <td className="py-4 px-4">{zktlsProofBadge(commit.zkTLS_proof)}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(commit.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
