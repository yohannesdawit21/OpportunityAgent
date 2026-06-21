# OpportunityAgent — Backend Implementation Guide

This document defines the REST API contract the React frontend expects. The UI ships with a **mock layer** (`VITE_USE_MOCK_API=true`) and switches to real HTTP when you set `VITE_USE_MOCK_API=false` and point `VITE_API_URL` at your server.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Base URL for all endpoints (no trailing slash) |
| `VITE_USE_MOCK_API` | `true` | Set to `false` when backend is ready |

Copy `frontend/.env.example` to `frontend/.env`.

## Recommended stack

- **Runtime:** Node.js (Express/Fastify) or Python (FastAPI)
- **DB:** PostgreSQL (e.g. Neon) — optional; current build uses in-memory sessions
- **Storage:** S3-compatible bucket for resume PDFs
- **AI:** LLM for parsing resumes, scoring matches, generating cover letters
- **Jobs:** Redis queue for long-running “scan” workflows

## Authentication (phase 2)

The current UI has no login. For production, add:

- `POST /auth/register`, `POST /auth/login` → JWT
- Send `Authorization: Bearer <token>` on all routes below
- Scope opportunities and applications per `userId`

## API endpoints

### 1. Analyze profile

**`POST /api/profile/analyze`**

`multipart/form-data` (matches frontend `FormData`):

| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |
| `github` | string | no |
| `linkedin` | string | no |
| `resumeUploaded` | `"true"` \| `"false"` | yes |
| `resumeFileName` | string | no |
| `resume` | file (pdf/doc/docx) | if uploaded |

**Response `200`:**

```json
{
  "sessionId": "sess_abc123",
  "skillTags": ["Python", "React", "TensorFlow", "Node.js"],
  "aiStrengths": ["Full-Stack Architecture", "Rapid Prototyping"],
  "rolesScanned": 1240,
  "opportunities": [
    {
      "id": "lumina-senior-pe",
      "title": "Senior Product Engineer",
      "company": "Lumina Systems",
      "location": "San Francisco, CA",
      "matchScore": 92,
      "rationale": "…",
      "logoUrl": "https://…",
      "types": ["all", "remote"],
      "missingSkills": ["GraphQL Federation"],
      "coverLetter": "Dear …",
      "roadmap": [
        {
          "id": "1",
          "title": "Research Company Culture",
          "description": "…",
          "status": "done"
        }
      ]
    }
  ]
}
```

**Backend work:**

1. Parse resume (PDF/DOCX) → structured profile
2. Optional: fetch GitHub repos / LinkedIn public data
3. Run matching against job index → ranked opportunities
4. Generate per-job `rationale`, `coverLetter`, `roadmap`, `missingSkills`

**Errors:** `400` invalid file, `422` parsing failed, `500` server error

```json
{ "message": "Could not parse resume", "code": "PARSE_FAILED" }
```

---

### 2. List opportunities

**`GET /api/opportunities`**

Returns the latest matched list for the authenticated user (or session).

**Response `200`:** array of `Opportunity` objects (same shape as above).

---

### 3. Generate cover letter

**`POST /api/opportunities/:id/cover-letter`**

**Body:**

```json
{
  "profile": {
    "name": "Alex Chen",
    "github": "github.com/alex",
    "linkedin": "linkedin.com/in/alex"
  }
}
```

**Response `200`:**

```json
{ "coverLetter": "Dear Hiring Team…" }
```

---

### 4. Save application draft

**`PUT /api/applications/:opportunityId/draft`**

**Body:**

```json
{ "coverLetter": "…" }
```

**Response `200`:**

```json
{
  "draftId": "draft_lumina-senior-pe",
  "savedAt": "2026-05-17T12:00:00.000Z"
}
```

---

### 5. Submit application

**`POST /api/applications/:opportunityId/submit`**

**Body:**

```json
{ "coverLetter": "…" }
```

**Response `200`:**

```json
{
  "applicationId": "app_lumina_1715952000",
  "submittedAt": "2026-05-17T12:05:00.000Z"
}
```

---

## Optional: streaming scan progress

The UI currently animates scan steps client-side. For a production feel, add:

**`GET /api/profile/analyze/:sessionId/stream`** (SSE)

Events:

```json
{ "stepId": "github", "status": "active", "progress": 84 }
{ "stepId": "github", "status": "completed" }
```

Wire `ScanningPage` to this stream instead of timers.

## Database schema (sketch)

```sql
users (id, name, email, github, linkedin, created_at)
resumes (id, user_id, file_url, parsed_json, created_at)
analysis_sessions (id, user_id, status, roles_scanned, created_at)
opportunities (id, external_id, title, company, location, logo_url, …)
matches (id, session_id, opportunity_id, match_score, rationale, …)
applications (id, user_id, opportunity_id, cover_letter, status, submitted_at)
```

## Frontend files to know

| Path | Role |
|------|------|
| `src/api/opportunityAgentApi.ts` | HTTP client — implement against this |
| `src/api/mock/handlers.ts` | Reference mock behavior |
| `src/context/AppContext.tsx` | State + calls API |
| `src/lib/storage.ts` | Local persistence until auth exists |

## CORS

Allow the Vite dev origin:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Checklist for “backend done”

- [x] `POST /profile/analyze` accepts resume + links, returns opportunities
- [x] `GET /opportunities` returns persisted matches
- [x] Cover letter + draft + submit endpoints work
- [x] `.env` has `VITE_USE_MOCK_API=false`
- [x] Error bodies use `{ message, code? }`
- [x] File upload size limit (e.g. 10 MB) enforced

Implementation lives in `backend/` (Express + Google Gemini API via native `fetch`). Run `npm run dev:backend` and set `GEMINI_API_KEY` in `backend/.env`.
