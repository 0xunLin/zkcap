# zkCAP Implementation Guide

## Overview

zkCAP is a complete, production-ready system for verifying private code commits using cryptographic attestations. The system orchestrates three advanced cryptographic primitives:

1. **Phala Network TEE** (Trusted Execution Environment) - Evaluates code in Intel SGX hardware
2. **Midnight Network & Compact Smart Contract** - Generates client-side zero-knowledge proofs of commit data existence and anchors them on-chain to the public ledger state.

## Complete Data Flow

```
GitHub Push Event
    ↓
[1] FastAPI Webhook Handler (/api/v1/webhooks/github)
    • Verifies HMAC-SHA256 signature
    • Creates Project (if new repository)
    • Stores Commit record
    • Queues async TEE evaluation
    • Queues async Midnight Compact ZK proof generation
    ↓
[2] Async TEE Invocation (background)
    • POST → Phala TEE endpoint
    • Pass: commit_id, commit_hash, commit_diff, author
    • TEE returns: invocation_id
    • Update attestation.tee_invocation_id
    ↓
[3] Async Midnight ZK Proof Generation (background)
    • Invoke Midnight Compact client-side prover (local worker environment)
    • Generate zero-knowledge proof of commit metadata validity
    • Store generated proof in commit.midnight_proof
    ↓
[4] Phala TEE Evaluates Commit
    • Runs DevSecOps LLM via Groq API
    • Analyzes commit for vulnerabilities
    • Generates security_score (0-100)
    • Returns hardware-signed evaluation
    ↓
[5] TEE Calls Back (/api/v1/evaluation/callback)
    • POST receives: evaluation + tee_execution
    • Update attestation.tee_evaluation
    • Update attestation.tee_execution (hardware signature)
    • Set status: tee_evaluated
    • Trigger Midnight recording
    ↓
[6] Midnight Recording (if enabled)
    • Verify ZK proof on the Midnight ledger
    • Update public ledger state for Project and Commit attestation hash
    • Emit AttestationAnchored event on-chain
    ↓
[7] Frontend Displays Attestation
    • Fetch /api/v1/attestations/
    • Show TEE security score
    • Show Midnight transaction ID
    • Link to Midnight Block Explorer
```

## Architecture

### Backend (FastAPI + PostgreSQL)

**Database Models:**
- `Project`: GitHub repository being tracked
- `Commit`: Individual commit with optional Midnight proof
- `Attestation`: Evaluation result with TEE score, Midnight transaction, and ledger commitment

**API Endpoints:**
```
GET  /api/v1/projects/
POST /api/v1/projects/
GET  /api/v1/commits/
GET  /api/v1/attestations/
GET  /api/v1/attestations/{id}
POST /api/v1/webhooks/github              # GitHub webhook ingestion
POST /api/v1/evaluation/callback          # TEE result callback
```

**Services:**
- `project_service`: CRUD for projects
- `commit_service`: CRUD for commits
- `attestation_service`: Queues TEE evaluation, manages status transitions
- `midnight_service`: Manages Midnight Compact prover execution and ledger submissions

**Integrations:**
- `tee_worker.py`: Client for Phala TEE invocation
- `midnight_client.py`: Client for submitting verification txs to Midnight ledger

### TEE Agent (Phala Network)

**Technology Stack:**
- Phala SDK (Intel SGX)
- TypeScript/QuickJS runtime
- Groq LLM API for code evaluation

**Input:** Commit diff + metadata
**Output:** 
```json
{
  "security_score": 85,
  "pass_evaluation": true,
  "vulnerabilities": [
    {
      "type": "sql_injection",
      "severity": "high",
      "description": "Unparameterized query in database.py:42"
    }
  ],
  "reasoning": "Code passes security baseline with minor concerns about SQL injection risk..."
}
```

### Midnight & Compact ZK Contract

**Purpose:** Prove commit validity off-chain without revealing private repository code or auth tokens, and anchor the verified status to the Midnight public state machine.

**Language:** Compact (TypeScript-like domain-specific language for zero-knowledge smart contracts)

