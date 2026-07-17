# zkCAP CLI — Documentation

## What is it?

The zkCAP CLI is a command-line interface for the Zero-Knowledge Commit Attestation Protocol. It replaces the web dashboard as the primary way users interact with zkCAP. Using the `zkcap` command, developers can authenticate with GitHub, link repositories, create verifiable attestations for their commits, and optionally anchor them on-chain.

## How it works

### Architecture

```
Developer Terminal                    zkCAP Backend                GitHub API
┌──────────────┐                   ┌──────────────┐          ┌──────────────┐
│  zkcap CLI   │──── REST API ────▶│   FastAPI     │          │   GitHub     │
│  (Node.js)   │◀── JWT Auth ─────│   Server      │          │   REST API   │
└──────┬───────┘                   └──────┬───────┘          └──────┬───────┘
       │                                  │                         │
       │  1. Device Flow OAuth ──────────────────────────────────▶ │
       │  2. Exchange token ──────────▶ │                          │
       │  3. Fetch commit metadata ────────────────────────────▶  │
       │  4. Send metadata ───────────▶ │                          │
       │  5. Receive attestation ◀───── │                          │
       │                                │                          │
       ▼                                ▼                          ▼
   ~/.zkcap/                       PostgreSQL DB            Commit metadata
   credentials.json                (Users, Projects,        (SHA, message,
                                    Commits, Attestations)   author, tree, etc.)
```

### Authentication Flow

1. User runs `zkcap login`
2. CLI requests a **Device Code** from GitHub's OAuth Device Flow endpoint
3. User is shown a one-time code and a browser opens to `github.com/login/device`
4. User enters the code in the browser and authorizes the zkCAP app
5. CLI polls GitHub until authorization is confirmed, receiving a **GitHub Access Token**
6. CLI sends the GitHub token to the zkCAP backend (`POST /api/auth/github`)
7. Backend verifies the token against GitHub's API, creates/updates the user record
8. Backend issues a **zkCAP JWT** (valid for 72 hours)
9. CLI saves the JWT + username to `~/.zkcap/credentials.json`

All subsequent CLI commands use the JWT for authentication via `Authorization: Bearer <token>` headers.

### Attestation Flow

1. User runs `zkcap attest <commit-hash> --repo owner/repo`
2. CLI fetches full commit metadata from GitHub's API:
   - `commit_hash` — Full SHA-1
   - `message` — Commit message
   - `author` — Name + email
   - `timestamp` — Author date (ISO 8601)
   - `tree_hash` — Git tree SHA
   - `parent_hashes` — Array of parent commit SHAs
   - `additions` — Lines added
   - `deletions` — Lines deleted
   - `files_changed` — Number of files modified
3. CLI sends the metadata to the backend (`POST /api/attestations`)
4. Backend computes an **attestation hash**:
   ```
   SHA-256(commit_hash | tree_hash | author | timestamp | sorted(parent_hashes))
   ```
5. Backend stores the commit + attestation in PostgreSQL
6. CLI displays the attestation hash and status

### On-Chain Anchoring (Optional)

1. User runs `zkcap onchain <commit-hash>`
2. CLI looks up the attestation for that commit
3. Backend submits the attestation hash on-chain (currently a placeholder)
4. Status is updated to `ONCHAIN` with a transaction hash

## Installation

```bash
cd cli
npm install

# Option A: Link globally (recommended for development)
npm link
# Now `zkcap` is available system-wide

# Option B: Run directly
node bin/zkcap.js <command>
```

## Commands Reference

### `zkcap login`

Authenticate with GitHub using the Device Flow.

```bash
$ zkcap login
→ Opening browser for GitHub authentication...
→ Enter code: ABCD-1234
→ ✓ Authenticated as @username
```

**Requires:** `ZKCAP_GITHUB_CLIENT_ID` environment variable set to your GitHub OAuth App's client ID.

---

### `zkcap logout`

Clear stored credentials from `~/.zkcap/credentials.json`.

```bash
$ zkcap logout
→ ✓ Logged out. Credentials removed.
```

---

### `zkcap whoami`

