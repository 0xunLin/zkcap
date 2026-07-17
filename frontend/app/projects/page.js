"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zkcap_token");
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [repoSlug, setRepoSlug] = useState("");
  const [adding, setAdding] = useState(false);

  const isLoggedIn = typeof window !== "undefined" && !!getToken();

  async function fetchProjects() {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setProjects(data);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleAddRepo(e) {
    e.preventDefault();
    if (!repoSlug.includes("/")) return;
    setAdding(true);
    const token = getToken();

    try {
      const resp = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ github_repo: repoSlug }),
      });

      if (resp.ok) {
        setRepoSlug("");
        setShowAddForm(false);
        fetchProjects();
      } else {
        const data = await resp.json();
        setError(data.detail || "Failed to add repository");
      }
    } catch (err) {
      setError(err.message);
    }
    setAdding(false);
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 id="page-title" className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your linked GitHub repositories
          </p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Repository
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Add Repo Form */}
      {showAddForm && (
        <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <form onSubmit={handleAddRepo} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                Repository
              </label>
              <input
                type="text"
                value={repoSlug}
                onChange={(e) => setRepoSlug(e.target.value)}
                placeholder="owner/repository"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !repoSlug.includes("/")}
              className="px-6 py-2.5 bg-[var(--accent-green)] hover:bg-emerald-500 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {adding ? "Linking..." : "Link"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Not logged in */}
      {!isLoggedIn && !loading && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-2">Not logged in</p>
          <p className="text-xs text-[var(--text-muted)] opacity-60">
            Go to <Link href="/terminal" className="text-[var(--accent-amber)] hover:underline">Terminal</Link> and run <code className="text-[var(--accent-amber)]">zkcap login</code>
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-[var(--text-muted)]">Loading...</div>
      )}

      {/* Projects List */}
      {!loading && isLoggedIn && projects.length === 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12">
          <div className="flex flex-col items-center text-center text-[var(--text-muted)]">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            <p className="text-sm font-medium">No projects linked yet</p>
            <p className="text-xs mt-1 opacity-60">Click "Add Repository" above or use the terminal</p>
          </div>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-hover)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {project.github_repo}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                    ID: {project.id}
                  </p>
                </div>
                <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded font-mono">
                  {project.commit_count || 0} commits
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
