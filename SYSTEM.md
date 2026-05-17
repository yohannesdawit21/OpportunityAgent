# System overview — OpportunityAgent

This document explains **how the application is put together**: components, data flow, API modes, and where state lives. For setup commands, see [README.md](./README.md). For endpoint details, see [BACKEND.md](./BACKEND.md).

---

## 1. High-level architecture

The project is a **monorepo** with two runnable apps:

```mermaid
flowchart LR
  subgraph browser [Browser]
    UI[React SPA\nlocalhost:5173]
  end
  subgraph server [Node server]
    API[Express API\nlocalhost:3001]
    Agent[Cursor Agent SDK]
    Store[(In-memory sessions)]
  end
  UI -->|HTTP /api/*| API
  API --> Agent
  API --> Store
  Agent -->|LLM| Cursor[Cursor Cloud]
```

| Layer | Folder | Role |
|-------|--------|------|
| **Presentation** | `frontend/` | Pages, layout, forms, mock fallback |
| **API** | `backend/` | REST routes, file upload, session storage |
| **AI** | `backend/src/services/cursorAgent.ts` | Prompts + JSON parsing for agent output |
| **Contracts** | `BACKEND.md` | Shared API shape between UI and server |

In development, Vite **proxies** `/api` → `http://localhost:3001`, so the browser always calls same-origin `/api/...`.

---

## 2. User journey (happy path)

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend
  participant A as Cursor Agent

  U->>F: Onboarding: name, GitHub, resume
  F->>F: analysisStatus = running
  F->>B: POST /api/profile/analyze (multipart)
  B->>B: Parse resume + fetch GitHub summary
  B->>A: Analyze profile prompt
  A-->>B: skills, strengths, job matches JSON
  B->>B: createSession(sess_*)
  B-->>F: sessionId, opportunities, skillTags
  F->>F: analysisStatus = complete, persist localStorage
  F->>U: Scanning UI then /dashboard
  U->>F: Apply Now on a job
  F->>B: POST cover-letter / PUT draft / POST submit
  B-->>F: Updated letter or confirmation
