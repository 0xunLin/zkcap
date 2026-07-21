"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Terminal from "../../components/Terminal";
import { executeCommand } from "../../lib/commandExecutor";
import { getToken, getUser } from "../../lib/api";

export default function TerminalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const terminalRef = useRef(null);

  // Check login status
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const user = getUser();
      setIsLoggedIn(!!token);
      setUsername(user?.username || null);
    };
    checkAuth();
    // Re-check periodically (e.g., after login/logout)
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const onCommand = useCallback(async (cmd) => {
    const result = await executeCommand(cmd);

    // Handle clear command
    if (result.length === 1 && result[0].type === "__clear__") {
      // Signal the terminal to clear — handled by Terminal component
      return [{ type: "__clear__" }];
    }

    // Re-check auth state after login/logout
    const token = getToken();
    const user = getUser();
    setIsLoggedIn(!!token);
    setUsername(user?.username || null);

    return result;
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 id="page-title" className="text-3xl font-black tracking-tight flex items-center gap-2">
          Terminal <span className="text-orange-500">.</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Interact with zkCAP using CLI commands
        </p>
      </div>

      {/* Terminal + Info Panel Layout */}
      <div className="flex flex-col lg:flex-row gap-6" style={{ height: "calc(100vh - 200px)" }}>
        {/* Terminal — 70% */}
        <div className="flex-1 lg:flex-[7] h-full">
          <Terminal onCommand={onCommand} ref={terminalRef} />
        </div>

        {/* Info Panel — 30% */}
        <div className="lg:flex-[3] flex flex-col gap-4 overflow-y-auto">
          {/* Session Status */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Session</div>
            {isLoggedIn ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Connected</span>
                </div>
                <p className="text-base font-bold text-white mt-2 font-mono">
                  @{username}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Run <code className="text-orange-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-mono">zkcap whoami</code> for details
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Not Logged In</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Run <code className="text-orange-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-mono">zkcap login</code> to authenticate
                </p>
              </div>
            )}
          </div>

          {/* Quick Reference */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Reference</div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-orange-400 font-bold">zkcap login</span>
                <span className="text-gray-400 text-[11px]">Auth</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400 font-bold">zkcap repo add</span>
                <span className="text-gray-400 text-[11px]">Link repo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400 font-bold">zkcap attest</span>
                <span className="text-gray-400 text-[11px]">Attest</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400 font-bold">zkcap onchain</span>
                <span className="text-gray-400 text-[11px]">On-chain</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400 font-bold">zkcap status</span>
                <span className="text-gray-400 text-[11px]">Status</span>
              </div>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Keyboard Shortcuts</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <kbd className="px-2 py-0.5 bg-black/40 rounded text-gray-300 border border-white/10 text-[10px] font-mono">↑ ↓</kbd>
                <span className="text-gray-400">History</span>
              </div>
              <div className="flex justify-between items-center">
                <kbd className="px-2 py-0.5 bg-black/40 rounded text-gray-300 border border-white/10 text-[10px] font-mono">Ctrl+C</kbd>
                <span className="text-gray-400">Cancel</span>
              </div>
              <div className="flex justify-between items-center">
                <kbd className="px-2 py-0.5 bg-black/40 rounded text-gray-300 border border-white/10 text-[10px] font-mono">Ctrl+L</kbd>
                <span className="text-gray-400">Clear</span>
              </div>
            </div>
          </div>

          {/* How Attestation Works */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Proof Computation</div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Attestation hash is computed as SHA-256 of commit metadata (hash, tree, author, timestamp, parents).
            </p>
            <div className="mt-3 p-2.5 bg-black/40 rounded-xl border border-white/10 font-mono text-[10px] text-orange-400 break-all">
              SHA-256(hash|tree|author|ts|parents)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
