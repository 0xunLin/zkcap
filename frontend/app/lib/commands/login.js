/**
 * login command — GitHub OAuth popup flow.
 *
 * Opens a popup to GitHub OAuth, receives the token via
 * the callback page, then exchanges it with the backend.
 */

import { authWithGitHub, setToken, setUser, getToken } from "../api";

const CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "";
const REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth/callback`
    : "http://localhost:3000/api/auth/callback";

export async function loginCommand() {
  // Check if already logged in
  if (getToken()) {
    return [
      { type: "white", text: "⚠ Already logged in." },
      { type: "dim", text: "Run 'zkcap logout' first to switch accounts." },
    ];
  }

  if (!CLIENT_ID) {
    return [
      { type: "error", text: "✗ GitHub Client ID not configured." },
      { type: "dim", text: "Set NEXT_PUBLIC_GITHUB_CLIENT_ID in .env.local" },
    ];
  }

  const lines = [];
  lines.push({ type: "info", text: "Opening GitHub authorization..." });

  // Build GitHub OAuth URL
  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", "repo read:user");
  authUrl.searchParams.set("state", crypto.randomUUID());

  // Open popup
  const popup = window.open(
    authUrl.toString(),
    "zkcap-github-auth",
    "width=600,height=700,scrollbars=yes"
  );

  if (!popup) {
    return [
      { type: "error", text: "✗ Popup blocked by browser." },
      { type: "dim", text: "Allow popups for this site and try again." },
    ];
  }

  // Wait for the popup to send back the token
  try {
    const githubToken = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Authentication timed out (60s). Try again."));
      }, 60000);

      const handler = (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === "zkcap-auth-success") {
          clearTimeout(timeout);
          window.removeEventListener("message", handler);
          resolve(event.data.token);
        }
        if (event.data?.type === "zkcap-auth-error") {
          clearTimeout(timeout);
          window.removeEventListener("message", handler);
          reject(new Error(event.data.error || "Auth failed"));
        }
      };

      window.addEventListener("message", handler);
    });

    // Exchange with backend
    const result = await authWithGitHub(githubToken);
    setToken(result.token);

    // Fetch user info from GitHub to store locally
    const ghResp = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    const ghUser = await ghResp.json();
    setUser({
      username: ghUser.login,
      avatar: ghUser.avatar_url,
      id: ghUser.id,
    });

    return [
      { type: "success", text: `✓ Authenticated as @${ghUser.login}` },
      { type: "dim", text: "Session stored. You can now use all commands." },
    ];
  } catch (err) {
    return [{ type: "error", text: `✗ ${err.message}` }];
  }
}
