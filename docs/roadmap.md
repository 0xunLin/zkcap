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

## Phase 3: The Data Bridge (zkTLS Protocol)
> Implement cryptographic proof of data existence without IP leakage.
- [ ] Integrate Reclaim Protocol / TLSNotary SDK.
- [ ] Generate zero-knowledge proofs of GitHub commit APIs.
- [ ] Validate zkTLS proofs on the backend before Solana submission.

## Phase 4: The Trust Anchor (Solana & SBTs)
> Anchor verified proofs to a decentralized state machine.
- [ ] Initialize Anchor workspace (`worker/blockchain`).
- [ ] Write Rust smart contract to derive `Project` and `Milestone` PDAs.
- [ ] Write verification instructions to require both TEE + zkTLS proofs.
- [ ] Implement CPIs to mint non-transferable Soulbound Tokens (SBTs) upon success.
- [ ] Integrate `@solana/web3.js` wallet adapter into the Next.js dashboard.