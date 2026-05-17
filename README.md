# OpportunityAgent

**AI career assistant** for a virtual hackathon: upload a profile, get AI-matched roles, and apply with a guided helper. Built with React, Express, and the Cursor Agent SDK.

---

## What it does

| Step | Screen | What happens |
|------|--------|----------------|
| 1 | **Onboarding** (`/`) | Name, resume, GitHub / LinkedIn |
| 2 | **Scanning** (`/scanning`) | Progress UI while the agent analyzes |
| 3 | **Dashboard** (`/dashboard`) | Filtered job matches + match scores |
| 4 | **Apply helper** | Cover letter, roadmap, save draft, submit |
| 5 | **Leads / Network / Profile** | Ranked leads, connections, settings |

---

## Repository layout

```
virtual hackaton/
├── README.md           ← you are here (setup & overview)
├── SYSTEM.md           ← how the system works (architecture & data flow)
├── SUBMISSION.md       ← judge checklist & demo script
├── BACKEND.md          ← REST API contract
├── frontend/           ← React + Vite UI
└── backend/            ← Express API + Cursor agent
```

---

## Deploy to Vercel

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for one-click deploy steps, environment variables, and notes on function timeouts.

---

## Quick start

### Option A — Full stack (recommended for demo / submission)

```bash
# From repo root
npm install

cd backend && cp .env.example .env
# Edit .env: set CURSOR_API_KEY

cd ../frontend && cp .env.example .env
# Defaults: VITE_USE_MOCK_API=false, VITE_API_URL=/api

cd ..
npm run dev:all
```

Open **http://localhost:5173/**

- Green **Live API** banner = frontend is talking to the backend.
- Use **Analyze Profile** for AI-matched roles.

### Option B — Frontend only (no backend)

```bash
cd frontend
cp .env.example .env
# Set VITE_USE_MOCK_API=true in .env
npm install
npm run dev
```

Uses in-browser mock data (~3s fake scan). Good for UI-only testing.

---

## NPM scripts (repo root)

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Backend (`:3001`) + frontend (`:5173`) together |
| `npm run dev` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run build` | Production build for frontend and backend |
| `npm run preview` | Serve built frontend |

---

## Environment

**Frontend** (`frontend/.env`)

| Variable | Typical value | Meaning |
|----------|---------------|---------|
| `VITE_USE_MOCK_API` | `false` | `false` = call real backend |
| `VITE_API_URL` | `/api` | API base (Vite proxies to `:3001`) |

**Backend** (`backend/.env`)

| Variable | Meaning |
|----------|---------|
| `CURSOR_API_KEY` | Required for live AI (Cursor SDK) |
| `PORT` | Default `3001` |
| `USE_AGENT_FALLBACK` | `true` = deterministic seed data if no API key |

---

## Routes

| URL | Page |
|-----|------|
| `/` | Onboarding |
| `/scanning` | AI scanning animation |
| `/dashboard` | Matched opportunities |
| `/leads` | Leads ranked by match % |
| `/network` | Network connections |
| `/profile` | Profile, API mode, reset |

---

## Documentation

| File | Audience | Contents |
|------|----------|----------|
| [SYSTEM.md](./SYSTEM.md) | Developers & judges | Architecture, flows, state, integrations |
| [SUBMISSION.md](./SUBMISSION.md) | Judges | Pre-flight checks, live demo steps, troubleshooting |
| [BACKEND.md](./BACKEND.md) | Backend devs | REST endpoints & payloads |
| [frontend/README.md](./frontend/README.md) | Frontend devs | UI folder structure |
| [backend/README.md](./backend/README.md) | Backend devs | Server setup |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Amber “Mock API” banner | `VITE_USE_MOCK_API=false` in `frontend/.env`, restart Vite |
| Red “Backend offline” | Run `npm run dev:backend` or `npm run dev:all` |
| Old / seed job cards after refresh | Profile → **Edit profile & re-analyze**, or delete `opportunity-agent:app-state` in localStorage |
| Analyze button disabled | Enter **name** + resume **or** GitHub URL |

---

## Tech stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router v7
- **Backend:** Express 5, Multer, `@cursor/sdk`
- **AI:** Cursor Agent (`composer-2`) for profile analysis, job matching, cover letters

---

## Build for production

```bash
npm run build
cd frontend && npm run preview   # static UI on :4173 (API still needs backend)
```
