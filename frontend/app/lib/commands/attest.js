/**
 * attest command — Create a verifiable attestation for a commit.
 *
 *   zkcap attest <commit-hash> --repo <owner/repo>
 *
 * Fetches commit metadata from GitHub API, sends to backend,
 * which computes SHA-256 attestation hash.
 */

import { createAttestation, listProjects, getToken } from "../api";

function requireAuth() {
  if (!getToken()) {
    return [
      { type: "error", text: "✗ Not logged in." },
      { type: "dim", text: "Run 'zkcap login' first." },
    ];
  }
  return null;
}

/**
 * Fetch commit metadata from GitHub API.
 */
async function fetchCommitFromGitHub(owner, repo, sha) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
  const resp = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "zkcap-web",
    },
  });

  if (resp.status === 404) {
    throw new Error(`Commit ${sha} not found in ${owner}/${repo}`);
  }
  if (resp.status === 401 || resp.status === 403) {
    throw new Error("GitHub API access denied. Repo may be private.");
  }
  if (!resp.ok) {
    throw new Error(`GitHub API error: HTTP ${resp.status}`);
  }

  const data = await resp.json();
  return {
    commit_hash: data.sha,
    message: data.commit?.message || "",
    author: `${data.commit?.author?.name || ""} <${data.commit?.author?.email || ""}>`,
    timestamp: data.commit?.author?.date || new Date().toISOString(),
    tree_hash: data.commit?.tree?.sha || null,
    parent_hashes: (data.parents || []).map((p) => p.sha),
    additions: data.stats?.additions ?? null,
    deletions: data.stats?.deletions ?? null,
    files_changed: data.files?.length ?? null,
  };
}

export async function attestCommand(args, flags) {
  const authErr = requireAuth();
  if (authErr) return authErr;

  const commitHash = args[0];
  if (!commitHash) {
    return [
      { type: "error", text: "✗ Missing commit hash." },
      { type: "white", text: "Usage: zkcap attest <commit-hash> --repo <owner/repo>" },
    ];
  }

  let repoSlug = flags.repo || flags.r;

  // Auto-detect if only one repo is linked
  if (!repoSlug) {
    try {
      const projects = await listProjects();
      if (projects.length === 0) {
        return [
          { type: "error", text: "✗ No repositories linked." },
          { type: "dim", text: "Run 'zkcap repo add <owner/repo>' first." },
        ];
      } else if (projects.length === 1) {
        repoSlug = projects[0].github_repo;
      } else {
        return [
          { type: "error", text: "✗ Multiple repos linked. Specify with --repo" },
          { type: "white", text: "Usage: zkcap attest <hash> --repo <owner/repo>" },
          { type: "blank" },
          { type: "dim", text: "Linked repos:" },
          ...projects.map((p) => ({ type: "dim", text: `  - ${p.github_repo}` })),
        ];
      }
    } catch (err) {
      return [{ type: "error", text: `✗ ${err.message}` }];
    }
  }

  const [owner, repo] = repoSlug.split("/");
  if (!owner || !repo) {
    return [{ type: "error", text: "✗ Invalid repo format. Use: owner/repo" }];
  }

  const lines = [];

  // Fetch from GitHub
  lines.push({ type: "info", text: `Fetching commit ${commitHash.substring(0, 8)}... from GitHub` });

  let metadata;
  try {
    metadata = await fetchCommitFromGitHub(owner, repo, commitHash);
  } catch (err) {
    return [...lines, { type: "error", text: `✗ ${err.message}` }];
  }

  // Display commit info
  const msgFirstLine = metadata.message.split("\n")[0];
  lines.push({ type: "success", text: "✓ Commit metadata fetched" });
  lines.push({ type: "blank" });
  lines.push({ type: "white", text: `  Commit:  ${metadata.commit_hash.substring(0, 8)}` });
  lines.push({ type: "white", text: `  Message: ${msgFirstLine}` });
  lines.push({ type: "white", text: `  Author:  ${metadata.author}` });
  lines.push({ type: "white", text: `  Date:    ${metadata.timestamp}` });
  if (metadata.additions !== null) {
    lines.push({
      type: "white",
      text: `  Stats:   +${metadata.additions} / -${metadata.deletions} / ${metadata.files_changed} files`,
    });
  }
  lines.push({ type: "blank" });

  // Send to backend
  lines.push({ type: "info", text: "Generating attestation hash..." });

  try {
    const result = await createAttestation({
      github_repo: repoSlug,
      commit_hash: metadata.commit_hash,
      message: metadata.message,
      author: metadata.author,
      timestamp: metadata.timestamp,
      tree_hash: metadata.tree_hash,
      parent_hashes: metadata.parent_hashes,
      additions: metadata.additions,
      deletions: metadata.deletions,
      files_changed: metadata.files_changed,
    });

    lines.push({ type: "success", text: "✓ Attestation created" });
    lines.push({ type: "blank" });
    lines.push({ type: "success", text: `  Hash:   ${result.attestation_hash}`, bold: true });
    lines.push({ type: "white", text: `  Status: ${result.status.toUpperCase()}` });
    lines.push({ type: "dim", text: `  ID:     ${result.id}` });
    lines.push({ type: "blank" });
    lines.push({
      type: "dim",
      text: `To anchor on-chain: zkcap onchain ${metadata.commit_hash.substring(0, 8)}`,
    });
  } catch (err) {
    lines.push({ type: "error", text: `✗ ${err.message}` });
  }

  return lines;
}
