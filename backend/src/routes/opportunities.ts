import { Router } from 'express';
import { requireSession } from '../middleware/session.js';
import { generateCoverLetterWithAgent } from '../services/cursorAgent.js';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', (req, res) => {
  const session = requireSession(req);
  if (!session) {
    res.json([]);
    return;
  }
  res.json(session.opportunities);
});

opportunitiesRouter.post('/:id/cover-letter', async (req, res, next) => {
  try {
    const session = requireSession(req);
    if (!session) {
      res.status(404).json({
        message: 'Session not found. Run profile analysis first.',
        code: 'NO_SESSION',
      });
      return;
    }

    const opportunity = session.opportunities.find((o) => o.id === req.params.id);

    if (!opportunity) {
      res.status(404).json({ message: 'Opportunity not found', code: 'NOT_FOUND' });
      return;
    }

    const profile = req.body?.profile as
      | { name?: string; github?: string; linkedin?: string }
      | undefined;

    const coverLetter = await generateCoverLetterWithAgent(
      {
        name: profile?.name?.trim() || session.profile.name,
        github: profile?.github?.trim() || session.profile.github,
        linkedin: profile?.linkedin?.trim() || session.profile.linkedin,
        resumeText: session.profile.resumeText,
        githubSummary: session.profile.githubSummary,
      },
      opportunity,
    );

    res.json({ coverLetter });
  } catch (err) {
    next(err);
  }
});