**Contract: zkcap.compact**

**State Structure:**
- **Private State:**
  - `commit_hash`: Actual Git commit hash
  - `author_signature`: GitHub author credentials signature
  - `repository_id`: Repository identifier
- **Public State:**
  - `attestation_hash`: SHA-256 hash of project ID and commit hash, representing the public proof identifier.
  - `is_verified`: Boolean tracking whether the attestation is verified and anchored on the ledger.

**Public Transactions / Transitions:**
- `initialize_project(project_id, owner_pubkey)` - Register a new project on the ledger.
- `verify_and_anchor_attestation(project_id, attestation_hash, zk_proof)` - Verify a client-generated ZK proof on-chain and record the verified milestone in public ledger state.

### Frontend (Next.js)

**Pages:**
- `/projects` - List all tracked repositories
- `/commits` - List ingested commits (with zkTLS badges)
- `/attestations` - List all evaluations (with TEE scores)
- `/attestations/[id]` - Detail view (expanded all fields)

**Victorian Ledger Aesthetic:**
- Deep slate backgrounds (Tailwind: slate-900, slate-950)
- Gold/amber accents (Tailwind: amber-400, amber-600)
- Serif typography (Playfair Display, EB Garamond)
- Monospace for hashes (Courier Prime)
- Dense, historical ledger-style layout
- Rounded corners replaced with sharp rectangles
- Border styling: 2px solid with gold accents

**Data Fetching:**
- Client-side fetching for real-time polling
- Refetch on interval (optional)
- Error boundaries and loading states

## Setup & Deployment

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- Midnight Compact Toolchain (`minokawa` compiler)
- Midnight SDK

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
```

### 2. Midnight Contract Setup

```bash
cd worker/midnight

# Compile the Compact contract
compactc contract/zkcap.compact

# Deploy to Testnet using Midnight CLI/SDK
npm run deploy:testnet

# Copy the deployed contract address and update MIDNIGHT_CONTRACT_ADDRESS in backend/.env
```

### 3. TEE Agent Setup (Optional - for testing)

```bash
cd worker/evaluation

npm install
npm run test:local  # Local simulation
# For production, deploy to Phala Network
```

### 4. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Navigate to `http://localhost:3000`

### 5. GitHub Webhook Configuration

1. Go to your repository Settings → Webhooks
2. Add webhook:
   - Payload URL: `https://your-backend.com/api/v1/webhooks/github`
   - Content type: `application/json`
   - Secret: Use value from `GITHUB_WEBHOOK_SECRET`
   - Events: Select "Push events"

## Status Transitions

An attestation progresses through these states:

```
pending
  ↓
tee_pending (awaiting TEE evaluation)
  ↓
tee_evaluated (TEE result received)
  ↓
midnight_recorded (on-chain recorded)
  
Error states:
  • error (TEE invocation failed)
  • midnight_error (blockchain recording failed)
```

## Configuration Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `GITHUB_WEBHOOK_SECRET` - Shared secret for webhook signature verification

### TEE Integration
- `PHALA_TEE_ENDPOINT` - Phala TEE worker URL
- `TEE_CALLBACK_BASE_URL` - Your backend's public URL
- `GROQ_API_KEY` - Groq LLM API key

### Midnight Integration
- `MIDNIGHT_CONTRACT_ADDRESS` - Deployed Compact contract address
- `MIDNIGHT_RPC_ENDPOINT` - Midnight node RPC endpoint
- `MIDNIGHT_OPERATOR_KEY_PATH` - Path to operator wallet key
- `ENABLE_MIDNIGHT_ANCHORING` - Set to True to enable on-chain anchoring

### Optional
- `ENABLE_MIDNIGHT_ZK_PROOFS` - Enable Midnight zero-knowledge proof generation
- `DEBUG` - Set to True for verbose logging

## API Examples

### Ingest Commit via Webhook

