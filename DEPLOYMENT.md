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

| Name | Value |
|------|--------|
| `CURSOR_API_KEY` | Your key |
| `VITE_USE_MOCK_API` | `false` |
| `VITE_API_URL` | `/api` |

3. Redeploy after changing env vars (rebuild frontend).

## Verify after deploy

```bash
curl https://YOUR-APP.vercel.app/api/health
```

Expected: `{"ok":true,"agent":true,...}`

If you get HTML, the API service is not running — check Framework preset **Services**.

## Local dev

```bash
npm run dev:all
```

Frontend proxies `/api` → `localhost:3001`.
