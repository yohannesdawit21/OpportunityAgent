# Deploy to Vercel

One Vercel project deploys the **React frontend** and **Express API** (serverless).

## Prerequisites

- [Vercel account](https://vercel.com)
- [Cursor API key](https://cursor.com/dashboard/cloud-agents) for live AI

## Deploy

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. **Framework preset:** Other (settings are read from `vercel.json`).
4. Add **Environment variables** (Production + Preview):

| Name | Value |
|------|--------|
| `CURSOR_API_KEY` | Your Cursor API key |
| `VITE_USE_MOCK_API` | `false` |
| `VITE_API_URL` | `/api` |
| `USE_AGENT_FALLBACK` | `false` (optional: `true` if no key) |

5. Deploy.

## After deploy

- Open your `*.vercel.app` URL.
- Green **Live API** banner should appear.
- Run **Analyze Profile** (wait up to ~2 minutes on first cold start).

## Notes

- **Function timeout:** `vercel.json` sets `maxDuration: 300` (5 min). Requires a Vercel plan that supports long-running functions (Pro / Fluid Compute). On Hobby, analyze may time out — use a local or Render backend instead.
- **Sessions:** API sessions are in-memory per serverless instance. The app stores results in the browser after analyze; cover-letter works best right after analysis on the same instance.
- **Local dev** is unchanged: `npm run dev:all` with backend on port 3001.

## CLI deploy

```bash
npm i -g vercel
vercel
vercel env add CURSOR_API_KEY
vercel --prod
```
