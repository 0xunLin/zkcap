<p align="center">
  <img src="https://img.shields.io/badge/zkCAP-Commit_Attestation-6366f1?style=for-the-badge&labelColor=0b0f1a" alt="zkCAP" />
</p>

<h1 align="center">zkCAP</h1>

<p align="center">
  <strong>Zero-Knowledge Commit Attestation Protocol</strong><br/>
  Prove the integrity of your private repository commits — without revealing source code.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.12-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/next.js-14-000000?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## What is zkCAP?

zkCAP enables developers to generate verifiable attestations for commits in private GitHub repositories. Each attestation is a SHA-256 hash derived from the commit's metadata (hash, tree, author, timestamp, parent commits), providing cryptographic proof of commit integrity without exposing any source code.

**Key capabilities:**
- 🔐 **GitHub OAuth** — Authenticate securely via GitHub
- 📂 **Repository Linking** — Connect private repos for commit tracking
- ✅ **Commit Attestation** — Generate SHA-256 attestation hashes from commit metadata
- ⛓️ **On-Chain Anchoring** — Optionally anchor attestations on-chain for immutability
- 🖥️ **Browser Terminal** — Interactive CLI-style terminal built into the web dashboard

---

## Architecture

```
  Browser (Next.js)              Backend (FastAPI)            GitHub API
┌────────────────────┐       ┌────────────────────┐      ┌──────────────┐
│  Dashboard UI      │       │  REST API          │      │              │
│  Terminal UI       │──────▶│  JWT Auth          │      │  OAuth       │
│  OAuth Popup       │◀──────│  SQLAlchemy ORM    │◀────▶│  Commits     │
└────────────────────┘       └────────┬───────────┘      │  Repos       │
                                      │                  └──────────────┘
                              ┌───────┴───────┐
                              │  PostgreSQL   │
                              └───────────────┘
```

| Component    | Stack                            | Directory    |
|:-------------|:---------------------------------|:-------------|
| Frontend     | Next.js 14, Tailwind CSS         | `frontend/`  |
| Backend      | FastAPI, Python 3.12, SQLAlchemy | `backend/`   |
| Database     | PostgreSQL 15+                   | —            |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.12+
- **PostgreSQL** 15+
- **GitHub OAuth App** — [Create one here](https://github.com/settings/applications/new)
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/api/auth/callback`

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env        # Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_GITHUB_CLIENT_ID=<your-client-id>
# GITHUB_CLIENT_SECRET=<your-client-secret>

npm run dev
```

Open **http://localhost:3000** → Navigate to **Terminal** → Type `zkcap login` to get started.

---

## Terminal Commands

The web dashboard includes an interactive terminal. All commands use the `zkcap` prefix:

| Command                      | Description                          |
|:-----------------------------|:-------------------------------------|
| `zkcap login`                | Authenticate with GitHub             |
| `zkcap logout`               | Clear session                        |
| `zkcap whoami`               | Display current user                 |
| `zkcap repo add <owner/repo>`| Link a GitHub repository            |
| `zkcap repo list`            | List linked repositories             |
| `zkcap attest <hash>`        | Generate attestation for a commit    |
| `zkcap onchain <hash>`       | Anchor attestation on-chain          |
| `zkcap status`               | View all attestation statuses        |

---

## Project Structure

```
zkcap/
├── frontend/                   # Next.js web application
│   ├── app/
│   │   ├── components/         # Terminal, Sidebar, TerminalOutput
│   │   ├── lib/                # API client, command engine, parsers
│   │   ├── terminal/           # Terminal page
│   │   ├── projects/           # Projects management page
│   │   ├── attestations/       # Attestations dashboard
│   │   ├── commits/            # Commits explorer
│   │   └── api/auth/callback/  # GitHub OAuth callback route
│   └── ...
├── backend/                    # FastAPI REST API
│   ├── app/
│   │   ├── api/                # Route handlers
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── core/               # Auth middleware, config
│   │   └── database/           # DB engine & session
│   ├── alembic/                # Database migrations
│   └── main.py
├── docs/                       # Documentation
└── scripts/                    # Utility scripts
```

---

## API

Interactive API documentation is available when the backend is running:

| Format     | URL                             |
|:-----------|:--------------------------------|
| Swagger UI | `http://localhost:8000/docs`     |
| ReDoc      | `http://localhost:8000/redoc`    |

### Key Endpoints

| Method | Endpoint                          | Auth | Description                  |
|:-------|:----------------------------------|:-----|:-----------------------------|
| POST   | `/api/auth/github`                | —    | Exchange GitHub token for JWT |
| GET    | `/api/auth/me`                    | JWT  | Current user info            |
| POST   | `/api/projects`                   | JWT  | Link a repository            |
| GET    | `/api/projects`                   | JWT  | List linked repositories     |
| POST   | `/api/attestations`               | JWT  | Create an attestation        |
| GET    | `/api/attestations`               | JWT  | List attestations            |
| POST   | `/api/attestations/{id}/onchain`  | JWT  | Submit attestation on-chain  |

---

## Data Models

| Model         | Purpose                                                    |
|:--------------|:-----------------------------------------------------------|
| `User`        | GitHub-authenticated user with hashed access token         |
| `Project`     | Linked GitHub repository scoped to a user                  |
| `Commit`      | Full commit metadata — SHA, tree, parents, author, stats   |
| `Attestation` | SHA-256 attestation hash with status tracking              |

**Attestation hash computation:**

```
SHA-256( commit_hash | tree_hash | author | timestamp | sorted(parent_hashes) )
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is proprietary. All rights reserved.
