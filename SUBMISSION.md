# Final submission checklist — OpportunityAgent

> **Setup:** [README.md](./README.md) · **How it works:** [SYSTEM.md](./SYSTEM.md)

## Architecture (short)

- **Frontend** (`frontend/`) — React + Vite, calls REST API
- **Backend** (`backend/`) — Express on port 3001, Cursor Agent SDK for AI
- **Integration** — Vite proxies `/api` → `http://localhost:3001`

## Pre-flight (before judges open the app)

```bash
# From repo root
npm install
cd backend && cp .env.example .env   # add CURSOR_API_KEY
cd ../frontend && cp .env.example .env
cd ..
npm run build          # must pass with no errors
npm run dev:all        # backend :3001 + frontend :5173
```

## Run for judges (live demo)

```bash
npm run dev:all
```

Open http://localhost:5173/

1. Confirm **green “Live API”** banner on onboarding (not amber “Mock API”).
2. Header badge shows **Live API** (not Mock / Offline).
3. Enter name + GitHub URL → **Analyze Profile** (do **not** use “Jump to any screen” demo buttons).
4. After scan (~30–90s), dashboard shows **new companies/roles** tailored to the candidate (not Lumina/Nebula seed cards unless agent fallback ran).
5. Skills and rationales reference the candidate’s **GitHub repos** and **CV text**.
6. Profile page shows **Live backend** and a `sess_…` session id.

## Environment

| File | Key settings |
|------|----------------|
| `frontend/.env` | `VITE_USE_MOCK_API=false`, `VITE_API_URL=/api` |
| `backend/.env` | `CURSOR_API_KEY=…`, `PORT=3001` |

## API smoke test

```bash
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/profile/analyze \
  -F "name=Demo" -F "github=https://github.com/octocat" -F "linkedin=" -F "resumeUploaded=false"
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Amber “Mock API” banner | Set `VITE_USE_MOCK_API=false` in `frontend/.env`, restart Vite |
| Red “Backend offline” | Run `npm run dev:backend` |
| Old Alex Chen / fixed skills after refresh | Profile → **Edit profile & re-analyze**, or clear `opportunity-agent:app-state` in localStorage |
| Demo jump buttons show seed data | Expected — use **Analyze Profile** for real API |

## What uses mock vs live

| Action | Data source |
|--------|-------------|
| Analyze Profile | Backend + Cursor SDK |
| Regenerate cover letter | Backend + Cursor SDK |
| Save draft / Submit | Backend |
| “Jump to any screen (demo)” | Frontend seed data only |
