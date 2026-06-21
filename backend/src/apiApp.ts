import cors from 'cors';
import express, { type Router } from 'express';
import { getGeminiApiKey } from './loadEnv.js';

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
    agent: Boolean(getGeminiApiKey()),
    fallback: process.env.USE_AGENT_FALLBACK === 'true',
  });
});

/** Lazy-load routers so /health works even if a heavy dependency fails at import time. */
function lazyRouter(
  loader: () => Promise<{ default?: Router } | Router>,
): express.RequestHandler {
  let router: Router | null = null;
  let loadError: Error | null = null;

  return (req, res, next) => {
    if (router) {
      router(req, res, next);
      return;
    }
    if (loadError) {
      next(loadError);
      return;
    }
    void loader()
      .then((mod) => {
        const r =
          mod && typeof mod === 'object' && 'default' in mod && mod.default
            ? mod.default
            : (mod as Router);
        router = r;
        router(req, res, next);
      })
      .catch((err: Error) => {
        loadError = err;
        next(err);
      });
  };
}

apiApp.use(
  '/profile',
  lazyRouter(() =>
    import('./routes/profile.js').then((m) => m.profileRouter),
  ),
);
apiApp.use(
  '/opportunities',
  lazyRouter(() =>
    import('./routes/opportunities.js').then((m) => m.opportunitiesRouter),
  ),
);
apiApp.use(
  '/applications',
  lazyRouter(() =>
    import('./routes/applications.js').then((m) => m.applicationsRouter),
  ),
);

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
