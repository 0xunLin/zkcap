/**
 * logout command — Clear stored credentials.
 */

import { clearToken, getToken } from "../api";

export async function logoutCommand() {
  if (!getToken()) {
    return [{ type: "white", text: "⚠ You are not logged in." }];
  }

  clearToken();
  return [
    { type: "success", text: "✓ Logged out successfully." },
    { type: "dim", text: "Credentials cleared from browser storage." },
  ];
}
