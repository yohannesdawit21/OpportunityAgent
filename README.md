# Virtual Hackaton — OpportunityAgent

AI career assistant (React + Vite). Upload a profile, run analysis, browse matched roles, and apply with an AI helper.

## Quick start

**Frontend only (mock API):**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Frontend + backend (submission / live demo):**

```bash
npm install          # installs frontend, backend, and concurrently
cd backend && cp .env.example .env   # add CURSOR_API_KEY
cd ../frontend && cp .env.example .env   # VITE_USE_MOCK_API=false, VITE_API_URL=/api
```

One command (both servers):

```bash
npm run dev:all
```

Or two terminals: `npm run dev:backend` and `npm run dev` (frontend).

Open http://localhost:5173/ — you should see a **green “Live API”** banner. Use **Analyze Profile** (not the demo jump links). Skills on the dashboard come from the Cursor agent, not the fixed mock list.

**Still seeing mock data?** Profile → **Edit profile & re-analyze** (clears cached localStorage), or DevTools → Application → Local Storage → delete `opportunity-agent:app-state`.

## Demo flow (hackathon)

1. **Onboarding** (`/`) — enter name, upload resume or GitHub URL, tap **Analyze Profile**
2. **Scanning** (`/scanning`) — live progress (mock ~3s, backend uses Cursor agent)
3. **Dashboard** (`/dashboard`) — filters, match cards, **Apply Now** opens helper panel
4. **Leads / Network / Profile** — bottom nav on mobile, sidebar on desktop
5. **Onboarding** link on dashboard — return to edit profile anytime

Or use **Jump to any screen (demo)** on onboarding to skip ahead.

## Layout

| Path | Description |
|------|-------------|
| `frontend/` | React app (pages, API client, mock layer, UI) |
| `backend/` | Express API + `@cursor/sdk` agent for analyze & cover letters |
| `BACKEND.md` | REST API contract for the real backend |

## Routes

| Route | Screen |
|-------|--------|
| `/` | Onboarding |
| `/scanning` | AI scanning |
| `/dashboard` | Matched opportunities |
| `/leads` | Ranked leads |
| `/network` | Connections |
| `/profile` | Profile & reset |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_MOCK_API` | `true` | In-browser mock (no server required) |
| `VITE_API_URL` | `http://localhost:3001/api` | Backend when mock is off |

## Build

```bash
cd frontend && npm run build && npm run preview
```
