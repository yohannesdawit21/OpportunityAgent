import cors from 'cors';
import express from 'express';
import { applicationsRouter } from './routes/applications.js';
import { opportunitiesRouter } from './routes/opportunities.js';
import { profileRouter } from './routes/profile.js';

function corsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) {
  if (!origin) {
    callback(null, true);
    return;
  }
  const allowed = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  if (
    allowed.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.vercel.sh')
  ) {
    callback(null, true);
    return;
  }
  callback(null, false);
}

/** Routes without /api prefix — Vercel Services strips routePrefix `/api` before forwarding. */
export const apiApp = express();

apiApp.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  }),
);

apiApp.use(express.json({ limit: '1mb' }));

apiApp.get('/health', (_req, res) => {
  res.json({
    ok: true,
    agent: Boolean(process.env.CURSOR_API_KEY?.trim()),
    fallback: process.env.USE_AGENT_FALLBACK === 'true',
  });
});

apiApp.use('/profile', profileRouter);
apiApp.use('/opportunities', opportunitiesRouter);
apiApp.use('/applications', applicationsRouter);

apiApp.use(
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
