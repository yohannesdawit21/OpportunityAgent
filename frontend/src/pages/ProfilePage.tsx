import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Icon } from '../components/ui/Icon';
import { USER_AVATAR } from '../data/opportunities';
import { useApp } from '../context';

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    profile,
    skillTags,
    aiStrengths,
    rolesScanned,
    resetApp,
    apiMode,
    sessionId,
  } = useApp();

  return (
    <AppShell>
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <header className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <img
            src={USER_AVATAR}
            alt=""
            className="mb-4 h-24 w-24 rounded-full border-2 border-white/10 object-cover sm:mb-0"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              AI Ready • Premium
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-on-surface">
              {profile.name}
            </h1>
            <p className="mt-2 text-on-surface-variant">
              {rolesScanned > 0
                ? `${rolesScanned.toLocaleString()} roles scanned by your agent`
                : 'Complete analysis to activate your agent'}
            </p>
          </div>
        </header>

        <section className="glass-card mb-6 rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">
            Digital Presence
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3 text-on-surface-variant">
              <Icon name="code" className="text-primary" />
              {profile.github || 'No GitHub added'}
            </li>
            <li className="flex items-center gap-3 text-on-surface-variant">
              <Icon name="public" className="text-primary" />
              {profile.linkedin || 'No portfolio link added'}
            </li>
            <li className="flex items-center gap-3 text-on-surface-variant">
              <Icon name="description" className="text-primary" />
              {profile.resumeFileName ?? (profile.resumeUploaded ? 'Resume on file' : 'No resume uploaded')}
            </li>
          </ul>
        </section>

        <section className="glass-card mb-6 rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skillTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="glass-card mb-6 rounded-xl p-6">
          <h2 className="mb-2 text-lg font-semibold text-on-surface">API</h2>
          <p className="text-sm text-on-surface-variant">
            Mode:{' '}
            <span className="font-semibold text-primary">
              {apiMode === 'live' ? 'Live backend' : 'In-browser mock'}
            </span>
            {sessionId ? (
              <>
                {' '}
                · Session <code className="text-xs">{sessionId}</code>
              </>
            ) : null}
          </p>
        </section>

        <section className="glass-card mb-8 rounded-xl border-l-2 border-l-tertiary p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-tertiary">
            AI Strengths
          </h2>
          <ul className="space-y-2">
            {aiStrengths.map((s) => (
              <li key={s} className="flex items-center gap-2 text-on-surface">
                <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                {s}
              </li>
            ))}
          </ul>
        </section>

        <button
          type="button"
          onClick={() => {
            resetApp();
            navigate('/');
          }}
          className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-on-surface hover:bg-white/5 sm:w-auto sm:px-8"
        >
          Edit profile & re-analyze
        </button>
      </div>
    </AppShell>
  );
}
