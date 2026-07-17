"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import TerminalOutput from "./TerminalOutput";

/**
 * Terminal — Interactive browser-based terminal component.
 *
 * Props:
 *   onCommand(cmd: string) → Promise<Array<{type, text, bold?}>>
 *     Callback when user enters a command. Returns output lines.
 */
export default function Terminal({ onCommand }) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState([
    { type: "system", text: "zkCAP Terminal v0.1.0" },
    { type: "dim", text: "Verifiable commit attestation protocol" },
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
    [input, onCommand, appendLines]
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
      className="terminal-container relative"
      style={{ height: "calc(100vh - 140px)" }}
      onClick={focusInput}
    >
      {/* Title bar with traffic light dots */}
      <div className="terminal-header">
        <div className="terminal-dot" style={{ background: "#ff5f57" }} />
        <div className="terminal-dot" style={{ background: "#febc2e" }} />
        <div className="terminal-dot" style={{ background: "#28c840" }} />
        <span
          style={{
            marginLeft: 12,
            fontSize: 12,
            color: "var(--term-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          zkcap — terminal
        </span>
      </div>

      {/* Output area */}
      <div className="terminal-body" ref={bodyRef}>
        <TerminalOutput lines={lines} />

        {/* Input line */}
        <form onSubmit={handleSubmit} className="terminal-input-line">
          <span className="terminal-prompt">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={isProcessing}
            placeholder={isProcessing ? "processing..." : ""}
          />
          {!isProcessing && input === "" && (
            <span className="terminal-cursor" />
          )}
        </form>
      </div>

      {/* Subtle scanline overlay */}
      <div className="terminal-scanlines" />
    </div>
  );
}
