/**
 * status command — View attestation statuses across all repos.
 *
 *   zkcap status
 */

import { listAttestations, listProjects, getToken } from "../api";

export async function statusCommand() {
  if (!getToken()) {
    return [
      { type: "error", text: "✗ Not logged in." },
      { type: "dim", text: "Run 'zkcap login' first." },
    ];
  }

  try {
    const [attestations, projects] = await Promise.all([
      listAttestations(),
      listProjects(),
    ]);

    if (projects.length === 0) {
      return [
        { type: "white", text: "No repositories linked yet." },
        { type: "dim", text: "Run 'zkcap repo add <owner/repo>' to link one." },
      ];
    }

    if (attestations.length === 0) {
      return [
        { type: "white", text: "No attestations found." },
        { type: "dim", text: "Run 'zkcap attest <commit-hash>' to create one." },
      ];
    }

    const lines = [
      { type: "white", text: "Attestation Status", bold: true },
      { type: "blank" },
    ];

    // Table header
    const header = "  HASH       STATUS       MESSAGE";
    lines.push({ type: "dim", text: header });
    lines.push({ type: "dim", text: "  " + "─".repeat(55) });

    // Table rows
    attestations.forEach((a) => {
      const hash = a.commit_hash.substring(0, 8);
      const statusMap = {
        generated: "GENERATED",
        onchain: "ON-CHAIN ",
        pending: "PENDING  ",
        failed: "FAILED   ",
      };
      const status = statusMap[a.status] || a.status.toUpperCase().padEnd(9);
      const msg = a.message.split("\n")[0].substring(0, 35);

      // Color based on status
      let type = "white";
      if (a.status === "generated") type = "success";
      if (a.status === "onchain") type = "info";
      if (a.status === "failed") type = "error";
      if (a.status === "pending") type = "white";

      lines.push({
        type,
        text: `  ${hash}   ${status}    ${msg}`,
      });
    });

    lines.push({ type: "blank" });
    lines.push({
      type: "dim",
      text: `  Total: ${attestations.length} attestation(s)`,
    });

    return lines;
  } catch (err) {
    return [{ type: "error", text: `✗ ${err.message}` }];
  }
}
