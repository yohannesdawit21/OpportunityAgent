import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/layout/BottomNav';
import { Header } from '../components/layout/Header';
import { OnboardingMobileBar } from '../components/onboarding/OnboardingMobileBar';
import { ApiStatusBanner } from '../components/ui/ApiStatusBanner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Icon } from '../components/ui/Icon';
import { useApp } from '../context';

const TRUST_FEATURES = [
  {
    icon: 'shield',
    title: 'Private & Secure',
    text: 'Data is encrypted and never shared without consent.',
    color: 'bg-tertiary-container/20 text-tertiary',
  },
  {
    icon: 'psychology',
    title: 'Neural Matching',
    text: 'Proprietary LLM-driven opportunity scanning.',
    color: 'bg-secondary-container/20 text-secondary',
  },
  {
    icon: 'auto_awesome',
    title: 'Agentic Search',
    text: '24/7 autonomous scouting for your next role.',
    color: 'bg-primary-container/20 text-primary',
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const {
    profile,
    setProfile,
    setResumeFile,
    startAnalysis,
    analysisStatus,
    analysisError,
    clearAnalysisError,
    loadDemoForScreen,
  } = useApp();
  const canUseApp = analysisStatus === 'complete';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasName = profile.name.trim().length > 0;
  const hasProfileSource =
    profile.resumeUploaded ||
    profile.github.trim().length > 0 ||
    profile.linkedin.trim().length > 0;
  const canAnalyze = hasName && hasProfileSource;

  const attachFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const valid =
        file.type === 'application/pdf' ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx');
      if (!valid) return;
      setResumeFile(file);
      setProfile({
        resumeUploaded: true,
        resumeFileName: file.name,
      });
    },
    [setProfile, setResumeFile],
  );

  const handleAnalyze = () => {
    setSubmitting(true);
    void startAnalysis().catch(() => {
      /* surfaced via analysisError */
    });
    navigate('/scanning');
    setSubmitting(false);
  };

  return (
    <div className="hero-gradient min-h-screen">
      <Header minimal showNav={false} />

      <main
        className={`mx-auto max-w-[1280px] px-4 pt-24 md:px-6 md:pt-32 ${
          canUseApp ? 'pb-28 lg:pb-24' : 'pb-36 lg:pb-24'
        }`}
      >
        <ApiStatusBanner />

        {analysisError && (
          <ErrorBanner message={analysisError} onDismiss={clearAnalysisError} />
        )}

        <section className="mb-8 space-y-3 text-center md:mb-16 md:space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl md:text-5xl">
            Let AI Find Your{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Next Big Move
            </span>
            .
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-on-surface-variant sm:text-base md:text-lg">
            Works for any candidate. Upload a CV plus GitHub or LinkedIn — the
            Cursor agent searches real matched roles for that person.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                attachFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`glass-card group flex h-full min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 transition-all sm:min-h-[280px] sm:p-6 md:min-h-[400px] md:p-8 ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-primary/20 hover:border-primary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                className="hidden"
                onChange={(e) => attachFile(e.target.files?.[0])}
              />
              <div className="relative mb-4">
                <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-2xl transition-transform duration-500 group-hover:scale-110" />
                <Icon
                  name="cloud_upload"
                  className="relative z-10 text-5xl text-primary md:text-6xl"
                />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-on-surface md:text-2xl">
                Upload CV/Resume
              </h3>
              <p className="mb-4 max-w-xs text-center text-sm text-on-surface-variant md:mb-8 md:text-base">
                Tap to browse or drop PDF/DOCX here.
              </p>
              <span className="flex max-w-[min(100%,16rem)] items-center gap-2 truncate rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-primary-fixed-dim">
                <Icon name="verified" className="text-sm" />
                {profile.resumeFileName
                  ? profile.resumeFileName
                  : profile.resumeUploaded
                    ? 'Resume attached'
                    : 'AI-Enhanced Parsing Enabled'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-6 lg:col-span-5">
            <div className="glass-card flex-1 rounded-xl p-5 md:p-8">
              <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-on-surface md:text-lg">
                <Icon name="link" className="text-secondary" />
                Digital Presence
              </h4>
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-on-surface-variant">
                    Full name
                  </span>
                  <div className="glowing-border relative rounded-lg border border-white/10 transition-all">
                    <Icon
                      name="person"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                    />
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={profile.name}
                      onChange={(e) => setProfile({ name: e.target.value })}
                      className="w-full rounded-lg border-none bg-black/40 py-3 pl-12 pr-4 text-base text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0"
                    />
                  </div>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-on-surface-variant">
                    GitHub URL
                  </span>
                  <div className="glowing-border relative rounded-lg border border-white/10 transition-all">
                    <Icon
                      name="code"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                    />
                    <input
                      type="text"
                      placeholder="github.com/username"
                      value={profile.github}
                      onChange={(e) => setProfile({ github: e.target.value })}
                      className="w-full rounded-lg border-none bg-black/40 py-3 pl-12 pr-4 text-base text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0"
                    />
                  </div>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-on-surface-variant">
                    LinkedIn/Portfolio URL
                  </span>
                  <div className="glowing-border relative rounded-lg border border-white/10 transition-all">
                    <Icon
                      name="public"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                    />
                    <input
                      type="text"
                      placeholder="linkedin.com/in/pro"
                      value={profile.linkedin}
                      onChange={(e) =>
                        setProfile({ linkedin: e.target.value })
                      }
                      className="w-full rounded-lg border-none bg-black/40 py-3 pl-12 pr-4 text-base text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0"
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="glass-card rounded-xl border-primary/20 bg-primary-container/10 p-5 md:p-8">
              <div className="mb-4 flex items-start gap-3 md:mb-6 md:gap-4">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Icon name="bolt" className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">
                    Instant Analysis
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Our agent will analyze your technical depth and market fit
                    in under 30 seconds.
                  </p>
                </div>
              </div>
              {!canAnalyze && (
                <p className="mb-3 hidden text-center text-xs text-on-surface-variant lg:block">
                  Enter your name and upload a resume{' '}
                  <span className="text-primary">or</span> a GitHub URL to continue.
                </p>
              )}
              <button
                type="button"
                disabled={!canAnalyze || submitting}
                onClick={handleAnalyze}
                className="btn-glow hidden w-full items-center justify-center gap-3 rounded-xl bg-primary-container py-4 text-sm font-medium text-on-primary-container transition-all duration-300 hover:bg-primary-container/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
              >
                {submitting ? 'Starting analysis…' : 'Analyze Profile'}
                <Icon name="arrow_forward" />
              </button>
            </div>
          </div>
        </div>

        <section className="glass-card mb-8 rounded-xl border border-secondary/20 bg-secondary-container/5 p-4 md:mb-12 md:p-8">
          <p className="mb-1 text-center text-sm font-medium text-secondary">
            Jump to any screen (demo)
          </p>
          <p className="mb-4 text-center text-xs text-on-surface-variant md:mb-6">
            Skips the backend — uses built-in demo data only. For judges: use{' '}
            <strong className="text-on-surface">Analyze Profile</strong> above
            with the live API banner green.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(
              [
                { screen: 'scanning' as const, label: 'AI Scanning', path: '/scanning' },
                { screen: 'dashboard' as const, label: 'Matches', path: '/dashboard' },
                { screen: 'leads' as const, label: 'Leads', path: '/leads' },
                { screen: 'network' as const, label: 'Network', path: '/network' },
                { screen: 'profile' as const, label: 'Profile', path: '/profile' },
                {
                  screen: 'application' as const,
                  label: 'Apply Helper',
                  path: '/dashboard',
                },
              ] as const
            ).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  loadDemoForScreen(item.screen);
                  navigate(item.path);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-semibold text-on-surface transition-all hover:border-primary/30 hover:text-primary sm:text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3 md:gap-6">
          {TRUST_FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card flex items-center gap-4 rounded-xl p-4"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${f.color}`}
              >
                <Icon name={f.icon} />
              </div>
              <div>
                <h5 className="text-sm font-medium text-on-surface">{f.title}</h5>
                <p className="text-xs text-on-surface-variant">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {!canUseApp && (
        <OnboardingMobileBar
          canAnalyze={canAnalyze}
          submitting={submitting}
          onAnalyze={handleAnalyze}
        />
      )}
      <BottomNav />
    </div>
  );
}
