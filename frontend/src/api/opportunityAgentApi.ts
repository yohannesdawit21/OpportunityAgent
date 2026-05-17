import { apiRequest, useMockApi } from './client';
import * as mock from './mock/handlers';
import type {
  AnalyzeProfileRequest,
  AnalyzeProfileResponse,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse,
  Opportunity,
  SaveApplicationRequest,
  SaveApplicationResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from './types';

export async function analyzeProfile(
  request: AnalyzeProfileRequest,
): Promise<AnalyzeProfileResponse> {
  if (useMockApi()) return mock.mockAnalyzeProfile(request);

  const body = new FormData();
  body.append('name', request.profile.name);
  body.append('github', request.profile.github);
  body.append('linkedin', request.profile.linkedin);
  body.append('resumeUploaded', String(request.profile.resumeUploaded));
  if (request.profile.resumeFileName) {
    body.append('resumeFileName', request.profile.resumeFileName);
  }
  if (request.resumeFile) {
    body.append('resume', request.resumeFile);
  }

  return apiRequest<AnalyzeProfileResponse>('/profile/analyze', {
    method: 'POST',
    body,
  });
}

export async function getOpportunities(): Promise<Opportunity[]> {
  if (useMockApi()) {
    const { opportunities } = await import('../data/opportunities');
    return opportunities.map((o) => ({ ...o }));
  }
  return apiRequest<Opportunity[]>('/opportunities');
}

export async function generateCoverLetter(
  request: GenerateCoverLetterRequest,
): Promise<GenerateCoverLetterResponse> {
  if (useMockApi()) return mock.mockGenerateCoverLetter(request);
  return apiRequest<GenerateCoverLetterResponse>(
    `/opportunities/${request.opportunityId}/cover-letter`,
    {
      method: 'POST',
      body: JSON.stringify({ profile: request.profile }),
    },
  );
}

export async function saveApplicationDraft(
  request: SaveApplicationRequest,
): Promise<SaveApplicationResponse> {
  if (useMockApi()) return mock.mockSaveApplication(request);
  return apiRequest<SaveApplicationResponse>(
    `/applications/${request.opportunityId}/draft`,
    {
      method: 'PUT',
      body: JSON.stringify({ coverLetter: request.coverLetter }),
    },
  );
}

export async function submitApplication(
  request: SubmitApplicationRequest,
): Promise<SubmitApplicationResponse> {
  if (useMockApi()) return mock.mockSubmitApplication(request);
  return apiRequest<SubmitApplicationResponse>(
    `/applications/${request.opportunityId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ coverLetter: request.coverLetter }),
    },
  );
}
