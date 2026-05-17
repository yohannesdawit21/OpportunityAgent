# Deploy to Vercel (multi-service)

This project uses Vercel **Services** (`experimentalServices` in `vercel.json`):

| Service | Path | Role |
|---------|------|------|
| `frontend` | `/` | Vite + React SPA |
| `backend` | `/_/backend` | Express API + Cursor SDK |

Browser API calls go to `/_/backend/api/...` (see `frontend/.env.production`).

## Prerequisites

- [Vercel account](https://vercel.com) with **Services** enabled
- [Cursor API key](https://cursor.com/dashboard/cloud-agents)

## Deploy

1. Push the repo to GitHub.
2. [Import project](https://vercel.com/new) on Vercel.
3. **Framework preset:** set to **Services** (Project Settings → Build & Deployment).
4. Environment variables (Production + Preview):

| Name | Value |
|------|--------|
| `CURSOR_API_KEY` | Your Cursor API key |
| `VITE_USE_MOCK_API` | `false` |
| `VITE_API_URL` | `/_/backend/api` |
| `USE_AGENT_FALLBACK` | `false` |

5. Deploy.

## Local development

**Option A — separate terminals (current):**

```bash
npm run dev:backend   # :3001
npm run dev           # :5173, proxies /api → backend
```

**Option B — Vercel Services locally:**

```bash
npx vercel dev -L
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on all routes | Framework preset must be **Services**, not Vite/Other |
| API 404 | Use `VITE_API_URL=/_/backend/api`, not `/api` |
| Analyze timeout | Backend `maxDuration` is 300s; needs a plan that supports long functions |
| CORS errors | Use relative API URL `/_/backend/api` (same origin) |

## CLI

```bash
npx vercel
npx vercel env add CURSOR_API_KEY
npx vercel --prod
```
