# OpportunityAgent — Backend

Express API on port **3001**. Uses the **Groq API** (via native `fetch`, no SDK) for profile analysis and cover letters.

**Project docs:** [../README.md](../README.md) · [../SYSTEM.md](../SYSTEM.md) · [../BACKEND.md](../BACKEND.md)

## Setup

```bash
cp .env.example .env
# Set GROQ_API_KEY in .env (get one at https://console.groq.com/keys)
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
