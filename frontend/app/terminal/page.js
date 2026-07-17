"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Terminal from "../components/Terminal";
import { executeCommand } from "../lib/commandExecutor";
import { getToken, getUser } from "../lib/api";

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
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 id="page-title" className="text-2xl font-bold tracking-tight">
          Terminal
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Interact with zkCAP using CLI commands
        </p>
      </div>

      {/* Terminal + Info Panel Layout */}
      <div className="flex gap-5" style={{ height: "calc(100vh - 170px)" }}>
        {/* Terminal — 70% */}
        <div className="flex-[7]">
          <Terminal onCommand={onCommand} ref={terminalRef} />
        </div>

        {/* Info Panel — 30% */}
        <div className="flex-[3] flex flex-col gap-4 overflow-y-auto">
          {/* Session Status */}
          <div className="info-panel">
            <div className="info-panel-title">Session</div>
            {isLoggedIn ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                  <span className="text-xs text-accent-green font-medium">Connected</span>
                </div>
                <p className="text-sm text-foreground mt-2 font-mono">
                  @{username}
                </p>
                <p className="text-[10px] text-text-muted mt-1 opacity-60">
                  <code className="text-accent-amber">zkcap whoami</code> for details
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-red" />
                  <span className="text-xs text-text-muted">Not logged in</span>
                </div>
                <p className="text-[10px] text-text-muted mt-2 opacity-60">
                  Run <code className="text-accent-amber">zkcap login</code> to authenticate
                </p>
              </div>
            )}
          </div>

          {/* Quick Reference */}
          <div className="info-panel">
            <div className="info-panel-title">Quick Reference</div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-accent-amber">zkcap login</span>
                <span className="text-text-muted">Auth</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-amber">zkcap repo add</span>
                <span className="text-text-muted">Link repo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-amber">zkcap attest</span>
                <span className="text-text-muted">Attest</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-amber">zkcap onchain</span>
                <span className="text-text-muted">On-chain</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-amber">zkcap status</span>
                <span className="text-text-muted">Status</span>
              </div>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="info-panel">
            <div className="info-panel-title">Keyboard Shortcuts</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-text-muted border border-border text-[10px]">↑ ↓</kbd>
                <span className="text-text-muted">Command history</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-text-muted border border-border text-[10px]">Ctrl+C</kbd>
                <span className="text-text-muted">Cancel</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-text-muted border border-border text-[10px]">Ctrl+L</kbd>
                <span className="text-text-muted">Clear screen</span>
              </div>
            </div>
          </div>

          {/* Attestation Hash Info */}
          <div className="info-panel">
            <div className="info-panel-title">How Attestation Works</div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Attestation hash is computed as SHA-256 of commit metadata:
              hash, tree, author, timestamp, and parent commits.
            </p>
            <div className="mt-2 p-2 bg-background rounded font-mono text-[10px] text-accent-amber">
              SHA-256(hash|tree|author|ts|parents)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
