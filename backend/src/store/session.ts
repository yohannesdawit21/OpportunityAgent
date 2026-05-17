import type { Opportunity } from '../data/opportunities.js';

export interface ProfileInput {
  name: string;
  github: string;
  linkedin: string;
  resumeUploaded: boolean;
  resumeFileName?: string;
  resumeText?: string;
  githubSummary?: string;
}

export interface AnalysisSession {
  sessionId: string;
  profile: ProfileInput;
  skillTags: string[];
  aiStrengths: string[];
  rolesScanned: number;
  opportunities: Opportunity[];
  createdAt: string;
}

export interface ApplicationDraft {
  coverLetter: string;
  savedAt: string;
}

export interface SubmittedApplication {
  coverLetter: string;
  submittedAt: string;
}

const sessions = new Map<string, AnalysisSession>();
const drafts = new Map<string, ApplicationDraft>();
const submissions = new Map<string, SubmittedApplication>();

let latestSessionId: string | null = null;

export function createSession(
  data: Omit<AnalysisSession, 'createdAt'>,
): AnalysisSession {
  const session: AnalysisSession = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  sessions.set(session.sessionId, session);
  latestSessionId = session.sessionId;
  return session;
}

export function getSession(sessionId: string): AnalysisSession | undefined {
  return sessions.get(sessionId);
}

export function getLatestSession(): AnalysisSession | undefined {
  if (!latestSessionId) return undefined;
  return sessions.get(latestSessionId);
}

export function saveDraft(
  opportunityId: string,
  coverLetter: string,
): ApplicationDraft {
  const draft: ApplicationDraft = {
    coverLetter,
    savedAt: new Date().toISOString(),
  };
  drafts.set(opportunityId, draft);
  return draft;
}

export function getDraft(opportunityId: string): ApplicationDraft | undefined {
  return drafts.get(opportunityId);
}

export function submitApplication(
  opportunityId: string,
  coverLetter: string,
): SubmittedApplication {
  const submission: SubmittedApplication = {
    coverLetter,
    submittedAt: new Date().toISOString(),
  };
  submissions.set(opportunityId, submission);
  return submission;
}
