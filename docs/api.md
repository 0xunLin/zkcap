# zkCAP API Documentation

## Base URL

```
http://localhost:8000
```

## Endpoints

### Health Check

Check that the API server is running.

**Request**

```
GET /health
```

**Response** `200 OK`

```json
{
  "status": "ok"
}
```

---

## Planned Endpoints

> The following endpoints will be implemented in upcoming phases.

### Webhooks

#### GitHub Push Webhook

```
POST /webhooks/github
```

Receives push events from GitHub and stores commit data.

**Headers**

| Header              | Description                  |
| ------------------- | ---------------------------- |
| `X-Hub-Signature`   | GitHub HMAC signature        |
| `X-GitHub-Event`    | Event type (e.g., `push`)    |
| `X-GitHub-Delivery` | Unique delivery ID           |

---

### Projects

#### List Projects

```
GET /api/projects
```

#### Create Project

```
POST /api/projects
```

**Body**

```json
{
  "name": "my-app",
  "github_repo": "org/my-app"
}
```

#### Get Project

```
GET /api/projects/{project_id}
```

---

### Commits

#### List Commits for a Project

```
GET /api/projects/{project_id}/commits
```

#### Get Commit

```
GET /api/commits/{commit_id}
```

---

### Attestations

#### List Attestations

```
GET /api/attestations
```

#### Get Attestation for a Commit

```
GET /api/commits/{commit_id}/attestation
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

| Status Code | Description           |
| ----------- | --------------------- |
| `400`       | Bad Request           |
| `404`       | Not Found             |
| `422`       | Validation Error      |
| `500`       | Internal Server Error |
