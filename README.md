# Virtual Hackaton — OpportunityAgent

AI career assistant (React + Vite). Upload a profile, run analysis, browse matched roles, and apply with an AI helper.

## Quick start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173/

From the repo root: `npm run dev` (runs the frontend).

## Demo flow (hackathon)

1. **Onboarding** (`/`) — enter name, upload resume or GitHub URL, tap **Analyze Profile**
2. **Scanning** (`/scanning`) — live progress (~3s with mock API)
3. **Dashboard** (`/dashboard`) — filters, match cards, **Apply Now** opens helper panel
4. **Leads / Network / Profile** — bottom nav on mobile, sidebar on desktop
5. **Onboarding** link on dashboard — return to edit profile anytime

Or use **Jump to any screen (demo)** on onboarding to skip ahead.

## Layout

| Path | Description |
|------|-------------|
| `frontend/` | React app (pages, API client, mock layer, UI) |
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
