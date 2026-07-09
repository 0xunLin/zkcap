# zkCAP Deployment Checklist

## Pre-Deployment Validation

- [ ] All database migrations applied: `alembic upgrade head`
- [ ] Backend tests passing: `pytest tests/` (if tests exist)
- [ ] Frontend builds without errors: `npm run build`
- [ ] No hardcoded secrets in codebase
- [ ] `.env` file created from `.env.example`
- [ ] All required environment variables set

## Database Setup

- [ ] PostgreSQL instance created: `CREATE DATABASE zkcap;`
- [ ] Database user created with proper permissions
- [ ] `DATABASE_URL` environment variable set
- [ ] Run migrations: `alembic upgrade head`
- [ ] Verify tables created: `\dt` in psql

## GitHub Configuration

- [ ] Repository created and ready for webhook
- [ ] Generate webhook secret: `openssl rand -hex 32`
- [ ] Set `GITHUB_WEBHOOK_SECRET` in `.env`
- [ ] Create GitHub Personal Access Token (PAT)
  - Scopes: `public_repo`, `read:user`
  - Set `GITHUB_API_TOKEN` in `.env`
- [ ] Add webhook in repo Settings:
  - URL: `https://your-backend.com/api/v1/webhooks/github`
  - Content type: `application/json`
  - Secret: (from `GITHUB_WEBHOOK_SECRET`)
  - Events: "Push events" only

## Backend Deployment

### Local Development
- [ ] `pip install -r requirements.txt`
- [ ] Create `.env` file
- [ ] `alembic upgrade head`
- [ ] `uvicorn main:app --reload`
- [ ] Verify: `curl http://localhost:8000/health`

### Production Server
- [ ] Install Python 3.12+
- [ ] Create virtual environment
- [ ] `pip install -r requirements.txt`
- [ ] Set environment variables (use secrets manager)
- [ ] Run migrations: `alembic upgrade head`
- [ ] Start with production ASGI server:
  ```bash
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker \
    -b 0.0.0.0:8000 main:app
  ```
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Configure SSL/TLS certificates
- [ ] Test: `curl https://your-backend.com/health`

## Solana Program Deployment

- [ ] Solana CLI installed: `solana --version`
- [ ] Install Anchor: `npm install -g @project-serum/anchor`
- [ ] Generate operator keypair: `solana-keygen new -o id.json`
  - Save in `~/.solana/id.json` or `SOLANA_OPERATOR_KEYPAIR_PATH`
- [ ] Airdrop SOL for testing: `solana airdrop 2 -k id.json --url devnet`
- [ ] Build program: `anchor build`
- [ ] Deploy to devnet: `anchor deploy --provider.cluster devnet`
- [ ] **IMPORTANT**: Copy program ID from deployment output
- [ ] Set `SOLANA_PROGRAM_ID` in `.env` with deployed program ID
- [ ] Set `SOLANA_RPC_ENDPOINT` (default: https://api.devnet.solana.com)
- [ ] Set `ENABLE_SOLANA_ANCHORING=True` in `.env`
- [ ] Test recording on-chain: Make a test commit to trigger pipeline

## TEE Agent Deployment

### Local Testing (Mock Mode)
- [ ] `cd worker/evaluation`
- [ ] `npm install`
- [ ] `npm run test:local`
- [ ] Set `PHALA_TEE_ENDPOINT=http://localhost:9090/invoke` (or mock endpoint)

### Production (Phala Network)
- [ ] Sign up for Phala Network: https://phala.network
- [ ] Get Phala Network testnet credentials
- [ ] Deploy TEE worker: (Follow Phala docs)
- [ ] Set `PHALA_TEE_ENDPOINT` to your Phala endpoint
- [ ] Set `TEE_CALLBACK_BASE_URL` to your backend public URL
- [ ] Set `GROQ_API_KEY` from Groq API console
- [ ] Test callback: Monitor backend logs for POST to `/evaluation/callback`

## zkTLS / Reclaim Protocol Setup

### Optional - For Production
- [ ] Sign up for Reclaim Protocol: https://reclaimprotocol.org
- [ ] Get API credentials
- [ ] Set `RECLAIM_API_KEY` in `.env`
- [ ] Set `ENABLE_ZKTLS_PROOFS=True` in `.env`
- [ ] Test proof generation: Make a test commit

## Frontend Deployment

### Local Development
- [ ] `cd frontend`
- [ ] `npm install`
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- [ ] `npm run dev`
- [ ] Test: http://localhost:3000

### Production
- [ ] `npm run build`
- [ ] Deploy to Vercel/Netlify/your hosting
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Test all pages load without errors
- [ ] Verify API calls reach correct backend
- [ ] Test in multiple browsers

## Monitoring & Observability

- [ ] Set up structured logging (Datadog, Splunk, CloudWatch)
- [ ] Monitor backend error rate
- [ ] Alert on failed attestations
- [ ] Track Solana transaction success rate
- [ ] Monitor database connection pool
- [ ] Set up uptime monitoring for health endpoint
- [ ] Configure PagerDuty/OpsGenie for critical alerts

## Security Hardening

- [ ] Enable HTTPS/TLS everywhere
- [ ] Set `DEBUG=False` in production
- [ ] Enable rate limiting on API endpoints
- [ ] Configure CORS to specific frontend domain only
- [ ] Rotate secrets before going live:
  - [ ] GitHub webhook secret
  - [ ] Groq API key
  - [ ] Reclaim API key
- [ ] Store secrets in vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] No secrets committed to git (use `.env` locally only)
- [ ] Run security audit:
  - [ ] `pip-audit` for Python dependencies
  - [ ] `npm audit` for Node dependencies
  - [ ] `cargo audit` for Rust dependencies

## Load Testing

- [ ] Estimate expected webhook volume
- [ ] Test database connection pool size
- [ ] Load test backend API (e.g., `ab`, `wrk`, `locust`)
- [ ] Monitor response times under load
- [ ] Check for database deadlocks
- [ ] Verify async task queue doesn't overflow

## Post-Deployment Verification

- [ ] Health check responds: `curl https://your-backend.com/health`
- [ ] API docs available: `https://your-backend.com/docs`
- [ ] Frontend loads: `https://your-domain.com`
- [ ] Create test project in dashboard
- [ ] Push test commit to GitHub
- [ ] Verify webhook is received
- [ ] Monitor attestation status transitions:
  - [ ] pending → tee_pending (TEE invocation)
  - [ ] tee_pending → tee_evaluated (TEE result received)
  - [ ] tee_evaluated → solana_recorded (on-chain recorded)
- [ ] Check frontend displays TEE score and Solana tx
- [ ] Verify Solana PDA created: `solana account <pda-address> --url devnet`
- [ ] Test error scenarios and verify graceful handling

## Rollback Plan

- [ ] Database backup before migrations
- [ ] Keep previous version deployed (blue-green deployment)
- [ ] Document rollback procedure:
  - [ ] Revert database: `alembic downgrade base`
  - [ ] Deploy previous backend version
  - [ ] Deploy previous frontend version
  - [ ] Solana program cannot be rolled back (immutable)
  
## Documentation

- [ ] Update README with deployment instructions
- [ ] Document any custom configurations
- [ ] Create runbook for common issues
- [ ] Document on-call escalation procedure
- [ ] Create incident response playbook

## Sign-Off

- [ ] All checklist items completed
- [ ] Deployment approved by team lead
- [ ] Security review passed
- [ ] Performance testing successful
- [ ] Ready for production!

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Notes**: 
