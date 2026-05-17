import { Router } from 'express';
import { requireSession } from '../middleware/session.js';
import { saveDraft, submitApplication } from '../store/session.js';

export const applicationsRouter = Router();

applicationsRouter.put('/:opportunityId/draft', (req, res) => {
  const session = requireSession(req);
  if (!session) {
    res.status(404).json({
      message: 'Session not found. Run profile analysis first.',
      code: 'NO_SESSION',
    });
    return;
  }

  const coverLetter = String(req.body?.coverLetter ?? '').trim();
  if (!coverLetter) {
    res.status(400).json({
      message: 'coverLetter is required',
      code: 'VALIDATION',
    });
    return;
  }

  const draft = saveDraft(session.sessionId, req.params.opportunityId, coverLetter);
  res.json({
    draftId: `draft_${req.params.opportunityId}`,
    savedAt: draft.savedAt,
  });
});

applicationsRouter.post('/:opportunityId/submit', (req, res) => {
  const session = requireSession(req);
  if (!session) {
    res.status(404).json({
      message: 'Session not found. Run profile analysis first.',
      code: 'NO_SESSION',
    });
    return;
  }

  const coverLetter = String(req.body?.coverLetter ?? '').trim();
  if (!coverLetter) {
    res.status(400).json({
      message: 'coverLetter is required',
      code: 'VALIDATION',
    });
    return;
  }

  const submission = submitApplication(
    session.sessionId,
    req.params.opportunityId,
    coverLetter,
  );
  res.json({
    applicationId: `app_${req.params.opportunityId}_${Date.now()}`,
    submittedAt: submission.submittedAt,
  });
});
