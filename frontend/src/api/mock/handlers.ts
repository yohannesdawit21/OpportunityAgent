import {
  AI_STRENGTHS,
  SKILL_TAGS,
  opportunities,
} from '../../data/opportunities';
import type {
  AnalyzeProfileRequest,
  AnalyzeProfileResponse,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse,
  SaveApplicationRequest,
  SaveApplicationResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from '../types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockAnalyzeProfile(
  _req: AnalyzeProfileRequest,
): Promise<AnalyzeProfileResponse> {
  await delay(3200);
  return {
    sessionId: `sess_${Date.now()}`,
    skillTags: SKILL_TAGS,
    aiStrengths: AI_STRENGTHS,
    rolesScanned: 1240,
    opportunities: opportunities.map((o) => ({ ...o })),
  };
}

export async function mockGenerateCoverLetter(
  req: GenerateCoverLetterRequest,
): Promise<GenerateCoverLetterResponse> {
  await delay(800);
  const job = opportunities.find((o) => o.id === req.opportunityId);
  if (!job) throw new Error('Opportunity not found');
  return { coverLetter: job.coverLetter };
}

export async function mockSaveApplication(
  req: SaveApplicationRequest,
): Promise<SaveApplicationResponse> {
  await delay(400);
  return {
    draftId: `draft_${req.opportunityId}`,
    savedAt: new Date().toISOString(),
  };
}

export async function mockSubmitApplication(
  req: SubmitApplicationRequest,
): Promise<SubmitApplicationResponse> {
  await delay(600);
  return {
    applicationId: `app_${req.opportunityId}_${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
}
