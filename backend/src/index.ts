import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { applicationsRouter } from './routes/applications.js';
import { opportunitiesRouter } from './routes/opportunities.js';
import { profileRouter } from './routes/profile.js';

const port = Number(process.env.PORT ?? 3001);

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
    ],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    agent: Boolean(process.env.CURSOR_API_KEY?.trim()),
    fallback: process.env.USE_AGENT_FALLBACK === 'true',
  });
});

app.use('/api/profile', profileRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/applications', applicationsRouter);

app.use(
  (
    err: Error & { code?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        message: 'Resume must be 10 MB or smaller',
        code: 'FILE_TOO_LARGE',
      });
      return;
    }
    console.error(err);
    res.status(500).json({
      message: err.message || 'Internal server error',
      code: 'INTERNAL',
    });
  },
);

app.listen(port, () => {
  console.log(`OpportunityAgent API listening on http://localhost:${port}/api`);
  console.log(
    `Cursor agent: ${
      process.env.CURSOR_API_KEY?.trim()
        ? 'enabled'
        : 'disabled (set CURSOR_API_KEY or USE_AGENT_FALLBACK=true)'
    }`,
  );
});
