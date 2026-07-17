/**
 * GitHub API helpers — fetch commit metadata by SHA.
 *
 * Uses the authenticated user's GitHub token (stored during login)
 * to access private repo commit data.
 */

import config from './config.js';

/**
 * Fetch full commit details from GitHub by SHA.
 *
 * @param {string} owner — repo owner (e.g. "sprem")
 * @param {string} repo  — repo name (e.g. "my-app")
 * @param {string} sha   — full or short commit hash
 * @param {string} githubToken — GitHub access token (optional, for private repos)
 * @returns {object} — parsed commit metadata
 */
export async function fetchCommitMetadata(owner, repo, sha, githubToken = null) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;

  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'zkcap-cli',
  };
  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`;
  }

  const resp = await fetch(url, { headers });

  if (resp.status === 404) {
    throw new Error(`Commit ${sha} not found in ${owner}/${repo}. Check the hash and repo.`);
  }
  if (resp.status === 401 || resp.status === 403) {
    throw new Error('GitHub API access denied. Your token may have expired — run `zkcap login` again.');
  }
  if (!resp.ok) {
    throw new Error(`GitHub API error: HTTP ${resp.status}`);
  }

  const data = await resp.json();

  return {
    commit_hash: data.sha,
    message: data.commit?.message || '',
    author: `${data.commit?.author?.name || ''} <${data.commit?.author?.email || ''}>`,
    timestamp: data.commit?.author?.date || new Date().toISOString(),
    tree_hash: data.commit?.tree?.sha || null,
    parent_hashes: (data.parents || []).map((p) => p.sha),
    additions: data.stats?.additions ?? null,
    deletions: data.stats?.deletions ?? null,
    files_changed: data.files?.length ?? null,
  };
}

/**
 * Fetch the user's GitHub access token from credentials.
 * We re-derive it by checking if the stored credentials include it.
 * Note: We only store the zkCAP JWT, not the GitHub token.
 * For private repo access, the user may need to provide a GitHub PAT.
 */
export async function verifyGitHubAccess(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const resp = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'zkcap-cli',
    },
  });
  return resp.ok;
}
