import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Icon } from '../components/ui/Icon';
import { useApp } from '../context/AppContext';
import type { ScanStep } from '../types';

const INITIAL_STEPS: ScanStep[] = [
  { id: 'cv', label: 'Parsing CV...', icon: 'check_circle', status: 'completed' },
  {
    id: 'github',
    label: 'Analyzing GitHub Repositories...',
    icon: 'sync',
    status: 'active',
    progress: 0,
  },
  {
    id: 'stack',
    label: 'Evaluating Tech Stack...',
    icon: 'hourglass_empty',
    status: 'queued',
  },
  {
    id: 'web',
    label: 'Scraping the Web for Global Opportunities...',
    icon: 'language',
    status: 'queued',
  },
];

function stepBorder(status: ScanStep['status']) {
  if (status === 'completed') return 'border-tertiary';
  if (status === 'active') return 'border-primary';
  return 'border-white/10';
}

export function ScanningPage() {
  const navigate = useNavigate();
  const {
    analysisStatus,
    analysisError,
    clearAnalysisError,
    startAnalysis,
    demoFastScan,
    completeDemoScan,
  } = useApp();
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [githubProgress, setGithubProgress] = useState(0);

  useEffect(() => {
    if (demoFastScan || analysisStatus !== 'running') return;
    void startAnalysis().catch(() => undefined);
  }, [analysisStatus, startAnalysis, demoFastScan]);

  useEffect(() => {
    if (analysisStatus !== 'complete') return;
    const timer = setTimeout(() => navigate('/dashboard', { replace: true }), 900);
    return () => clearTimeout(timer);
  }, [analysisStatus, navigate]);

  useEffect(() => {
    const step = demoFastScan ? 20 : 8;
    const ms = demoFastScan ? 120 : 400;
    const interval = setInterval(() => {
      setGithubProgress((p) => (p >= 100 ? 100 : p + step));
    }, ms);
    return () => clearInterval(interval);
  }, [demoFastScan]);

  useEffect(() => {
    if (!demoFastScan) return;
    const t = setTimeout(completeDemoScan, 2500);
    return () => clearTimeout(t);
  }, [demoFastScan, completeDemoScan]);

  useEffect(() => {
    if (githubProgress < 100) return;

    const timers = [
      setTimeout(() => {
        setSteps((s) =>
          s.map((step) => {
            if (step.id === 'github')
              return { ...step, status: 'completed' as const, progress: 100 };
            if (step.id === 'stack') return { ...step, status: 'active' as const };
            return step;
          }),
        );
      }, 400),
      setTimeout(() => {
        setSteps((s) =>
          s.map((step) => {
            if (step.id === 'stack')
              return { ...step, status: 'completed' as const };
            if (step.id === 'web') return { ...step, status: 'active' as const };
            return step;
          }),
        );
      }, 1200),
      setTimeout(() => {
        setSteps((s) =>
          s.map((step) =>
            step.id === 'web'
              ? { ...step, status: 'completed' as const }
              : step,
          ),
        );
      }, 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [githubProgress]);

  return (
    <div className="overflow-hidden bg-background">
      <Header />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16 pb-24">
        <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-[120px]" />

        <div className="z-10 flex w-full max-w-4xl flex-col items-center px-4 md:px-6">
          {analysisError && (
            <div className="mb-6 w-full max-w-xl">
              <ErrorBanner message={analysisError} onDismiss={clearAnalysisError} />
              <Link
                to="/"
                className="mt-3 inline-block text-sm text-primary hover:underline"
              >
                Back to onboarding
              </Link>
            </div>
          )}

          <div className="glass-panel relative mb-8 aspect-square w-full max-w-2xl overflow-hidden rounded-xl shadow-2xl md:aspect-video">
            <div className="space-y-4 p-8 opacity-20">
              <div className="h-8 w-1/3 rounded-lg bg-white/10" />
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-lg border border-white/5 bg-white/5"
                  />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-5/6 rounded bg-white/5" />
                <div className="h-4 w-4/6 rounded bg-white/5" />
              </div>
            </div>

            <div className="scan-line absolute left-0 top-0 w-full" />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-primary/20 shadow-[0_0_20px_rgba(180,197,255,0.1)] md:h-40 md:w-40">
                  <div className="h-28 w-28 animate-spin rounded-full border-t-2 border-primary md:h-36 md:w-36" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon
                    name="hub"
                    filled
                    className="animate-pulse text-5xl text-primary md:text-6xl"
                  />
                </div>
              </div>
              <div className="mt-8 text-center">
                <h2 className="mb-2 text-2xl font-semibold text-primary">
                  Opportunity Scan in Progress
                </h2>
                <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
                  <span>Agent Alex-01 is actively optimizing...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl space-y-4">
            {steps.map((step) => {
              const isQueued = step.status === 'queued';
              const isActive = step.status === 'active';
              const progress =
                step.id === 'github' && isActive ? githubProgress : step.progress;

              return (
                <div
                  key={step.id}
                  className={`glass-panel flex items-center justify-between rounded-lg border-l-4 p-4 ${stepBorder(step.status)} ${
                    isQueued ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      name={step.icon}
                      className={`${
                        step.status === 'completed'
                          ? 'text-tertiary'
                          : isActive
                            ? 'animate-spin text-primary'
                            : 'text-on-surface-variant'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isQueued ? 'text-on-surface-variant' : 'text-on-surface'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold tracking-wide ${
                      step.status === 'completed'
                        ? 'text-tertiary'
                        : isActive
                          ? 'animate-pulse text-primary'
                          : 'text-on-surface-variant'
                    }`}
                  >
                    {step.status === 'completed'
                      ? 'COMPLETED'
                      : isActive && progress !== undefined
                        ? `${Math.min(progress, 100)}%`
                        : 'QUEUED'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="glass-panel flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name="analytics" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Identified Patterns</p>
                <p className="text-lg font-semibold text-on-surface">14 Key Strengths</p>
              </div>
            </div>
            <div className="glass-panel flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Icon name="travel_explore" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Market Potential</p>
                <p className="text-lg font-semibold text-on-surface">92nd Percentile</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
