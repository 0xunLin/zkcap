/**
 * Command executor — routes parsed commands to their handlers.
 */

import { parseCommand } from "./commandParser";
import { helpCommand } from "./commands/help";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { whoamiCommand } from "./commands/whoami";
import { repoCommand } from "./commands/repo";
import { attestCommand } from "./commands/attest";
import { onchainCommand } from "./commands/onchain";
import { statusCommand } from "./commands/status";

/**
 * Execute a command string and return output lines.
 * @param {string} input — raw command string
 * @returns {Promise<Array<{type, text, bold?}>>}
 */
export async function executeCommand(input) {
  const parsed = parseCommand(input);

  if (!parsed || !parsed.command) {
    return [
      { type: "white", text: "zkCAP — Verifiable Commit Attestation Protocol", bold: true },
      { type: "dim", text: "Type 'help' for available commands." },
    ];
  }

  const { command, args, flags } = parsed;

  switch (command) {
    case "help":
    case "--help":
    case "-h":
      return helpCommand();

    case "clear":
      return [{ type: "__clear__" }];

    case "login":
      return loginCommand();

    case "logout":
      return logoutCommand();

    case "whoami":
      return whoamiCommand();

    case "repo":
      return repoCommand(args, flags);

    case "attest":
      return attestCommand(args, flags);

    case "onchain":
      return onchainCommand(args, flags);

    case "status":
      return statusCommand();

    default:
      return [
        { type: "error", text: `✗ Unknown command: ${command}` },
        { type: "dim", text: "Type 'help' to see available commands." },
      ];
  }
}
