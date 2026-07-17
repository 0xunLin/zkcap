/**
 * onchain command — Anchor an attestation on-chain.
 *
 *   zkcap onchain <commit-hash>
 */

import { listAttestations, submitOnchain, getToken } from "../api";

export async function onchainCommand(args) {
  if (!getToken()) {
    return [
      { type: "error", text: "✗ Not logged in." },
      { type: "dim", text: "Run 'zkcap login' first." },
    ];
  }

  const commitHash = args[0];
  if (!commitHash) {
    return [
      { type: "error", text: "✗ Missing commit hash." },
      { type: "white", text: "Usage: zkcap onchain <commit-hash>" },
    ];
  }

  const lines = [];
  lines.push({ type: "info", text: "Looking up attestation..." });

  try {
    const attestations = await listAttestations();
    const attestation = attestations.find((a) =>
      a.commit_hash.startsWith(commitHash)
    );

    if (!attestation) {
      return [
        ...lines,
        { type: "error", text: `✗ No attestation found for commit ${commitHash}` },
        { type: "dim", text: "Run 'zkcap attest <hash>' first." },
      ];
    }

    if (attestation.status === "onchain") {
      return [
        ...lines,
        { type: "white", text: "⚠ Attestation is already on-chain." },
        { type: "white", text: `  Transaction: ${attestation.onchain_tx}` },
      ];
    }

    lines.push({
      type: "success",
      text: `✓ Found attestation for ${attestation.commit_hash.substring(0, 8)}`,
    });
    lines.push({ type: "info", text: "Submitting to chain..." });

    const result = await submitOnchain(attestation.id);

    lines.push({ type: "success", text: "✓ Attestation anchored on-chain" });
    lines.push({ type: "blank" });
    lines.push({ type: "success", text: `  Status:      ${result.status.toUpperCase()}`, bold: true });
    lines.push({ type: "info", text: `  Transaction: ${result.onchain_tx}` });

    return lines;
  } catch (err) {
    return [...lines, { type: "error", text: `✗ ${err.message}` }];
  }
}
