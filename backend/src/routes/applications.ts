import { Router } from 'express';
import { saveDraft, submitApplication } from '../store/session.js';

export const applicationsRouter = Router();

applicationsRouter.put('/:opportunityId/draft', (req, res) => {
  const coverLetter = String(req.body?.coverLetter ?? '').trim();
  if (!coverLetter) {
    res.status(400).json({
      message: 'coverLetter is required',
      code: 'VALIDATION',
    });
    return;
  }

  const draft = saveDraft(req.params.opportunityId, coverLetter);
  res.json({
    draftId: `draft_${req.params.opportunityId}`,
    savedAt: draft.savedAt,
  });
});

applicationsRouter.post('/:opportunityId/submit', (req, res) => {
  const coverLetter = String(req.body?.coverLetter ?? '').trim();
  if (!coverLetter) {
    res.status(400).json({
      message: 'coverLetter is required',
      code: 'VALIDATION',
    });
    return;
  }

  const submission = submitApplication(req.params.opportunityId, coverLetter);
  res.json({
    applicationId: `app_${req.params.opportunityId}_${Date.now()}`,
    submittedAt: submission.submittedAt,
  });
});
