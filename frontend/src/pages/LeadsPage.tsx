import { useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { Icon } from '../components/ui/Icon';
import { useApp } from '../context/AppContext';

export function LeadsPage() {
  const { opportunities } = useApp();

  const leads = useMemo(
    () => [...opportunities].sort((a, b) => b.matchScore - a.matchScore),
    [opportunities],
  );

  return (
    <AppShell showSearchFab>
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="bolt" className="text-2xl text-primary" />
            <h1 className="text-3xl font-semibold text-on-surface">Your Leads</h1>
          </div>
          <p className="text-on-surface-variant">
            High-match roles ranked by AI confidence. Tap a lead to open the
            application helper.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {leads.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
