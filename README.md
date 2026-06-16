# zkCAP

**Verifiable commit attestation protocol for private repositories.**

zkCAP captures commits from private GitHub repositories via webhooks, stores them securely, generates verifiable attestations, and presents everything through a clean dashboard.

## Architecture

```
GitHub Push → Webhook → Commit Storage → Attestation → Dashboard
```

| Component    | Stack                              | Directory    |
| ------------ | ---------------------------------- | ------------ |
| **Frontend** | Next.js, JavaScript, Tailwind CSS  | `frontend/`  |
| **Backend**  | FastAPI, Python 3.12, SQLAlchemy   | `backend/`   |
| **Database** | PostgreSQL                         | —            |
| **Worker**   | Python (placeholder)               | `worker/`    |

## Repository Structure

```
zkcap/
├── frontend/          # Next.js dashboard
├── backend/           # FastAPI API server
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   ├── database/  # DB engine & session
│   │   └── core/      # Config & settings
│   ├── alembic/       # Database migrations
│   └── main.py        # Entry point
├── worker/            # Background workers (placeholder)
│   ├── evaluation/
│   ├── merkle/
│   └── blockchain/
├── docs/              # Documentation
├── scripts/           # Setup & utility scripts
├── README.md
└── .gitignore
```

## Prerequisites

- **Python** 3.12+
- **Node.js** 20+
- **PostgreSQL** 15+
- **pip** (Python package manager)
- **npm** (Node package manager)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-org/zkcap.git
cd zkcap
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE zkcap;
```

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL if needed

# Run database migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Verify with:

```bash
curl http://localhost:8000/health
# → {"status":"ok"}
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### 5. One-Command Setup (Alternative)

```bash
bash scripts/setup.sh
```

## API Documentation

Once the backend is running, interactive API docs are available at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

See [docs/api.md](docs/api.md) for endpoint documentation.

## Database Models

| Model           | Description                                  |
| --------------- | -------------------------------------------- |
| `Project`       | GitHub repository being tracked              |
| `Commit`        | Individual commit captured via webhook       |
| `Attestation`   | Verifiable attestation linked to a commit    |

## Documentation

- [Architecture](docs/architecture.md) — System design and data flow
- [Roadmap](docs/roadmap.md) — Feature phases and milestones
- [API Reference](docs/api.md) — Endpoint documentation

## Roadmap

- **Phase 1 (MVP)**: Webhook ingestion, commit storage, basic attestations, dashboard
- **Phase 2**: Merkle tree batch attestations
- **Phase 3**: Zero-knowledge proofs
- **Phase 4**: Blockchain anchoring
- **Phase 5**: AI-powered commit evaluation

## License

Private — All rights reserved.
