# Architecture

zkCAP consists of a modular system to ingest, store, and prove commits from private repositories.

## Components

1. **GitHub Webhooks**: Pushes trigger a payload sent to our `/api/v1/webhooks/github` endpoint.
2. **Backend (FastAPI)**: Validates the payload, stores the commit, and triggers an asynchronous task to generate an attestation.
3. **Database (PostgreSQL)**: Relational storage for Projects, Commits, and Attestations.
4. **Worker (Background)**: Handles cryptographic operations, merkle tree generation, and blockchain anchoring.
5. **Frontend (Next.js)**: A dashboard to view projects, track commits, and verify attestations.


# Architecture

zkCAP (Zero-Knowledge Commit Attestation Protocol) is engineered from first principles to solve the "Stealth Startup Paradox": proving technical velocity and code stability to investors without exposing intellectual property. 

The system relies on three advanced cryptographic primitives orchestrated by a central API.

## Core Infrastructure Components

### 1. The Execution Sandbox (Phala Network TEE)
Instead of trusting human audits, zkCAP utilizes **Trusted Execution Environments (TEEs)** via the Phala Network. 
* When a commit is pushed, the codebase is securely routed into an Intel SGX hardware enclave.
* A deterministic AI agent (TypeScript/QuickJS) analyzes the code for vulnerabilities and logic flaws.
* The CPU hardware generates a Remote Attestation Quote—a mathematical signature proving the AI ran un-tampered and output a specific JSON score.
* *Directory:* `worker/evaluation/`

### 2. The Proving Layer (zkTLS via Reclaim Protocol)
To prevent founders from spoofing off-chain metrics or commit histories, zkCAP utilizes **zkTLS (TLSNotary/Reclaim)**.
* The off-chain client establishes a secure TLS session with the GitHub API.
* It generates a zero-knowledge proof that GitHub's servers confirmed the existence of a specific commit hash, author, and timestamp.
* This proves the data's authenticity while cryptographically redacting the actual repository code and OAuth tokens.
* *Directory:* `worker/zk-tls/`

### 3. The Trust Anchor (Solana & Anchor Framework)
To provide an immutable, decentralized ledger for due diligence, attestation states are anchored to **Solana**.
* **Program Derived Addresses (PDAs):** Used to deterministically store the state of `ProjectAccounts` and `MilestoneAccounts`.
* **Cross-Program Invocations (CPIs):** Once the Solana program verifies both the TEE hardware signature and the zkTLS proof, it triggers a CPI to mint a non-transferable Soulbound Token (SBT) representing a verified technical milestone to the developer's wallet.
* *Directory:* `worker/blockchain/`

### 4. Orchestration & Presentation (FastAPI & Next.js)
* **Backend:** A FastAPI server running PostgreSQL acts as the central courier. It catches the initial GitHub webhooks, triggers the TEE/zkTLS workers, and stores the non-sensitive relational metadata (Project Names, Display Scores).
* **Frontend:** A Next.js dashboard utilizing `@solana/web3.js` to allow investors to view the mathematically verified milestones and hardware signatures without ever seeing the raw source code.