"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import TerminalOutput from "./TerminalOutput";

/**
 * Terminal — Interactive browser-based terminal component.
 */
export default function Terminal({ onCommand }) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState([
    { type: "system", text: "zkCAP Terminal v1.0.0" },
    { type: "dim", text: "Verifiable Zero-Knowledge Commit Attestation Protocol" },
    { type: "blank" },
    { type: "dim", text: "Type 'help' for available commands." },
    { type: "blank" },
  ]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount and clicks
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Add lines to output
  const appendLines = useCallback((newLines) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  // Handle command submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const cmd = input.trim();
      if (!cmd) return;

      // Add input to output
      appendLines([{ type: "input", text: cmd }]);

      // Add to history
      setHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      setInput("");
      setIsProcessing(true);

      try {
        // Execute command
        if (onCommand) {
          const result = await onCommand(cmd);
          if (result && result.length > 0) {
            // Check for clear signal
            if (result.length === 1 && result[0].type === "__clear__") {
              setLines([]);
            } else {
              appendLines(result);
            }
          }
        }
      } catch (err) {
        appendLines([{ type: "error", text: `Error: ${err.message}` }]);
      }

      setIsProcessing(false);
      // Don't add blank line after clear
      if (lines.length > 0) {
        appendLines([{ type: "blank" }]);
      }
    },
    [input, onCommand, appendLines, lines.length]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      // Up arrow — previous command
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const newIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }

      // Down arrow — next command
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex === -1) return;
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }

      // Ctrl+C — cancel
      if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        setInput("");
        appendLines([{ type: "dim", text: "^C" }]);
      }

      // Ctrl+L — clear
      if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [history, historyIndex, appendLines]
  );

  return (
    <div
      className="relative h-full flex flex-col bg-black/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl"
      onClick={focusInput}
    >
      {/* Header bar with traffic dots */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-3 text-xs font-mono text-gray-400 font-semibold">
            zkcap — bash
          </span>
        </div>
        <span className="text-[10px] font-mono text-orange-400/80 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
          TEE Vault Connected
        </span>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed text-gray-200" ref={bodyRef}>
        <TerminalOutput lines={lines} />

        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
          <span className="text-orange-500 font-bold select-none">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs caret-orange-500 p-0"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={isProcessing}
            placeholder={isProcessing ? "processing..." : ""}
          />
          {!isProcessing && input === "" && (
            <span className="w-2 h-4 bg-orange-500 animate-pulse" />
          )}
        </form>
      </div>

      {/* Subtle scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0,0,0,0.5) 50%)',
        backgroundSize: '100% 4px'
      }} />
    </div>
  );
}