```

---

## 3. Frontend structure

```
frontend/src/
├── pages/              # One file per route
│   OnboardingPage      # /
│   ScanningPage        # /scanning
│   DashboardPage       # /dashboard
│   LeadsPage, NetworkPage, ProfilePage
├── components/
│   layout/             # Header, Sidebar, BottomNav, AppShell
│   routes/             # RequireAnalysis guard
│   opportunities/      # OpportunityCard
│   onboarding/         # Mobile sticky Analyze bar
│   ui/                 # Icon, ErrorBanner, ApiStatusBanner
├── features/
│   ApplicationHelperPanel   # Slide-over apply flow
├── context/            # AppProvider: global state + persistence
├── api/                # HTTP client, mock handlers, health check
├── data/               # Seed opportunities (mock + fallback only)
└── lib/storage.ts      # localStorage wrapper
```

### Routing & guards

| Route | Guard | If blocked |
|-------|-------|------------|
| `/` | None | Always onboarding |
| `/scanning` | `running-only` | Idle → `/`; complete → `/dashboard` |
| `/dashboard`, `/leads`, … | `complete-only` | Not complete → `/` |

### Global state (`AppContext`)

| Field | Purpose |
|-------|---------|
| `profile` | Name, GitHub, LinkedIn, resume flags |
| `analysisStatus` | `idle` \| `running` \| `complete` \| `error` |
| `opportunities` | Job cards from API or demo |
| `skillTags`, `aiStrengths`, `rolesScanned` | Dashboard hero |
| `selectedOpportunity` | Opens Application Helper panel |
| `sessionId` | Backend session after live analyze |
| `backendConnected` | Health check when live mode |

**Persistence:** `localStorage` key `opportunity-agent:app-state` saves profile + analysis + opportunities so refresh keeps the session.

### API modes (frontend)

Controlled by `VITE_USE_MOCK_API`:

| Mode | `VITE_USE_MOCK_API` | Behavior |
|------|---------------------|----------|
| **Mock** | `true` (or unset in old `.env`) | `frontend/src/api/mock/handlers.ts` — fixed seed jobs, ~3s delay |
| **Live** | `false` | `fetch` to `/api/*` → Express → Cursor agent |

UI indicators:

- **ApiStatusBanner** on onboarding (green / amber / red)
- **Header badge** — Mock / Live API / Offline

### Demo shortcuts vs real flow

| User action | Data source |
|-------------|-------------|
| **Analyze Profile** | Backend + agent (or mock if enabled) |
| **Jump to any screen (demo)** | `loadDemoForScreen()` — frontend seed only |
| Regenerate cover letter / save / submit | Backend (or mock) |

---

## 4. Backend structure

```
backend/src/
├── index.ts                 # Express app, CORS, /api/health
├── routes/
│   profile.ts               # POST /analyze (multer + agent)
│   opportunities.ts         # GET list, POST cover-letter
│   applications.ts          # PUT draft, POST submit
├── services/
│   cursorAgent.ts           # Cursor SDK prompts & JSON extraction
│   github.ts                # Public GitHub profile summary
│   resumeParser.ts          # PDF/text extraction for uploads
├── store/session.ts         # In-memory session per sess_*
└── middleware/session.ts    # Attach session from header/body
```

### Analyze pipeline (`POST /api/profile/analyze`)

1. Validate **name** and resume/GitHub rules.
2. **Resume:** Multer memory buffer → `resumeParser` (PDF/text).
3. **GitHub:** Optional `fetchGitHubProfileSummary` for public repos.
4. **Agent:** Single structured prompt → JSON with `skillTags`, `aiStrengths`, `rolesScanned`, `opportunities[]`.
5. **Session:** `createSession({ sessionId, profile, opportunities, … })`.
6. Response matches `AnalyzeProfileResponse` in `BACKEND.md`.

If `CURSOR_API_KEY` is missing and `USE_AGENT_FALLBACK=true`, server returns deterministic seed data instead of calling the agent.

### Session model

- Sessions are **in-memory** (lost on server restart).
- Frontend stores `sessionId` and sends it on subsequent calls (see `BACKEND.md` / middleware).
- Opportunities for a session are served from the store after analyze.

---

## 5. Key integrations

| Integration | Where | Notes |
|-------------|-------|-------|
| **Cursor Agent SDK** | `cursorAgent.ts` | See [§8 Implementing the Cursor Agent SDK](#8-implementing-the-cursor-agent-sdk) |
| **GitHub API** | `github.ts` | Public profile/repos for analyze context |
| **Resume upload** | `profile.ts` + `resumeParser.ts` | PDF/DOC/DOCX, max 10 MB |
| **Vite proxy** | `frontend/vite.config.ts` | `/api` → `localhost:3001` |

---

## 6. Analysis state machine (frontend)

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> running: startAnalysis() or demo scanning
  running --> complete: API success or completeDemoScan()
  running --> error: API failure
  error --> idle: clearAnalysisError()
  complete --> idle: resetApp()
  complete --> running: re-analyze
```

---

## 7. Security & secrets

| Item | Practice |
|------|----------|
| `CURSOR_API_KEY` | Only in `backend/.env` (gitignored) |
| `frontend/.env` | No secrets; only `VITE_*` public vars |
| CORS | Allows `localhost:5173` and preview port |

Never commit `.env` files. Judges must supply their own API key.

---

## 8. Implementing the Cursor Agent SDK

This project uses the official **`@cursor/sdk`** package on the **backend only**. The React app never sees `CURSOR_API_KEY`; it only calls your Express REST API.

### 8.1 Install and configure

**Package** (already in `backend/package.json`):

```bash
cd backend
npm install @cursor/sdk
```

**Environment** (`backend/.env`):

```env
CURSOR_API_KEY=your_key_from_cursor_dashboard
USE_AGENT_FALLBACK=false   # true = skip SDK, return seed jobs
PORT=3001
```

Get a key from the [Cursor dashboard](https://cursor.com/dashboard) (Cloud Agents / API). The health endpoint reports whether a key is present:

```bash
curl http://localhost:3001/api/health
# { "ok": true, "agent": true, "fallback": false }
```

### 8.2 Core pattern: `Agent.prompt`

All AI work goes through one helper in `backend/src/services/cursorAgent.ts`:

```typescript
import { Agent, CursorAgentError } from '@cursor/sdk';

const result = await Agent.prompt(prompt, {
  apiKey: process.env.CURSOR_API_KEY,
  model: { id: 'composer-2' },
  local: {
    cwd: process.cwd(),
    settingSources: [],
  },
});

if (result.status === 'error') {
  throw new Error(`Agent run failed (${result.id ?? 'unknown'})`);
}

const text = extractAssistantText(result.result);
```

| Option | Purpose in this app |
|--------|---------------------|
| `apiKey` | Authenticates with Cursor Cloud (server-side only) |
| `model.id` | `composer-2` — fast model suited to structured JSON tasks |
| `local.cwd` | Working directory for the agent runtime (repo root) |
| `local.settingSources` | Empty — we do not load IDE rules; prompts are self-contained |

`Agent.prompt` is **awaited** (blocking for that HTTP request). Profile analyze can take **30–120 seconds**; the frontend scanning UI covers that wait.

### 8.3 Where the SDK is called

```mermaid
flowchart TB
  subgraph routes [Express routes]
    P[POST /api/profile/analyze]
    C[POST /api/opportunities/:id/cover-letter]
  end
  subgraph cursorAgent [cursorAgent.ts]
    A[analyzeProfileWithAgent]
    G[generateCoverLetterWithAgent]
    R[runPrompt → Agent.prompt]
  end
  P --> A --> R
  C --> G --> R
```

| Function | Triggered by | Output |
|----------|--------------|--------|
| `analyzeProfileWithAgent` | `POST /api/profile/analyze` | `skillTags`, `aiStrengths`, `rolesScanned`, `opportunities[]` |
| `generateCoverLetterWithAgent` | `POST /api/opportunities/:id/cover-letter` | Plain-text cover letter |

**Pre-agent steps** (not SDK): resume parsing (`resumeParser.ts`), GitHub summary (`github.ts`). Their text is injected into the analyze prompt as context.

### 8.4 Prompt design

**Profile analysis** — one large prompt asks for **only JSON** with a fixed schema (skills, strengths, 4–6 jobs, cover letters, roadmaps). Candidate context is built in `buildEnrichedContext()`:

- Name, GitHub URL, LinkedIn  
- GitHub repo summary (REST)  
- Resume text (PDF/DOC extract)

**Cover letter** — separate prompt with candidate excerpt + job title/company/rationale; response is **plain text** (no JSON).

Tips that work well with this SDK:

1. **Be explicit about output shape** — include a JSON example in the prompt.  
2. **Say “ONLY valid JSON”** for structured responses.  
3. **Keep temperature implicit** — use task-focused instructions, not chat.  
4. **Cap size** — resume excerpt truncated (~8k chars); cover letter prompt uses ~2500 chars of resume.

### 8.5 Parsing agent responses

The SDK returns structured `result.result`; this app normalizes it in `extractAssistantText()` then:

1. **`extractJsonPayload<T>()`** — strips markdown fences, finds `{ ... }` or `[ ... ]`, `JSON.parse`.  
2. **`normalizeOpportunity()`** — validates fields, generates `id` slugs, clamps `matchScore`, default roadmap steps.  
3. On parse failure or empty opportunities → **fallback** (see below).

For cover letters, the raw string is used if length > 80 characters; otherwise the existing letter on the opportunity is kept.

### 8.6 Fallback when the SDK fails

```typescript
const useFallback = () =>
  process.env.USE_AGENT_FALLBACK === 'true' || !apiKey();
```

| Condition | Behavior |
|-----------|----------|
| No `CURSOR_API_KEY` and `USE_AGENT_FALLBACK` not forced | `runPrompt` throws `CursorAgentError` |
| `USE_AGENT_FALLBACK=true` | `seedFallback()` — static jobs from `backend/src/data/opportunities.ts` |
| Agent error or invalid JSON | `analyzeProfileWithAgent` catches, logs, returns `seedFallback()` |

For hackathon demos, prefer a valid API key and `USE_AGENT_FALLBACK=false` so judges see real agent output.

### 8.7 End-to-end: add a new SDK feature

Example: “explain why this job matches” endpoint.

1. **Route** — `backend/src/routes/opportunities.ts`  
   `POST /api/opportunities/:id/explain`

2. **Service** — `explainMatchWithAgent(profile, opportunity)` in `cursorAgent.ts`:
   - Build a short prompt with profile + job fields.  
   - `const text = await runPrompt(prompt);`  
   - Return `{ explanation: text }`.

3. **Session** — read profile/opportunity from `store/session.ts` using `sessionId` (see `middleware/session.ts`).

4. **Frontend** — add `apiRequest` in `frontend/src/api/opportunityAgentApi.ts` and call from a button in `OpportunityCard.tsx`.

5. **Contract** — document request/response in `BACKEND.md`.

Do **not** import `@cursor/sdk` in the frontend; keep all agent calls server-side.

### 8.8 Local vs production

| Environment | SDK runs | Notes |
|-------------|----------|-------|
| `npm run dev:backend` | `backend/src/index.ts` listens on `:3001` | Standard local hackathon setup |
| Vercel Services | `backend/index.ts` exports Express `app` | No `listen()`; see [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Mock frontend | SDK not called | `VITE_USE_MOCK_API=true` |

### 8.9 Debugging

| Symptom | Check |
|---------|--------|
| `CURSOR_API_KEY is not set` | `backend/.env` loaded (`import 'dotenv/config'` in `index.ts`) |
| Analyze always shows Lumina/Nebula seed jobs | Fallback path — inspect server logs for `[cursor-agent]` warnings |
| Request hangs then fails | Agent timeout; ensure backend stays running; increase client patience on scanning page |
| Invalid JSON | Log raw `extractAssistantText` output; tighten prompt or improve `extractJsonPayload` |

Official package docs: [@cursor/sdk on npm](https://www.npmjs.com/package/@cursor/sdk). For REST-only migration notes, see [BACKEND.md](./BACKEND.md).

---

## 9. What to read next

| Goal | Document |
|------|----------|
| Run the demo | [SUBMISSION.md](./SUBMISSION.md) |
| Implement or test APIs | [BACKEND.md](./BACKEND.md) |
| Install & scripts | [README.md](./README.md) |
| Deploy to Vercel | [DEPLOYMENT.md](./DEPLOYMENT.md) |
