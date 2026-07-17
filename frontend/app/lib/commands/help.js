/**
 * help command — Show available commands.
 */

export async function helpCommand() {
  return [
    { type: "white", text: "zkCAP — Verifiable Commit Attestation Protocol", bold: true },
    { type: "blank" },
    { type: "white", text: "Usage: zkcap <command> [options]" },
    { type: "blank" },
    { type: "info", text: "Authentication:" },
    { type: "white", text: "  login              Authenticate with GitHub" },
    { type: "white", text: "  logout             Clear stored credentials" },
    { type: "white", text: "  whoami             Show current authenticated user" },
    { type: "blank" },
    { type: "info", text: "Repositories:" },
    { type: "white", text: "  repo add <o/r>     Link a GitHub repository" },
    { type: "white", text: "  repo list          List linked repositories" },
    { type: "blank" },
    { type: "info", text: "Attestations:" },
    { type: "white", text: "  attest <hash>      Attest a commit (--repo <o/r>)" },
    { type: "white", text: "  onchain <hash>     Anchor attestation on-chain" },
    { type: "white", text: "  status             View all attestation statuses" },
    { type: "blank" },
    { type: "info", text: "Other:" },
    { type: "white", text: "  help               Show this help message" },
    { type: "white", text: "  clear              Clear terminal screen" },
  ];
}
