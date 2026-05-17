import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  analyzeProfile as analyzeProfileApi,
  generateCoverLetter,
  getOpportunities,
  saveApplicationDraft,
  setApiSessionId,
  submitApplication,
  useMockApi,
} from '../api';
import { ApiError } from '../api/types';
import {
  AI_STRENGTHS,
  DEFAULT_PROFILE,
  SKILL_TAGS,
  opportunities as seedOpportunities,
} from '../data/opportunities';
import { loadJson, remove, saveJson } from '../lib/storage';
import type {
  AnalysisStatus,
  Opportunity,
  OpportunityType,
  PersistedAppState,
  UserProfile,
} from '../types';
import { AppContext } from './app-context';

const STORAGE_KEY = 'app-state';

function loadPersisted(): PersistedAppState {
  return loadJson<PersistedAppState>(STORAGE_KEY, {
    profile: DEFAULT_PROFILE,
    analysisStatus: 'idle',
  });
}

function initialOpportunities(persisted: PersistedAppState): Opportunity[] {
  if (persisted.opportunities?.length) {
    return persisted.opportunities.map((o) => ({ ...o }));
  }
  return [];
}

function analysisErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 0 || err.message === 'Failed to fetch') {
      return 'Cannot reach the backend. Run npm run dev:backend and keep it open during analysis (up to 2 minutes).';
    }
    return err.message;
  }
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return 'Connection lost during analysis. Ensure the backend is still running and try again.';
  }
  if (err instanceof Error) return err.message;
  return 'Analysis failed. Please try again.';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted();
  const apiMode: 'mock' | 'live' = useMockApi() ? 'mock' : 'live';

  const [profile, setProfileState] = useState<UserProfile>(persisted.profile);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() =>
    initialOpportunities(persisted),
  );
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [skillTags, setSkillTags] = useState<string[]>(
    persisted.skillTags ?? SKILL_TAGS,
  );
  const [aiStrengths, setAiStrengths] = useState<string[]>(
    persisted.aiStrengths ?? AI_STRENGTHS,
  );
  const [rolesScanned, setRolesScanned] = useState(persisted.rolesScanned ?? 0);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(
    persisted.analysisStatus,
  );
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(persisted.sessionId);

  useEffect(() => {
    if (!useMockApi() && persisted.sessionId) {
      setApiSessionId(persisted.sessionId);
    }
  }, []);

  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [activeFilter, setActiveFilter] = useState<OpportunityType>('all');
  const [applicationBusy, setApplicationBusy] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState<string | null>(
    null,
  );
  const analysisPromiseRef = useRef<Promise<void> | null>(null);
  const [demoFastScan, setDemoFastScan] = useState(false);

  useEffect(() => {
    const state: PersistedAppState = {
      profile: {
        name: profile.name,
        github: profile.github,
        linkedin: profile.linkedin,
        resumeUploaded: profile.resumeUploaded,
        resumeFileName: profile.resumeFileName,
      },
      analysisStatus,
      sessionId,
      rolesScanned,
      skillTags,
      aiStrengths,
      opportunityIds: opportunities.map((o) => o.id),
      opportunities:
        analysisStatus === 'complete' && opportunities.length > 0
          ? opportunities
          : undefined,
    };
    saveJson(STORAGE_KEY, state);
  }, [
    profile,
    analysisStatus,
    sessionId,
    rolesScanned,
    skillTags,
    aiStrengths,
    opportunities,
  ]);

  useEffect(() => {
    if (apiMode === 'mock') return;

    let cancelled = false;
    void (async () => {
      try {
        const { checkApiHealth } = await import('../api');
        const health = await checkApiHealth();
        if (!cancelled) setBackendConnected(health.ok);

        if (analysisStatus === 'complete' && opportunities.length === 0) {
          const list = await getOpportunities();
          if (!cancelled && list.length > 0) setOpportunities(list);
        }
      } catch {
        if (!cancelled) setBackendConnected(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiMode, analysisStatus, opportunities.length]);

  const setProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearAnalysisError = useCallback(() => {
    setAnalysisError(null);
    if (analysisStatus === 'error') setAnalysisStatus('idle');
  }, [analysisStatus]);

  const startAnalysis = useCallback(async () => {
    if (analysisPromiseRef.current) return analysisPromiseRef.current;

    setAnalysisStatus('running');
    setAnalysisError(null);

    const run = async () => {
      try {
        setOpportunities([]);
        setSkillTags([]);
        setAiStrengths([]);
        const result = await analyzeProfileApi({
          profile,
          resumeFile: resumeFile ?? undefined,
        });
        setSessionId(result.sessionId);
        setApiSessionId(result.sessionId);
        setSkillTags(result.skillTags);
        setAiStrengths(result.aiStrengths);
        setRolesScanned(result.rolesScanned);
        setOpportunities(result.opportunities);
        setAnalysisStatus('complete');
      } catch (err) {
        setAnalysisError(analysisErrorMessage(err));
        setAnalysisStatus('error');
        analysisPromiseRef.current = null;
        throw err;
      } finally {
        analysisPromiseRef.current = null;
      }
    };

    analysisPromiseRef.current = run();
    return analysisPromiseRef.current;
  }, [profile, resumeFile]);

  const openApplication = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setApplicationMessage(null);
  }, []);

  const closeApplication = useCallback(() => {
    setSelectedOpportunity(null);
  }, []);

  const regenerateCoverLetter = useCallback(async () => {
    if (!selectedOpportunity) return null;
    setApplicationBusy(true);
    try {
      const { coverLetter } = await generateCoverLetter({
        opportunityId: selectedOpportunity.id,
        profile,
      });
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === selectedOpportunity.id ? { ...o, coverLetter } : o,
        ),
      );
      setSelectedOpportunity((o) => (o ? { ...o, coverLetter } : o));
      return coverLetter;
    } catch (err) {
      setApplicationMessage(
        err instanceof Error ? err.message : 'Could not regenerate letter',
      );
      return null;
    } finally {
      setApplicationBusy(false);
    }
  }, [selectedOpportunity, profile]);

  const saveDraft = useCallback(
    async (coverLetter: string) => {
      if (!selectedOpportunity) return;
      setApplicationBusy(true);
      setApplicationMessage(null);
      try {
        await saveApplicationDraft({
          opportunityId: selectedOpportunity.id,
          coverLetter,
        });
        setApplicationMessage('Draft saved successfully.');
      } catch (err) {
        setApplicationMessage(
          err instanceof Error ? err.message : 'Failed to save draft',
        );
      } finally {
        setApplicationBusy(false);
      }
    },
    [selectedOpportunity],
  );

  const submitApplicationForRole = useCallback(
    async (coverLetter: string) => {
      if (!selectedOpportunity) return;
      setApplicationBusy(true);
      setApplicationMessage(null);
      try {
        const result = await submitApplication({
          opportunityId: selectedOpportunity.id,
          coverLetter,
        });
        setApplicationMessage(
          `Application submitted (${result.applicationId.slice(0, 12)}…).`,
        );
      } catch (err) {
        setApplicationMessage(
          err instanceof Error ? err.message : 'Submission failed',
        );
      } finally {
        setApplicationBusy(false);
      }
    },
    [selectedOpportunity],
  );

  const clearApplicationMessage = useCallback(() => {
    setApplicationMessage(null);
  }, []);

  const clearStoredData = useCallback(() => {
    remove(STORAGE_KEY);
  }, []);

  const resetApp = useCallback(() => {
    clearStoredData();
    setProfileState(DEFAULT_PROFILE);
    setResumeFile(null);
    setOpportunities([]);
    setSkillTags(SKILL_TAGS);
    setAiStrengths(AI_STRENGTHS);
    setRolesScanned(0);
    setAnalysisStatus('idle');
    setAnalysisError(null);
    analysisPromiseRef.current = null;
    setSessionId(undefined);
    setApiSessionId(undefined);
    setSelectedOpportunity(null);
    setApplicationMessage(null);
    setDemoFastScan(false);
  }, [clearStoredData]);

  const completeDemoScan = useCallback(() => {
    setOpportunities(seedOpportunities.map((o) => ({ ...o })));
    setSkillTags(SKILL_TAGS);
    setAiStrengths(AI_STRENGTHS);
    setRolesScanned(1240);
    setAnalysisStatus('complete');
    setDemoFastScan(false);
  }, []);

  const loadDemoForScreen = useCallback(
    (
      screen:
        | 'onboarding'
        | 'scanning'
        | 'dashboard'
        | 'leads'
        | 'network'
        | 'profile'
        | 'application',
    ) => {
      setAnalysisError(null);
      analysisPromiseRef.current = null;

      if (screen === 'onboarding') {
        resetApp();
        return;
      }

      const demoProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        name: 'Demo User',
        resumeUploaded: true,
        resumeFileName: 'demo-resume.pdf',
        github: 'https://github.com/octocat',
        linkedin: '',
      };
      setProfileState(demoProfile);
      setSkillTags(SKILL_TAGS);
      setAiStrengths(AI_STRENGTHS);
      setRolesScanned(1240);
      setOpportunities(seedOpportunities.map((o) => ({ ...o })));

      if (screen === 'scanning') {
        setDemoFastScan(true);
        setSelectedOpportunity(null);
        setAnalysisStatus('running');
        return;
      }

      setDemoFastScan(false);
      setAnalysisStatus('complete');

      if (screen === 'application') {
        const target =
          seedOpportunities.find((o) => o.id === 'neuralflow-lead-react') ??
          seedOpportunities[0];
        setSelectedOpportunity({ ...target });
      } else {
        setSelectedOpportunity(null);
      }
    },
    [resetApp],
  );

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      resumeFile,
      setResumeFile,
      opportunities,
      skillTags,
      aiStrengths,
      rolesScanned,
      analysisStatus,
      sessionId,
      analysisError,
      clearAnalysisError,
      startAnalysis,
      selectedOpportunity,
      openApplication,
      closeApplication,
      activeFilter,
      setActiveFilter,
      regenerateCoverLetter,
      saveDraft,
      submitApplicationForRole,
      applicationBusy,
      applicationMessage,
      clearApplicationMessage,
      resetApp,
      loadDemoForScreen,
      demoFastScan,
      completeDemoScan,
      apiMode,
      backendConnected,
      clearStoredData,
    }),
    [
      profile,
      setProfile,
      resumeFile,
      opportunities,
      skillTags,
      aiStrengths,
      rolesScanned,
      analysisStatus,
      sessionId,
      analysisError,
      clearAnalysisError,
      startAnalysis,
      selectedOpportunity,
      openApplication,
      closeApplication,
      activeFilter,
      regenerateCoverLetter,
      saveDraft,
      submitApplicationForRole,
      applicationBusy,
      applicationMessage,
      clearApplicationMessage,
      resetApp,
      loadDemoForScreen,
      demoFastScan,
      completeDemoScan,
      apiMode,
      backendConnected,
      clearStoredData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
