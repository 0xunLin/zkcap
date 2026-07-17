/**
 * HTTP client wrapping the zkCAP backend API.
 *
 * All methods auto-attach the Bearer token from stored credentials.
 */

import config from './config.js';
import { getToken } from './auth.js';

const BASE = config.backendUrl;

/**
 * Make an authenticated request to the backend.
 */
async function request(method, path, body = null) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const resp = await fetch(`${BASE}${path}`, opts);
  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const msg = data?.detail || `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return data;
}

/**
 * Exchange a GitHub access token for a zkCAP JWT.
 */
export async function authWithGitHub(accessToken) {
  return request('POST', '/api/auth/github', { access_token: accessToken });
}

/**
 * Get the current authenticated user.
 */
export async function getMe() {
  return request('GET', '/api/auth/me');
}

/**
 * Link a GitHub repository.
 */
export async function addProject(githubRepo) {
  return request('POST', '/api/projects', { github_repo: githubRepo });
}

/**
 * List linked repositories.
 */
export async function listProjects() {
  return request('GET', '/api/projects');
}

/**
 * Create an attestation for a commit.
 */
export async function createAttestation(commitData) {
  return request('POST', '/api/attestations', commitData);
}

/**
 * List all attestations.
 */
export async function listAttestations() {
  return request('GET', '/api/attestations');
}

/**
 * Submit an attestation on-chain.
 */
export async function submitOnchain(attestationId) {
  return request('POST', `/api/attestations/${attestationId}/onchain`);
}
