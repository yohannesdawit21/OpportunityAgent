export {
  analyzeProfile,
  generateCoverLetter,
  getOpportunities,
  saveApplicationDraft,
  submitApplication,
} from './opportunityAgentApi';
export { ApiError } from './types';
export { checkApiHealth } from './health';
export { getApiMode, useMockApi } from './client';
export type { ApiHealthResponse } from './health';
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
