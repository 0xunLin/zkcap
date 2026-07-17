/**
 * whoami command — Show the current authenticated user.
 */

import { getMe, getToken, getUser } from "../api";

export async function whoamiCommand() {
  if (!getToken()) {
    return [
      { type: "error", text: "✗ Not logged in." },
      { type: "dim", text: "Run 'zkcap login' to authenticate." },
    ];
  }

  try {
    const user = await getMe();
    return [
      { type: "white", text: "Current User", bold: true },
      { type: "blank" },
      { type: "white", text: `  Username:  @${user.github_username}` },
      { type: "white", text: `  GitHub ID: ${user.github_id}` },
      { type: "white", text: `  User ID:   ${user.id}` },
    ];
  } catch (err) {
    // Check if it's a session expiry
    if (err.message.includes("expired") || err.message.includes("Invalid") || err.message.includes("401")) {
      return [
        { type: "error", text: "✗ Session expired." },
        { type: "dim", text: "Run 'zkcap login' to re-authenticate." },
      ];
    }
    return [{ type: "error", text: `✗ ${err.message}` }];
  }
}
