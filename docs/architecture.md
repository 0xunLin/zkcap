# zkCAP Architecture

## Overview

zkCAP (Zero-Knowledge Commit Attestation Protocol) is a platform that generates verifiable attestations for commits in private GitHub repositories. It enables organizations to prove the authenticity and integrity of their development work without exposing proprietary source code.

## System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   GitHub     │────▶│   Webhook    │────▶│  Commit Storage │
│  Repository  │     │   Handler    │     │   (PostgreSQL)  │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Dashboard   │◀────│   REST API   │◀────│   Attestation   │
│  (Next.js)   │     │  (FastAPI)   │     │   Generator     │
└─────────────┘     └──────────────┘     └─────────────────┘
```

## Components

### Frontend (`frontend/`)

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **Purpose**: Dashboard for viewing projects, commits, and attestations

### Backend (`backend/`)

- **Framework**: FastAPI (Python 3.12)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Purpose**: REST API, webhook handler, attestation generation logic

### Worker (`worker/`)

- **Status**: Placeholder — not yet implemented
- **Future modules**:
  - `evaluation/` — AI-powered commit evaluation
  - `merkle/` — Merkle tree construction for batch attestations
  - `blockchain/` — On-chain attestation anchoring

### Database

- **Engine**: PostgreSQL
- **Models**:
  - `Project` — Represents a GitHub repository being tracked
  - `Commit` — Individual commits captured via webhooks
  - `Attestation` — Generated attestations linked to commits

## Data Flow

1. **Commit Event**: A developer pushes to a private GitHub repository
2. **Webhook**: GitHub fires a webhook to the zkCAP backend
3. **Storage**: The backend parses the payload and stores commit metadata
4. **Attestation**: An attestation is generated for the commit
5. **Dashboard**: The frontend displays projects, commits, and attestation statuses

## API Design

- RESTful JSON API
- CORS enabled for frontend dev server (`localhost:3000`)
- Health check at `GET /health`
- Future: webhook endpoint, CRUD for projects/commits/attestations
