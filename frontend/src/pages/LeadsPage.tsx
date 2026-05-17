import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { Icon } from '../components/ui/Icon';
import { useApp } from '../context';

export function LeadsPage() {
  const { opportunities } = useApp();

  const leads = useMemo(
    () => [...opportunities].sort((a, b) => b.matchScore - a.matchScore),
    [opportunities],
  );

  return (
    <AppShell showSearchFab searchScrollTargetId="matches">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <header id="matches" className="mb-8 scroll-mt-28">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="bolt" className="text-2xl text-primary" />
            <h1 className="text-3xl font-semibold text-on-surface">Your Leads</h1>
          </div>
          <p className="text-on-surface-variant">
            High-match roles ranked by AI confidence. Tap a lead to open the
            application helper.
          </p>
        </header>

        {leads.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Icon name="bolt" className="mb-4 text-5xl text-on-surface-variant" />
            <p className="text-lg font-medium text-on-surface">No leads yet</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Run profile analysis from onboarding to generate ranked matches.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-lg bg-primary px-6 py-2 text-sm font-medium text-on-primary"
            >
              Go to onboarding
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {leads.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
