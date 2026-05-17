import { Router } from 'express';
import multer from 'multer';
import {
  analyzeProfileWithAgent,
  CursorAgentError,
} from '../services/cursorAgent.js';
import { fetchGitHubProfileSummary } from '../services/github.js';
import { extractResumeText } from '../services/resumeParser.js';
import { createSession, type ProfileInput } from '../store/session.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      /\.(pdf|doc|docx)$/i.test(file.originalname) ||
      [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.mimetype);
    if (!allowed) {
      cb(new Error('INVALID_FILE_TYPE'));
      return;
    }
    cb(null, true);
  },
});

export const profileRouter = Router();

profileRouter.post(
  '/analyze',
  upload.single('resume'),
  async (req, res, next) => {
    try {
      const name = String(req.body.name ?? '').trim();
      if (!name) {
        res.status(400).json({ message: 'Name is required', code: 'VALIDATION' });
        return;
      }

      const resumeUploaded = req.body.resumeUploaded === 'true';
      const profile: ProfileInput = {
        name,
        github: String(req.body.github ?? '').trim(),
        linkedin: String(req.body.linkedin ?? '').trim(),
        resumeUploaded,
        resumeFileName: req.body.resumeFileName
          ? String(req.body.resumeFileName)
          : req.file?.originalname,
        resumeText: await extractResumeText(
          req.file?.buffer,
          req.file?.originalname ?? req.body.resumeFileName,
        ),
      };

      if (resumeUploaded && !req.file && !profile.resumeFileName) {
        res.status(400).json({
          message: 'Resume file is required when resumeUploaded is true',
          code: 'VALIDATION',
        });
        return;
      }

      const hasSignal =
        profile.github.length > 0 ||
        profile.linkedin.length > 0 ||
        (resumeUploaded && Boolean(req.file));

      if (!hasSignal) {
        res.status(400).json({
          message:
            'Provide at least a GitHub URL, LinkedIn URL, or resume so the agent can search opportunities for this candidate.',
          code: 'VALIDATION',
        });
        return;
      }

      console.log(`[analyze] start name=${name}`);
      const githubSummary = profile.github
        ? await fetchGitHubProfileSummary(profile.github)
        : undefined;

      const insights = await analyzeProfileWithAgent({
        ...profile,
        githubSummary,
      });
      console.log(
        `[analyze] done opportunities=${insights.opportunities.length}`,
      );
      const sessionId = `sess_${Date.now()}`;

      createSession({
        sessionId,
        profile: { ...profile, githubSummary },
        skillTags: insights.skillTags,
        aiStrengths: insights.aiStrengths,
        rolesScanned: insights.rolesScanned,
        opportunities: insights.opportunities,
      });

      res.json({
        sessionId,
        skillTags: insights.skillTags,
        aiStrengths: insights.aiStrengths,
        rolesScanned: insights.rolesScanned,
        opportunities: insights.opportunities,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
        res.status(400).json({
          message: 'Resume must be PDF, DOC, or DOCX',
          code: 'INVALID_FILE',
        });
        return;
      }
      if (err instanceof CursorAgentError) {
        res.status(503).json({
          message: err.message || 'AI agent unavailable',
          code: 'AGENT_STARTUP_FAILED',
        });
        return;
      }
      next(err);
    }
  },
);
