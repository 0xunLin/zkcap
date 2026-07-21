# Architecture

zkCAP consists of a modular system to ingest, store, and prove commits from private repositories.

## Components

1. **GitHub Webhooks**: Pushes trigger a payload sent to our `/api/v1/webhooks/github` endpoint.
2. **Backend (FastAPI)**: Validates the payload, stores the commit, and triggers an asynchronous task to generate an attestation.
3. **Database (PostgreSQL)**: Relational storage for Projects, Commits, and Attestations.
4. **Worker (Background)**: Handles cryptographic operations, private ZK proof generation, and blockchain anchoring.
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

### 2. The Proving Layer (Midnight & Compact Client-Side Prover)
To prevent founders from spoofing off-chain metrics or commit histories, zkCAP utilizes the **Midnight Network** and its ZK-focused smart contract language, **Compact**.
* The developer runs private contract execution locally on their client machine (or a private worker environment).
* The Compact compiler abstracts away the ZK complexity, automatically generating zero-knowledge proofs confirming the existence of a specific commit hash, author, and timestamp.
* This proves data existence and authenticity while keeping the underlying repository code and developer credentials completely private within the contract's private state.
* *Directory:* `worker/midnight/`

### 3. The Trust Anchor (Midnight Ledger State)
To provide an immutable, decentralized ledger for due diligence, attestation states are anchored to the **Midnight Ledger**.
* **Public Ledger State:** The public state of the Compact contract maintains a record of registered projects and their verified attestations, serving as a decentralized state machine.
* **On-Chain Verification:** When client-side proofs are submitted to the Midnight network, the ledger verifies the ZK proof on-chain and updates the public milestone state if valid, without exposing any private data.
* *Directory:* `worker/midnight/contract/`

### 4. Orchestration & Presentation (FastAPI & Next.js)
* **Backend:** A FastAPI server running PostgreSQL acts as the central courier. It catches the initial GitHub webhooks, triggers the TEE/Midnight workers, and stores the non-sensitive relational metadata (Project Names, Display Scores).
* **Frontend:** A Next.js dashboard utilizing the Midnight TypeScript SDK (`@midnight-ntwrk/sdk`) to allow investors to view the mathematically verified milestones and hardware signatures without ever seeing the raw source code.