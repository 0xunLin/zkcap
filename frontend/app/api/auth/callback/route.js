/**
 * GitHub OAuth callback — Next.js API Route.
 *
 * GitHub redirects here with a `code` parameter after the user authorizes.
 * We exchange the code for an access token, then send it back to the
 * parent window (the terminal) via postMessage.
 */

import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle errors from GitHub
  if (error) {
    return new Response(buildErrorPage(error), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!code) {
    return new Response(buildErrorPage("No authorization code received"), {
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    // Exchange the code for an access token
    const tokenResp = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      }
    );

    const tokenData = await tokenResp.json();

    if (tokenData.error) {
      return new Response(
        buildErrorPage(tokenData.error_description || tokenData.error),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const accessToken = tokenData.access_token;

    // Return an HTML page that sends the token back to the parent window
    return new Response(buildSuccessPage(accessToken), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    return new Response(buildErrorPage(err.message), {
      headers: { "Content-Type": "text/html" },
    });
  }
}

function buildSuccessPage(token) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>zkCAP — Authenticated</title>
  <style>
    body {
      background: #0a0a0a;
      color: #4ade80;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
    }
    .check {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .msg {
      font-size: 14px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="check">✓</div>
    <div class="msg">Authenticated! This window will close...</div>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'zkcap-auth-success',
        token: '${token}'
      }, window.location.origin);
      setTimeout(() => window.close(), 1500);
    }
  </script>
</body>
</html>`;
}

function buildErrorPage(error) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>zkCAP — Auth Error</title>
  <style>
    body {
      background: #0a0a0a;
      color: #f87171;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .container { text-align: center; }
    .x { font-size: 48px; margin-bottom: 16px; }
    .msg { font-size: 14px; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="x">✗</div>
    <div class="msg">${error}</div>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'zkcap-auth-error',
        error: '${error}'
      }, window.location.origin);
      setTimeout(() => window.close(), 3000);
    }
  </script>
</body>
</html>`;
}
