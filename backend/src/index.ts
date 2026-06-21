import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 3001);

const server = app.listen(port, () => {
  console.log(`OpportunityAgent API listening on http://localhost:${port}/api`);
  console.log(
    `Groq agent: ${
      process.env.GROQ_API_KEY?.trim()
        ? 'enabled'
        : 'disabled (set GROQ_API_KEY or USE_AGENT_FALLBACK=true)'
    }`,
  );
});

server.timeout = 180_000;
server.keepAliveTimeout = 120_000;
server.headersTimeout = 125_000;
