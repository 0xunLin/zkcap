/**
 * Command parser for the browser terminal.
 *
 * Parses input like:
 *   "zkcap attest abc123 --repo owner/repo"
 * Into:
 *   { command: "attest", args: ["abc123"], flags: { repo: "owner/repo" } }
 */

export function parseCommand(input) {
  const raw = input.trim();
  if (!raw) return null;

  const tokens = raw.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  // Strip "zkcap" prefix if present
  let startIndex = 0;
  if (tokens[0]?.toLowerCase() === "zkcap") {
    startIndex = 1;
  }

  const command = tokens[startIndex]?.toLowerCase() || "";
  const rest = tokens.slice(startIndex + 1);

  // Parse args and flags
  const args = [];
  const flags = {};

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      // Check if next token is the value (not another flag)
      if (i + 1 < rest.length && !rest[i + 1].startsWith("--")) {
        flags[key] = rest[i + 1].replace(/^"|"$/g, "");
        i++;
      } else {
        flags[key] = true;
      }
    } else if (token.startsWith("-") && token.length === 2) {
      const key = token.slice(1);
      if (i + 1 < rest.length && !rest[i + 1].startsWith("-")) {
        flags[key] = rest[i + 1].replace(/^"|"$/g, "");
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      args.push(token.replace(/^"|"$/g, ""));
    }
  }

  return { command, args, flags, raw };
}
