# Deploy to Vercel (Services)

## `vercel.json`

```json
{
  "experimentalServices": {
    "frontend": { "entrypoint": "frontend", "routePrefix": "/", "framework": "vite" },
    "backend": { "entrypoint": "backend", "routePrefix": "/api", "framework": "express" }
  }
}
```

- Browser calls **`/api/health`**, **`/api/profile/analyze`**, etc.
- Express defines routes as **`/health`**, **`/profile/...`** (Vercel strips the `/api` prefix).

## Required dashboard settings

1. **Framework preset:** **Services** (not Vite / Other).
2. **Environment variables:**

| Name | Value | Required |
|------|--------|----------|
| `CURSOR_API_KEY` | Your Cursor API key | **Yes** — without this you get demo jobs (Lumina, Nebula…) |
| `VITE_USE_MOCK_API` | `false` | **Yes** — must be exactly `false`, not empty |
| `VITE_API_URL` | `/api` | Yes |

Apply to **Production** and **Preview**. Redeploy after adding variables.

**Quick sync from local `backend/.env`** (after `npx vercel login`):

```bash
npm run vercel:sync-env
```

3. Redeploy after changing env vars (rebuild frontend).

## Verify after deploy

```bash
curl https://YOUR-APP.vercel.app/api/health
```

Expected: `{"ok":true,"agent":true,...}`

If you get **500** or `FUNCTION_INVOCATION_FAILED`, the backend did not build: ensure root **buildCommand** runs `npm run build` and redeploy.

If you get **HTML**, the API service is not running — check Framework preset **Services**.

**Required:** add `CURSOR_API_KEY` in Vercel → Settings → Environment Variables (Production).

If the app works on **localhost** but Vercel shows **Lumina / Nebula** demo cards, production is missing the key (`/api/health` → `"agent": false`). The key in `backend/.env` is never uploaded to Vercel — add it in the dashboard or run `npm run vercel:sync-env` after `npx vercel login`, then redeploy.

## Local dev

```bash
npm run dev:all
```

Frontend proxies `/api` → `localhost:3001`.
