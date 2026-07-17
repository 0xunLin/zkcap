/**
 * repo command — Link and list GitHub repositories.
 *
 *   repo add <owner/repo>   Link a repository
 *   repo list               List linked repositories
 */

import { addProject, listProjects, getToken } from "../api";

function requireAuth() {
  if (!getToken()) {
    return [
      { type: "error", text: "✗ Not logged in." },
      { type: "dim", text: "Run 'zkcap login' first." },
    ];
  }
  return null;
}

export async function repoAddCommand(args) {
  const authErr = requireAuth();
  if (authErr) return authErr;

  const repoSlug = args[0];
  if (!repoSlug || !repoSlug.includes("/")) {
    return [
      { type: "error", text: "✗ Invalid format." },
      { type: "white", text: "Usage: zkcap repo add <owner/repo>" },
      { type: "dim", text: "Example: zkcap repo add sprem/my-private-repo" },
    ];
  }

  try {
    const project = await addProject(repoSlug);
    return [
      { type: "success", text: `✓ Repository ${repoSlug} linked` },
      { type: "dim", text: `Project ID: ${project.id}` },
    ];
  } catch (err) {
    return [{ type: "error", text: `✗ ${err.message}` }];
  }
}

export async function repoListCommand() {
  const authErr = requireAuth();
  if (authErr) return authErr;

  try {
    const projects = await listProjects();

    if (projects.length === 0) {
      return [
        { type: "white", text: "No repositories linked yet." },
        { type: "dim", text: "Run 'zkcap repo add <owner/repo>' to link one." },
      ];
    }

    const lines = [
      { type: "white", text: "Linked Repositories", bold: true },
      { type: "blank" },
    ];

    projects.forEach((p, i) => {
      lines.push({
        type: "white",
        text: `  ${i + 1}. ${p.github_repo}  (${p.commit_count} commits)`,
      });
    });

    return lines;
  } catch (err) {
    return [{ type: "error", text: `✗ ${err.message}` }];
  }
}

export async function repoCommand(args) {
  const sub = args[0]?.toLowerCase();

  if (sub === "add") {
    return repoAddCommand(args.slice(1));
  }
  if (sub === "list") {
    return repoListCommand();
  }

  return [
    { type: "white", text: "Usage: zkcap repo <add|list>" },
    { type: "blank" },
    { type: "dim", text: "  add <owner/repo>  Link a GitHub repository" },
    { type: "dim", text: "  list              List linked repositories" },
  ];
}
