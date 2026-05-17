# OpportunityAgent — Frontend

React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + React Router v7.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output: dist/
npm run preview  # serve production build
```

## Environment

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | Backend base URL |
| `VITE_USE_MOCK_API` | `true` | Use in-browser mock API |

## Structure

```
src/
  api/           HTTP client + mock handlers
  components/    layout, UI, routes
  context/       App state + persistence
  data/          mock opportunities
  features/      Application helper panel
  pages/         route screens
```

See `../BACKEND.md` for the API contract.
