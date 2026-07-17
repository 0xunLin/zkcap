"use client";

/**
 * TerminalOutput — Renders styled terminal output lines.
 *
 * Each line has a `type` that determines its color:
 *   input   → yellow (user typed command)
 *   success → green (✓ messages)
 *   error   → red (✗ messages)
 *   info    → cyan (ℹ messages)
 *   dim     → gray (hints, secondary info)
 *   white   → white (data, tables)
 *   system  → purple italic (system messages)
 *   blank   → empty line
 */

export default function TerminalOutput({ lines }) {
  return (
    <div>
      {lines.map((line, i) => {
        if (line.type === "blank") {
          return <div key={i} className="term-line">&nbsp;</div>;
        }

        const className = [
          "term-line",
          line.type ? `term-${line.type}` : "",
          line.bold ? "term-bold" : "",
        ]
          .filter(Boolean)
          .join(" ");

        // For input lines, show with prompt
        if (line.type === "input") {
          return (
            <div key={i} className={className}>
              <span className="terminal-prompt">$ </span>
              {line.text}
            </div>
          );
        }

        return (
          <div key={i} className={className}>
            {line.text}
          </div>
        );
      })}
    </div>
  );
}
