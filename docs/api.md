# API Reference

The backend provides a RESTful API powered by FastAPI. It serves as the central router between the GitHub webhooks, the Phala TEE workers, and the Next.js frontend.

All endpoints are prefixed with `/api/v1` except for the `/health` check.

## System Endpoints

- `GET /health` - Health check

## Project & Commit Endpoints

- `GET /api/v1/projects/` - List all projects
- `POST /api/v1/projects/` - Create a new project integration
- `GET /api/v1/commits/` - List ingested commits for a project
- `GET /api/v1/commits/{commit_id}` - Retrieve metadata for a specific commit

## Webhook & TEE Integration Endpoints

- `POST /api/v1/webhooks/github` 
  - **Description:** Ingests the initial push payload from GitHub. Strips out raw code diffs and triggers the asynchronous TEE evaluation worker.
  - **Security:** Requires valid `X-Hub-Signature-256` HMAC validation.

- `POST /api/v1/evaluation/callback`
  - **Description:** The secure endpoint where the Phala Network TEE sends the hardware-signed AI evaluation JSON.
  - **Payload:** Expects `{ commit_id, evaluation: { security_score, pass_evaluation, vulnerabilities, reasoning }, tee_execution }`.

## Attestation Endpoints

- `GET /api/v1/attestations/` - List all generated attestations.
- `GET /api/v1/attestations/{commit_id}` - Fetch the combined Midnight ZK proof and TEE hardware signature for a specific commit, alongside its Midnight ledger transaction ID.

Refer to `http://localhost:8000/docs` for interactive Swagger documentation and strict Pydantic schema details once the server is running.