export type OpportunityType =
  | 'all'
  | 'internships'
  | 'hackathons'
  | 'remote'
  | 'fellowships';

export type AnalysisStatus = 'idle' | 'running' | 'complete' | 'error';

export interface UserProfile {
  name: string;
  github: string;
  linkedin: string;
  resumeUploaded: boolean;
  resumeFileName?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  rationale: string;
  logoUrl: string;
  types: OpportunityType[];
  missingSkills?: string[];
  coverLetter: string;
  roadmap: RoadmapStep[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'done' | 'active' | 'pending';
}

export type ScanStepStatus = 'completed' | 'active' | 'queued';

export interface ScanStep {
  id: string;
  label: string;
  icon: string;
  status: ScanStepStatus;
  progress?: number;
}

export interface PersistedAppState {
  profile: UserProfile;
  analysisStatus: AnalysisStatus;
  sessionId?: string;
  rolesScanned?: number;
  skillTags?: string[];
  aiStrengths?: string[];
  opportunityIds?: string[];
  /** Snapshot from backend analyze — avoids reloading static seed data */
  opportunities?: Opportunity[];
}
