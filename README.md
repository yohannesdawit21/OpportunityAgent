# Virtual Hackaton — OpportunityAgent

AI career assistant (React + Vite). Stitch designs are in `frontend/stitch-assets/`.

## Quick start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173/

From the repo root you can also run `npm install` (optional) then `npm run dev`.

## Layout

| Path | Description |
|------|-------------|
| `frontend/` | React app (pages, API client, mock layer, UI) |
| `BACKEND.md` | REST API contract for the real backend |
| `frontend/stitch-assets/` | Stitch HTML/PNG reference exports |

## Routes

| Route | Screen |
|-------|--------|
| `/` | Onboarding |
| `/scanning` | AI scanning |
| `/dashboard` | Matched opportunities |
| `/leads`, `/network`, `/profile` | App sections |
