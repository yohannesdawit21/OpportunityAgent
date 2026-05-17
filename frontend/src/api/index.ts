export {
  analyzeProfile,
  generateCoverLetter,
  getOpportunities,
  saveApplicationDraft,
  submitApplication,
} from './opportunityAgentApi';
export { ApiError } from './types';
export { useMockApi } from './client';
export type {
  AnalyzeProfileRequest,
  AnalyzeProfileResponse,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse,
  SaveApplicationRequest,
  SaveApplicationResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from './types';
