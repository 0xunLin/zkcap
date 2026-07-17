/**
 * API client for the zkCAP backend.
 * Runs in the browser, uses localStorage for JWT storage.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get the stored JWT token.
 */
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zkcap_token");
}

/**
 * Store the JWT token.
 */
export function setToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem("zkcap_token", token);
}

/**
 * Clear the JWT token.
 */
export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("zkcap_token");
  localStorage.removeItem("zkcap_user");
}

/**
 * Store user info.
 */
export function setUser(user) {
  if (typeof window === "undefined") return;
  localStorage.setItem("zkcap_user", JSON.stringify(user));
}

/**
 * Get stored user info.
 */
export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("zkcap_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Make an authenticated request to the backend.
 */
async function request(method, path, body = null) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const resp = await fetch(`${API_URL}${path}`, opts);
  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const msg = data?.detail || `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return data;
}

// ── Auth ──
export const authWithGitHub = (accessToken) =>
  request("POST", "/api/auth/github", { access_token: accessToken });

export const getMe = () => request("GET", "/api/auth/me");

// ── Projects ──
export const addProject = (githubRepo) =>
  request("POST", "/api/projects", { github_repo: githubRepo });

export const listProjects = () => request("GET", "/api/projects");

// ── Attestations ──
export const createAttestation = (data) =>
  request("POST", "/api/attestations", data);

export const listAttestations = () => request("GET", "/api/attestations");

export const submitOnchain = (attestationId) =>
  request("POST", `/api/attestations/${attestationId}/onchain`);