```bash
curl -X POST http://localhost:8000/api/v1/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=signature_here" \
  -d '{
    "repository": {
      "name": "my-repo",
      "full_name": "owner/my-repo",
      "html_url": "https://github.com/owner/my-repo"
    },
    "commits": [{
      "id": "abc1234567890def",
      "author": {"name": "John Doe"},
      "message": "Fix SQL injection vulnerability",
      "timestamp": "2026-07-01T12:00:00Z"
    }]
  }'
```

### Receive TEE Evaluation

```bash
curl -X POST http://localhost:8000/api/v1/evaluation/callback \
  -H "Content-Type: application/json" \
  -d '{
    "invocation_id": "phala_inv_xyz",
    "commit_id": 1,
    "evaluation": {
      "security_score": 85,
      "pass_evaluation": true,
      "vulnerabilities": [],
      "reasoning": "Code passed security baseline..."
    },
    "tee_execution": {
      "hardware_signature": "sgx_quote_...",
      "timestamp": "2026-07-01T12:05:00Z"
    }
  }'
```

### Query Attestation

```bash
curl http://localhost:8000/api/v1/attestations/1 | jq .
```

## Security Considerations

### In Production
- **Rotate secrets regularly**: GitHub webhook secret, Groq API key
- **Use HTTPS everywhere**: Backend, TEE callbacks, webhook URLs
- **Secure keypair storage**: Use AWS Secrets Manager or HashiCorp Vault for Midnight key
- **Rate limiting**: Add rate limiting to endpoints
- **CORS configuration**: Restrict CORS to known frontend domains
- **Input validation**: All Pydantic schemas validate strictly

### TEE Security
- Phala Network ensures code executes in Intel SGX hardware
- Hardware attestation quotes prove execution
- Code and data are encrypted in TEE memory

### Blockchain Security
- Midnight contract compiles to deterministic zero-knowledge circuits
- Private states ensure off-chain data confidentiality
- Public state updates reflect verification on the public ledger

## Troubleshooting

**Attestation stuck in `tee_pending`**
- Check `PHALA_TEE_ENDPOINT` is reachable
- Verify `TEE_CALLBACK_BASE_URL` is accessible from TEE
- Check backend logs for HTTP errors

**Midnight transaction failed**
- Ensure `MIDNIGHT_OPERATOR_KEY_PATH` exists and has tDUST balance
- Verify `MIDNIGHT_CONTRACT_ADDRESS` matches deployed program
- Check RPC endpoint is responsive

**Frontend not updating**
- Clear browser cache (Ctrl+Shift+Delete)
- Check backend API response: `curl http://localhost:8000/api/v1/attestations/`
- Verify `NEXT_PUBLIC_API_URL` is correct

## Monitoring & Logging

All components emit structured logs:

```python
import logging
logger = logging.getLogger(__name__)
logger.info(f"Attestation created: {attestation_id}")
logger.error(f"TEE invocation failed: {error}")
```

Monitor these in production:
- Backend `/logs` endpoint (if exposed)
- Midnight transaction records and ledger events
- TEE callback delivery (HTTP 2xx responses)
- Frontend console (browser DevTools)

## Next Steps for Production

1. **Deploy Midnight contract to mainnet**
   - Update `MIDNIGHT_CONTRACT_ADDRESS` and `MIDNIGHT_RPC_ENDPOINT`

2. **Configure Phala Network mainnet**
   - Update `PHALA_TEE_ENDPOINT` to production

3. **Enable Midnight ZK Proofs**
   - Set `ENABLE_MIDNIGHT_ZK_PROOFS=True`

4. **Add monitoring & alerts**
   - Set up Datadog, New Relic, or similar
   - Alert on failed attestations or Midnight errors

5. **Load testing**
   - Test with realistic commit volume
   - Monitor database connection pooling
   - Scale horizontally if needed

6. **Security audit**
   - Perform code review of Solana program
   - Audit backend API for vulnerabilities
   - Penetration test webhook handling

## Support & Resources

- **Phala Network**: https://phala.network
- **Midnight Network**: https://midnight.network
- **FastAPI**: https://fastapi.tiangolo.com
- **Next.js**: https://nextjs.org
