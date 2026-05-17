import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import type { RoadmapStep } from '../types';

function RoadmapItem({ step }: { step: RoadmapStep }) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-10 z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-background ${
          step.status === 'done'
            ? 'bg-primary'
            : step.status === 'active'
              ? 'border-2 border-primary bg-surface-container-highest'
              : 'border-2 border-white/20 bg-surface-container-highest'
        }`}
      >
        {step.status === 'done' && (
          <Icon name="check" className="text-sm text-on-primary" />
        )}
        {step.status === 'active' && (
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        )}
      </div>
      <div className={step.status === 'pending' ? 'opacity-60' : ''}>
        <p
          className={`font-bold ${
            step.status === 'active' ? 'text-primary' : 'text-on-surface'
          }`}
        >
          {step.title}
        </p>
        <p className="text-xs text-on-surface-variant">{step.description}</p>
      </div>
    </div>
  );
}

export function ApplicationHelperPanel() {
  const {
    selectedOpportunity,
    closeApplication,
    regenerateCoverLetter,
    saveDraft,
    submitApplicationForRole,
    applicationBusy,
    applicationMessage,
    clearApplicationMessage,
  } = useApp();
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (selectedOpportunity) {
      setCoverLetter(selectedOpportunity.coverLetter);
      clearApplicationMessage();
    }
  }, [selectedOpportunity, clearApplicationMessage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeApplication();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeApplication]);

  if (!selectedOpportunity) return null;

  const { title, company, matchScore, missingSkills, roadmap } =
    selectedOpportunity;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-helper-title"
      onClick={closeApplication}
    >
      <aside
        className="flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-surface/60 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/5 bg-white/5 p-6">
          <div>
            <h2
              id="application-helper-title"
              className="text-2xl font-semibold text-primary"
            >
              Application Helper
            </h2>
            <p className="text-sm text-on-surface-variant">
              {title} @ {company}
            </p>
          </div>
          <button
            type="button"
            onClick={closeApplication}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label="Close panel"
          >
            <Icon name="close" className="text-on-surface-variant" />
          </button>
        </header>

        {applicationMessage && (
          <p className="border-b border-white/5 bg-primary/10 px-6 py-3 text-sm text-primary">
            {applicationMessage}
          </p>
        )}

        <div className="aura-purple flex-1 space-y-6 overflow-y-auto p-6">
          <section className="glass-card rounded-xl border-secondary/20 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-secondary">
                <span className="text-lg font-bold text-secondary">
                  {matchScore}%
                </span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">
                Match Analysis
              </h3>
            </div>
            {missingSkills && missingSkills.length > 0 && (
              <div className="rounded-lg border border-white/5 bg-surface-container-lowest p-4">
                <p className="mb-3 text-sm text-on-surface-variant">
                  To reach a{' '}
                  <span className="font-bold text-tertiary">99% match</span>, you
                  should learn:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary"
                    >
                      <Icon name="add_circle" className="text-base" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                <Icon name="auto_awesome" className="text-primary" />
                AI Cover Letter Draft
              </h3>
              <button
                type="button"
                disabled={applicationBusy}
                className="text-xs text-primary hover:underline disabled:opacity-50"
                onClick={async () => {
                  const letter = await regenerateCoverLetter();
                  if (letter) setCoverLetter(letter);
                }}
              >
                Regenerate
              </button>
            </div>
            <div className="glowing-border rounded-xl">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                spellCheck={false}
                className="h-64 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-4 text-base leading-relaxed text-on-surface focus:outline-none focus:ring-0"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              Strategic Roadmap
            </h3>
            <div className="relative space-y-8 pl-8 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-surface-variant before:content-['']">
              {roadmap.map((step) => (
                <RoadmapItem key={step.id} step={step} />
              ))}
            </div>
          </section>
        </div>

        <footer className="flex gap-4 border-t border-white/5 bg-background/80 p-6">
          <button
            type="button"
            disabled={applicationBusy}
            onClick={() => saveDraft(coverLetter)}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-bold text-on-surface transition-all hover:bg-white/5 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={applicationBusy || !coverLetter.trim()}
            onClick={() => submitApplicationForRole(coverLetter)}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container py-3 text-sm font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-all hover:opacity-90 disabled:opacity-50"
          >
            {applicationBusy ? 'Submitting…' : 'Submit Application'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
