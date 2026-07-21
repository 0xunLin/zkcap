# zkCAP Execution Roadmap

This roadmap defines the 4-phase execution plan for the S.N. Bose Summer Internship. It prioritizes modular development, isolating the blockchain, TEE, and zkTLS layers to maximize engineering efficiency.

## Phase 1: Ingestion & Orchestration (The Baseline)
> Establish the central data flow and user interface.
- [x] Monorepo architecture setup.
- [x] FastAPI PostgreSQL database modeling (`Project`, `Commit`, `Attestation`).
- [ ] GitHub webhook ingestion (`POST /webhooks/github`).
- [ ] Next.js Dashboard scaffolding (Commit timeline UI).

## Phase 2: The Execution Vault (Phala TEE & AI)
> Implement deterministic, zero-trust code evaluation.
- [x] Engineer the DevSecOps LLM system prompt.
- [x] Build the TypeScript agent for Phala QuickJS compatibility.
- [x] Local TEE simulation via Node.js mocking.
- [ ] Deploy agent to Phala Network Testnet.
- [ ] Connect TEE hardware signature callback to FastAPI backend.

## Phase 3: The Private Prover (Midnight & Compact Client)
> Implement cryptographic proof of data existence without IP leakage.
- [x] Install and configure the Midnight Compact (`minokawa` compiler) toolchain.
- [x] Write the client-side private contract code in Compact (`zkcap.compact`) to verify commit metadata.
- [x] Generate WASM/JS prover code and compile zero-knowledge circuits.
- [x] Integrate generated client-side prover into the backend attestation service.

## Phase 4: The Trust Anchor (Midnight Ledger State)
> Anchor verified proofs to a decentralized state machine.
- [x] Deploy compiled Compact ledger contract to the Midnight Testnet.
- [x] Implement public state transitions in Compact to verify ZK proofs and store the attestation state.
- [x] Integrate Midnight TypeScript SDK (`@midnight-ntwrk/sdk`) for ledger anchoring.
- [x] Connect backend attestation workflow to submit transaction proofs on-chain.
- [x] Update Next.js dashboard to verify state proofs and link to Midnight transaction explorers.