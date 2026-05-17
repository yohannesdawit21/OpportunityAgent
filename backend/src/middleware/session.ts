import type { Request } from 'express';
import {
  getLatestSession,
  getSession,
  type AnalysisSession,
} from '../store/session.js';

export function resolveSession(req: Request): AnalysisSession | undefined {
  const header = req.header('X-Session-Id')?.trim();
  const query =
    typeof req.query.sessionId === 'string' ? req.query.sessionId.trim() : '';

  const sessionId = header || query;
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) return session;
  }

  return getLatestSession();
}

export function requireSession(req: Request): AnalysisSession | null {
  return resolveSession(req) ?? null;
}
