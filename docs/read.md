# zkCAP Implementation Guide

## Overview

zkCAP is a complete, production-ready system for verifying private code commits using cryptographic attestations. The system orchestrates three advanced cryptographic primitives:

1. **Phala Network TEE** (Trusted Execution Environment) - Evaluates code in Intel SGX hardware
2. **Reclaim Protocol / zkTLS** - Proves GitHub commit existence without revealing auth tokens
3. **Solana Blockchain** - Anchors verified attestations and mints Soulbound Tokens

## Complete Data Flow

```
GitHub Push Event
    ↓
[1] FastAPI Webhook Handler (/api/v1/webhooks/github)
    • Verifies HMAC-SHA256 signature
    • Creates Project (if new repository)
    • Stores Commit record
    • Queues async TEE evaluation
    • Queues async zkTLS proof generation
    ↓
[2] Async TEE Invocation (background)
    • POST → Phala TEE endpoint
    • Pass: commit_id, commit_hash, commit_diff, author
    • TEE returns: invocation_id
    • Update attestation.tee_invocation_id
    ↓
[3] Async zkTLS Proof Generation (background)
    • Invoke Reclaim Protocol
    • Generate zero-knowledge proof of commit
    • Store proof in commit.zkTLS_proof
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
    • Trigger Solana recording
    ↓
[6] Solana Recording (if enabled)
    • Create ProjectAccount PDA (if new)
    • Create AttestationAccount PDA
    • Record security_score + TEE signature + zkTLS proof
    • Emit AttestationRecorded event
    • (Optionally) mint SBT to developer wallet
    ↓
[7] Frontend Displays Attestation
    • Fetch /api/v1/attestations/
    • Show TEE security score
    • Show Solana transaction signature
    • Link to Solana Explorer
    • Display SBT status if minted
```

## Architecture

### Backend (FastAPI + PostgreSQL)

**Database Models:**
- `Project`: GitHub repository being tracked
- `Commit`: Individual commit with optional zkTLS proof
- `Attestation`: Evaluation result with TEE score, Solana tx, SBT mint

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
- `zktls_service`: Generates and validates zkTLS proofs

**Integrations:**
- `tee_worker.py`: Client for Phala TEE invocation
- `solana_program.py`: Client for Solana Anchor program

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

### zkTLS / Reclaim Protocol

**Purpose:** Prove GitHub commit exists without revealing OAuth token or code

**Input:** Commit hash, author, repository URL
**Output:**
```json
{
  "proof": "zktls_proof_...",
  "claim": {
    "epoch": 1688169600,
    "identifier": "github.com/owner/repo#abc1234",
    "owner": "John Doe",
    "context": {
      "provider": "github-api-tlsnotary",
      "commit_hash": "abc1234567890",
      "repository": "https://github.com/owner/repo"
    }
  },
  "redactedParams": "Authorization,Cookie,token"
}
```

### Solana Program (Anchor)

**Program: zkcap_attestation**

**Accounts:**
1. `ProjectAccount` - PDA seeds: `["project", project_id]`
   - Tracks total attestations per project
   - Stores project authority + repository URL

2. `AttestationAccount` - PDA seeds: `["attestation", project_id, commit_hash]`
   - Stores security_score
   - Stores TEE hardware signature
   - Stores zkTLS proof
   - Links to SBT mint address

**Instructions:**
- `initialize_project(project_id, repository_url)` - Create project PDA
- `record_attestation(project_id, commit_hash, security_score, tee_signature, zkTLS_proof)` - Record on-chain
- `mint_sbt(recipient, project_id, commit_hash)` - Issue Soulbound Token

**Events:**
- `ProjectInitialized` - New project registered
- `AttestationRecorded` - New verified milestone
- `SBTMinted` - Soulbound token issued to developer

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
- Rust & Cargo (for Solana)
- Solana CLI
- Anchor v0.29.0+

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

### 2. Solana Program Setup

```bash
cd worker/blockchain

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Copy program ID from output and update SOLANA_PROGRAM_ID in backend/.env
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
solana_recorded (on-chain recorded)
  ├─ sbt_minted (if eligible & enabled)
  
Error states:
  • error (TEE invocation failed)
  • solana_error (blockchain recording failed)
```

## Configuration Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `GITHUB_WEBHOOK_SECRET` - Shared secret for webhook signature verification

### TEE Integration
- `PHALA_TEE_ENDPOINT` - Phala TEE worker URL
- `TEE_CALLBACK_BASE_URL` - Your backend's public URL
- `GROQ_API_KEY` - Groq LLM API key

### Solana Integration
- `SOLANA_PROGRAM_ID` - Deployed Anchor program ID
- `SOLANA_RPC_ENDPOINT` - Solana cluster RPC URL
- `SOLANA_OPERATOR_KEYPAIR_PATH` - Path to operator wallet
- `ENABLE_SOLANA_ANCHORING` - Set to True to enable

### Optional
- `ENABLE_ZKTLS_PROOFS` - Enable zkTLS proof generation
- `RECLAIM_API_KEY` - Reclaim Protocol API key
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
- **Secure keypair storage**: Use AWS Secrets Manager or HashiCorp Vault for Solana keypair
- **Rate limiting**: Add rate limiting to endpoints
- **CORS configuration**: Restrict CORS to known frontend domains
- **Input validation**: All Pydantic schemas validate strictly

### TEE Security
- Phala Network ensures code executes in Intel SGX hardware
- Hardware attestation quotes prove execution
- Code and data are encrypted in TEE memory

### Blockchain Security
- Solana program is immutable once deployed
- PDAs ensure deterministic account derivation
- Cross-program invocations (CPIs) for SBT minting

## Troubleshooting

**Attestation stuck in `tee_pending`**
- Check `PHALA_TEE_ENDPOINT` is reachable
- Verify `TEE_CALLBACK_BASE_URL` is accessible from TEE
- Check backend logs for HTTP errors

**Solana transaction failed**
- Ensure `SOLANA_OPERATOR_KEYPAIR_PATH` exists and has SOL balance
- Verify `SOLANA_PROGRAM_ID` matches deployed program
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
- Solana program events (via Solana RPC)
- TEE callback delivery (HTTP 2xx responses)
- Frontend console (browser DevTools)

## Next Steps for Production

1. **Deploy Solana program to mainnet-beta**
   - Update `SOLANA_PROGRAM_ID` and `SOLANA_RPC_ENDPOINT`

2. **Configure Phala Network mainnet**
   - Update `PHALA_TEE_ENDPOINT` to production

3. **Enable Reclaim Protocol**
   - Set `ENABLE_ZKTLS_PROOFS=True`
   - Configure `RECLAIM_API_KEY`

4. **Add monitoring & alerts**
   - Set up Datadog, New Relic, or similar
   - Alert on failed attestations or Solana errors

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
- **Solana Anchor**: https://www.anchor-lang.com
- **Reclaim Protocol**: https://www.reclaimprotocol.org
- **FastAPI**: https://fastapi.tiangolo.com
- **Next.js**: https://nextjs.org
