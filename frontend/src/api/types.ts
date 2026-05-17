import type { Opportunity, RoadmapStep, UserProfile } from '../types';

export interface AnalyzeProfileRequest {
  profile: Pick<UserProfile, 'name' | 'github' | 'linkedin' | 'resumeUploaded' | 'resumeFileName'>;
  resumeFile?: File;
}

export interface AnalyzeProfileResponse {
  sessionId: string;
  skillTags: string[];
  aiStrengths: string[];
  rolesScanned: number;
  opportunities: Opportunity[];
  /** `agent` = Cursor SDK; `fallback` = static seed (dev only) */
  source?: 'agent' | 'fallback';
}

export interface ScanProgressEvent {
  stepId: string;
  status: 'completed' | 'active' | 'queued';
  progress?: number;
}

export interface GenerateCoverLetterRequest {
  opportunityId: string;
  profile: Pick<UserProfile, 'name' | 'github' | 'linkedin'>;
  /** Sent on serverless so cover letters work without server session */
  opportunity?: Pick<
    Opportunity,
    'id' | 'title' | 'company' | 'location' | 'rationale'
  >;
}

export interface GenerateCoverLetterResponse {
  coverLetter: string;
}

export interface SaveApplicationRequest {
  opportunityId: string;
  coverLetter: string;
}

export interface SaveApplicationResponse {
  draftId: string;
  savedAt: string;
}

export interface SubmitApplicationRequest {
  opportunityId: string;
  coverLetter: string;
}

export interface SubmitApplicationResponse {
  applicationId: string;
  submittedAt: string;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type { Opportunity, RoadmapStep, UserProfile };
