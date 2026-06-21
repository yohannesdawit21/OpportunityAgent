import { Router } from 'express';
import { resolveSession } from '../middleware/session.js';
import { saveDraft, submitApplication } from '../store/session.js';

export const applicationsRouter = Router();

function readCoverLetter(body: unknown): string {
  return String((body as { coverLetter?: unknown })?.coverLetter ?? '').trim();
}

applicationsRouter.put('/:opportunityId/draft', (req, res) => {
  const coverLetter = readCoverLetter(req.body);
  if (!coverLetter) {
    res.status(400).json({ message: 'coverLetter is required', code: 'VALIDATION' });
    return;
  }

  // Stateless: persisting is best-effort (drafts are never read back), so a
  // missing session must not block saving — this keeps the flow working on
  // Vercel serverless where sessions live in a different lambda instance.
  const session = resolveSession(req);
  const savedAt = new Date().toISOString();
  if (session) {
    saveDraft(session.sessionId, req.params.opportunityId, coverLetter);
  }

  res.json({ draftId: `draft_${req.params.opportunityId}`, savedAt });
});

applicationsRouter.post('/:opportunityId/submit', (req, res) => {
  const coverLetter = readCoverLetter(req.body);
  if (!coverLetter) {
    res.status(400).json({ message: 'coverLetter is required', code: 'VALIDATION' });
    return;
  }

  const session = resolveSession(req);
  const submittedAt = new Date().toISOString();
  if (session) {
    submitApplication(session.sessionId, req.params.opportunityId, coverLetter);
  }

  res.json({
    applicationId: `app_${req.params.opportunityId}_${Date.now()}`,
    submittedAt,
  });
});
