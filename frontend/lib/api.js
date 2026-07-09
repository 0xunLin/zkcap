const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function fetchProjects() {
  const res = await fetch(`${API_BASE_URL}/projects/`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

export async function fetchProject(id) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch project')
  return res.json()
}

export async function fetchCommits() {
  const res = await fetch(`${API_BASE_URL}/commits/`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch commits')
  return res.json()
}

export async function fetchCommit(id) {
  const res = await fetch(`${API_BASE_URL}/commits/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch commit')
  return res.json()
}

export async function fetchAttestations() {
  const res = await fetch(`${API_BASE_URL}/attestations/`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch attestations')
  return res.json()
}

export async function fetchAttestation(id) {
  const res = await fetch(`${API_BASE_URL}/attestations/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch attestation')
  return res.json()
}