Show the currently authenticated GitHub user. Verifies the session is still valid by calling the backend.

```bash
$ zkcap whoami
→ Username: @sprem
→ GitHub ID: 12345678
```

---

### `zkcap repo add <owner/repo>`

Link a GitHub repository to your zkCAP account for commit tracking.

```bash
$ zkcap repo add sprem/my-private-repo
→ ✓ Repository sprem/my-private-repo linked
```

---

### `zkcap repo list`

List all repositories linked to your account.

```bash
$ zkcap repo list
→ 1. sprem/my-private-repo  (3 commits)
→ 2. sprem/another-repo     (0 commits)
```

---

### `zkcap attest <commit-hash>`

Create a verifiable attestation for a specific commit. Fetches metadata from GitHub and generates a SHA-256 attestation hash.

```bash
$ zkcap attest abc1234def5678 --repo sprem/my-repo

→ Commit:  abc1234d
→ Message: fix: resolve auth bug
→ Author:  sprem <sprem@email.com>
→ Stats:   +42 / -13 / 5 files
→
→ ✓ Attestation created
→ Attestation Hash: 7f3a9b2c...
→ Status: GENERATED
```

**Options:**
- `--repo, -r <owner/repo>` — Specify the repository. Auto-detected if only one is linked.

---

### `zkcap onchain <commit-hash>`

Anchor an existing attestation on-chain. The commit must already be attested.

```bash
$ zkcap onchain abc1234def5678
→ ✓ Attestation anchored on-chain
→ Status: ON-CHAIN
→ Transaction: 0xdeadbeef...
```

> **Note:** On-chain anchoring is currently a placeholder. The actual blockchain integration will be implemented in Phase 4 of the roadmap.

---

### `zkcap status`

View attestation statuses for all commits across your linked repos.

```bash
$ zkcap status

  HASH       STATUS       MESSAGE
  ────────────────────────────────────────────
  abc1234d   GENERATED    fix: resolve auth bug
  def5678a   ON-CHAIN     feat: add new endpoint
  
  Total: 2 attestation(s)
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ZKCAP_API_URL` | Backend API base URL | `http://localhost:8000` |
| `ZKCAP_GITHUB_CLIENT_ID` | GitHub OAuth App client ID | (required for login) |

### Credentials Storage

Credentials are stored at `~/.zkcap/credentials.json`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "github_username": "sprem",
  "github_avatar_url": "https://avatars.githubusercontent.com/..."
}
```

This file is created by `zkcap login` and removed by `zkcap logout`.

## Backend API Endpoints

The CLI communicates with these backend endpoints:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/github` | No | Exchange GitHub token for zkCAP JWT |
| `GET` | `/api/auth/me` | JWT | Get current user info |
| `POST` | `/api/projects` | JWT | Link a repository |
| `GET` | `/api/projects` | JWT | List linked repositories |
| `POST` | `/api/attestations` | JWT | Create an attestation |
| `GET` | `/api/attestations` | JWT | List all attestations |
| `POST` | `/api/attestations/{id}/onchain` | JWT | Submit attestation on-chain |

## Database Models

| Model | Key Fields | Description |
|-------|-----------|-------------|
| `User` | github_id, github_username, access_token_hash | GitHub-authenticated user |
| `Project` | user_id, name, github_repo | Linked GitHub repository |
| `Commit` | project_id, commit_hash, message, author, timestamp, tree_hash, parent_hashes, additions, deletions, files_changed | Commit with full metadata |
| `Attestation` | commit_id, status, attestation_hash, onchain_tx | Verifiable attestation |

## Tech Stack

### CLI (`cli/`)
- **Runtime:** Node.js 18+
- **Arg Parsing:** Commander.js
- **Output:** Chalk (colors) + Ora (spinners)
- **Auth:** GitHub Device Flow OAuth
- **HTTP:** Native `fetch` API

### Backend (`backend/`)
- **Framework:** FastAPI (Python 3.12)
- **ORM:** SQLAlchemy 2.0
- **Auth:** JWT (PyJWT) + GitHub OAuth verification (httpx)
- **Database:** PostgreSQL
- **Migrations:** Alembic
