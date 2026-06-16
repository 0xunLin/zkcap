# zkCAP Roadmap

## Phase 1 — MVP (Current)

> Establish the core platform: capture commits, generate basic attestations, display on a dashboard.

- [x] Monorepo structure
- [x] FastAPI backend with health check
- [x] SQLAlchemy models (Project, Commit, Attestation)
- [x] Alembic migration setup
- [x] Next.js frontend with dashboard
- [ ] GitHub webhook endpoint (`POST /webhooks/github`)
- [ ] Commit ingestion and storage
- [ ] Basic attestation generation (hash-based)
- [ ] Dashboard: display projects, commits, attestation status
- [ ] Project CRUD API
- [ ] Authentication (GitHub OAuth)

## Phase 2 — Merkle Trees & Batch Attestations

> Batch commits into Merkle trees for efficient, verifiable attestation proofs.

- [ ] Merkle tree construction from commit batches
- [ ] Merkle proof generation per commit
- [ ] Proof verification endpoint
- [ ] Batch attestation scheduling (cron or event-driven)

## Phase 3 — Zero-Knowledge Proofs

> Add ZK proofs to enable privacy-preserving attestations.

- [ ] ZK circuit design for commit attestation
- [ ] Proof generation pipeline
- [ ] On-chain proof verification
- [ ] Privacy controls (selective disclosure)

## Phase 4 — Blockchain Anchoring

> Anchor attestation roots on-chain for immutable, trustless verification.

- [ ] Smart contract development (Solidity / Cairo)
- [ ] On-chain Merkle root storage
- [ ] Transaction submission pipeline
- [ ] Block explorer integration

## Phase 5 — AI Evaluation

> AI-powered analysis of commits for quality, security, and compliance signals.

- [ ] LLM-based commit evaluation
- [ ] Code quality scoring
- [ ] Security vulnerability detection
- [ ] Compliance and policy checks
- [ ] Evaluation metadata in attestations
