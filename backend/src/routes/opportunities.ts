import { Router } from 'express';
import { resolveSession } from '../middleware/session.js';
import { generateCoverLetterWithAgent } from '../services/geminiAgent.js';
import type { Opportunity } from '../data/opportunities.js';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', (req, res) => {
  const session = resolveSession(req);
  if (!session) {
    res.json([]);
    return;
  }
  res.json(session.opportunities);
});

opportunitiesRouter.post('/:id/cover-letter', async (req, res, next) => {
  try {
    // Session is best-effort: on Vercel serverless the analyze lambda may differ
    // from this one, so we also accept the opportunity/profile from the request body.
    const session = resolveSession(req);

    const bodyOpp = req.body?.opportunity as
      | {
          id: string;
          title: string;
          company: string;
          location?: string;
          rationale?: string;
        }
      | undefined;

    const opportunity: Opportunity | undefined =
      session?.opportunities.find((o) => o.id === req.params.id) ??
      (bodyOpp?.id === req.params.id && bodyOpp.title && bodyOpp.company
        ? {
            id: bodyOpp.id,
            title: bodyOpp.title,
            company: bodyOpp.company,
            location: bodyOpp.location ?? 'Remote',
            matchScore: 80,
            rationale: bodyOpp.rationale ?? '',
            logoUrl: '',
            types: ['all' as const],
            coverLetter: '',
            roadmap: [],
          }
        : undefined);

    if (!opportunity) {
      res.status(404).json({
        message:
          'Opportunity not found. Re-run profile analysis or include the opportunity details in the request.',
        code: 'NOT_FOUND',
      });
      return;
    }

    const profile = req.body?.profile as
      | { name?: string; github?: string; linkedin?: string }
      | undefined;

    const coverLetter = await generateCoverLetterWithAgent(
      {
        name: profile?.name?.trim() || session?.profile.name || 'Candidate',
        github: profile?.github?.trim() || session?.profile.github || '',
        linkedin: profile?.linkedin?.trim() || session?.profile.linkedin || '',
        resumeText: session?.profile.resumeText,
        githubSummary: session?.profile.githubSummary,
      },
      opportunity,
    );

    res.json({ coverLetter });
  } catch (err) {
    next(err);
  }
});
