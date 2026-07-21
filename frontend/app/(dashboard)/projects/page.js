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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 id="page-title" className="text-3xl font-black tracking-tight flex items-center gap-2">
            Projects <span className="text-orange-500">.</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage linked GitHub repositories & zero-trust attestation targets
          </p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-orange-500/20 flex items-center gap-2"
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
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center justify-between backdrop-blur-md">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Add Repo Form */}
      {showAddForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleAddRepo} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Repository Slug
              </label>
              <input
                type="text"
                value={repoSlug}
                onChange={(e) => setRepoSlug(e.target.value)}
                placeholder="owner/repository"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !repoSlug.includes("/")}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
            >
              {adding ? "Linking..." : "Link Project"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Not logged in */}
      {!isLoggedIn && !loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-xl">
          <p className="text-base text-gray-300 font-medium mb-2">Not Logged In</p>
          <p className="text-xs text-gray-400">
            Navigate to the <Link href="/terminal" className="text-orange-400 hover:underline font-mono">Terminal</Link> and run <code className="text-orange-400 bg-black/40 px-2 py-1 rounded border border-white/10">zkcap login</code>
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400 font-mono animate-pulse">Loading projects...</div>
      )}

      {/* Projects List Empty */}
      {!loading && isLoggedIn && projects.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center backdrop-blur-xl">
          <div className="flex flex-col items-center text-center text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 text-orange-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-white">No Projects Linked</p>
            <p className="text-xs mt-1 text-gray-400">Click "Add Repository" above or connect via zkCAP CLI</p>
          </div>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-orange-500/40 transition-all duration-300 group shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                    {project.github_repo}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    ID: {project.id}
                  </p>
                </div>
                <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs rounded-full font-mono font-medium">
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
