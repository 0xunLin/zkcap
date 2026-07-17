# zkCAP

**Verifiable commit attestation protocol for private repositories.**

zkCAP lets developers attest their commits from private GitHub repos using a simple CLI. It fetches commit metadata, generates SHA-256 attestation hashes, and optionally anchors them on-chain — all without exposing source code.

## Architecture

```
Developer Terminal              zkCAP Backend              GitHub API
┌──────────────┐             ┌──────────────┐          ┌──────────────┐
│  zkcap CLI   │── REST ────▶│   FastAPI     │          │   GitHub     │
│  (Node.js)   │◀── JWT ────│   Server      │          │   REST API   │
└──────────────┘             └──────────────┘          └──────────────┘
       │                            │                         │
       │ 1. GitHub Device Flow ──────────────────────────────▶│
       │ 2. Exchange token ────────▶│                         │
       │ 3. Fetch commit data ───────────────────────────────▶│
       │ 4. Send to backend ───────▶│                         │
       │ 5. Get attestation ◀───────│                         │
```

| Component    | Stack                              | Directory    |
| ------------ | ---------------------------------- | ------------ |
| **CLI**      | Node.js, Commander, Chalk, Ora     | `cli/`       |
| **Backend**  | FastAPI, Python 3.12, SQLAlchemy   | `backend/`   |
| **Database** | PostgreSQL                         | —            |
| **Frontend** | Next.js, Tailwind CSS              | `frontend/`  |
| **Worker**   | Python (placeholder)               | `worker/`    |

## Repository Structure

```
zkcap/
├── cli/                   # CLI tool (primary interface)
│   ├── bin/zkcap.js       # Entry point
│   └── src/
│       ├── commands/      # login, logout, whoami, repo, attest, onchain, status
│       ├── lib/           # api client, auth storage, github api, config
│       └── utils/         # logger, spinner
├── backend/               # FastAPI API server
│   ├── app/
│   │   ├── api/           # Route handlers (auth, projects, attestations, webhooks)
│   │   ├── models/        # SQLAlchemy models (User, Project, Commit, Attestation)
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── database/      # DB engine & session
│   │   └── core/          # Config & auth middleware
│   ├── alembic/           # Database migrations
│   └── main.py            # Entry point
├── frontend/              # Next.js dashboard
├── worker/                # Background workers (placeholder)
├── docs/                  # Documentation
└── scripts/               # Setup & utility scripts
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.12+
- **PostgreSQL** 15+
- A **GitHub OAuth App** with Device Flow enabled

### 1. Clone & Setup Backend

```bash
git clone https://github.com/your-org/zkcap.git
cd zkcap/backend

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET

alembic upgrade head
uvicorn main:app --reload --port 8000
```

### 2. Setup CLI

```bash
cd cli
npm install
npm link    # Makes `zkcap` available globally
```

### 3. Use the CLI

```bash
# Authenticate with GitHub
zkcap login

# Link a repository
zkcap repo add owner/my-repo

# Attest a commit
zkcap attest abc1234def5678

# View attestation status
zkcap status

# Anchor on-chain (optional)
zkcap onchain abc1234def5678
```

## CLI Commands

| Command | Description |
| ------- | ----------- |
| `zkcap login` | Authenticate with GitHub (Device Flow) |
| `zkcap logout` | Clear stored credentials |
| `zkcap whoami` | Show current authenticated user |
| `zkcap repo add <owner/repo>` | Link a GitHub repository |
| `zkcap repo list` | List linked repositories |
| `zkcap attest <hash>` | Create a verifiable attestation for a commit |
| `zkcap onchain <hash>` | Anchor an attestation on-chain (optional) |
| `zkcap status` | View attestation statuses |

See [docs/cli.md](docs/cli.md) for detailed usage and examples.

## Database Models

| Model           | Description                                      |
| --------------- | ------------------------------------------------ |
| `User`          | GitHub-authenticated user                        |
| `Project`       | GitHub repository linked by a user               |
| `Commit`        | Commit with full metadata (hash, tree, parents)  |
| `Attestation`   | SHA-256 attestation linked to a commit           |

## API Documentation

Once the backend is running, interactive API docs are available at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

See [docs/api.md](docs/api.md) for endpoint documentation.

## Documentation

- [CLI Guide](docs/cli.md) — CLI commands, setup, and how it works
- [Architecture](docs/architecture.md) — System design and data flow
- [Roadmap](docs/roadmap.md) — Feature phases and milestones
- [API Reference](docs/api.md) — Endpoint documentation

## Roadmap

- **Phase 1 (MVP)** ✅: CLI interface, GitHub OAuth, commit attestation, basic API
- **Phase 2**: Merkle tree batch attestations
- **Phase 3**: Zero-knowledge proofs
- **Phase 4**: Blockchain anchoring (replace on-chain placeholder)
- **Phase 5**: AI-powered commit evaluation

## License

Private — All rights reserved.
