import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { Icon } from '../components/ui/Icon';
import { useApp } from '../context/AppContext';
import type { OpportunityType } from '../types';

const FILTERS: { id: OpportunityType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'internships', label: 'Internships' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'remote', label: 'Remote Jobs' },
  { id: 'fellowships', label: 'Fellowships' },
];

export function DashboardPage() {
  const {
    profile,
    opportunities,
    skillTags,
    aiStrengths,
    rolesScanned,
    activeFilter,
    setActiveFilter,
  } = useApp();

  const filtered = useMemo(
    () =>
      opportunities.filter(
        (o) => activeFilter === 'all' || o.types.includes(activeFilter),
      ),
    [opportunities, activeFilter],
  );

  const firstName = profile.name.split(' ')[0] || profile.name;

  return (
    <AppShell showSearchFab>
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <section className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="glass-card relative overflow-hidden rounded-xl p-8 md:col-span-2">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-semibold text-on-surface">
                Welcome back, {firstName}.
              </h2>
              <p className="mb-8 max-w-xl text-on-surface-variant">
                Your AI Agent has scanned{' '}
                {rolesScanned > 0 ? rolesScanned.toLocaleString() : '1,240'} new
                roles today. We&apos;ve found {filtered.length} high-match
                opportunities for you.
              </p>
              <Link
                to="/"
                className="mb-6 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <Icon name="rocket_launch" />
                Onboarding
              </Link>
              <div className="flex flex-wrap gap-2">
                {skillTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary"
                  >
                    {tag}
                  </span>
                ))}
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-on-surface-variant">
                  +4 more
                </span>
              </div>
            </div>
          </article>

          <article className="glass-card rounded-xl border-l-2 border-l-tertiary p-8">
            <div className="mb-4 flex items-center gap-2">
              <Icon name="auto_awesome" className="text-tertiary" />
              <h3 className="text-sm font-medium uppercase tracking-widest text-tertiary">
                AI Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {aiStrengths.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 text-base text-on-surface"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                  {s}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <div className="no-scrollbar mb-6 flex items-center gap-4 overflow-x-auto pb-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeFilter === f.id
                  ? 'bg-primary text-on-primary'
                  : 'glass-card text-on-surface-variant hover:text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Icon
              name="search_off"
              className="mb-4 text-5xl text-on-surface-variant"
            />
            <p className="text-lg font-medium text-on-surface">
              No opportunities in this category
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Try another filter or run analysis again from profile.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-on-primary"
            >
              Show all matches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filtered.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
