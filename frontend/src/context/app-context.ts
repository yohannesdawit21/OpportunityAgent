import { createContext } from 'react';
import type {
  AnalysisStatus,
  Opportunity,
  OpportunityType,
  UserProfile,
} from '../types';

export interface AppContextValue {
  profile: UserProfile;
  setProfile: (patch: Partial<UserProfile>) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  opportunities: Opportunity[];
  skillTags: string[];
  aiStrengths: string[];
  rolesScanned: number;
  analysisStatus: AnalysisStatus;
  sessionId?: string;
  analysisError: string | null;
  clearAnalysisError: () => void;
  startAnalysis: () => Promise<void>;
  selectedOpportunity: Opportunity | null;
  openApplication: (opportunity: Opportunity) => void;
  closeApplication: () => void;
  activeFilter: OpportunityType;
  setActiveFilter: (filter: OpportunityType) => void;
  regenerateCoverLetter: () => Promise<string | null>;
  saveDraft: (coverLetter: string) => Promise<void>;
  submitApplicationForRole: (coverLetter: string) => Promise<void>;
  applicationBusy: boolean;
  applicationMessage: string | null;
  clearApplicationMessage: () => void;
  resetApp: () => void;
  apiMode: 'mock' | 'live';
  backendConnected: boolean | null;
  clearStoredData: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
