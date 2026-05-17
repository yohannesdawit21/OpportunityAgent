import { Router } from 'express';
import { generateCoverLetterWithAgent } from '../services/cursorAgent.js';
import { getLatestSession } from '../store/session.js';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', (_req, res) => {
  const session = getLatestSession();
  res.json(session?.opportunities ?? []);
});

opportunitiesRouter.post('/:id/cover-letter', async (req, res, next) => {
  try {
    const session = getLatestSession();
    const opportunities = session?.opportunities ?? [];
    const opportunity = opportunities.find((o) => o.id === req.params.id);

    if (!opportunity) {
      res.status(404).json({ message: 'Opportunity not found', code: 'NOT_FOUND' });
      return;
    }

    const profile = req.body?.profile as
      | { name?: string; github?: string; linkedin?: string }
      | undefined;

    const name =
      profile?.name?.trim() ||
      session?.profile.name ||
      'Candidate';

    const coverLetter = await generateCoverLetterWithAgent(
      {
        name,
        github: profile?.github?.trim() ?? session?.profile.github ?? '',
        linkedin: profile?.linkedin?.trim() ?? session?.profile.linkedin ?? '',
      },
      opportunity,
    );

    res.json({ coverLetter });
  } catch (err) {
    next(err);
  }
});
