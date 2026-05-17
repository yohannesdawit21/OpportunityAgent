# OpportunityAgent — Frontend

React UI for the hackathon project. **Start at the repo root:** [../README.md](../README.md) for full setup. **Architecture:** [../SYSTEM.md](../SYSTEM.md).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run preview
```

## Environment (`.env`)

| Variable | Default in `.env.example` |
|----------|---------------------------|
| `VITE_API_URL` | `/api` (proxied to backend) |
| `VITE_USE_MOCK_API` | `false` for submission |

## Source layout

```
src/
  pages/           Route screens
  components/      Layout, guards, UI
  context/         AppProvider + hooks
  api/             Client, mock, health
  features/        Application helper panel
  data/            Seed jobs (mock/demo only)
```

API contract: [../BACKEND.md](../BACKEND.md).
