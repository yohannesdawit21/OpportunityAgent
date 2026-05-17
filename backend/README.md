# OpportunityAgent — Backend

Express API on port **3001**. Uses `@cursor/sdk` for profile analysis and cover letters.

## Setup

```bash
cp .env.example .env
# Set CURSOR_API_KEY in .env
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode (`tsx`) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |

## Health

```bash
curl http://localhost:3001/api/health
```

See `../BACKEND.md` for the full REST contract.
