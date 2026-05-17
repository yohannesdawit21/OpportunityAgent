import type { Opportunity } from '../../types';
import { useApp } from '../../context';
import { Icon } from '../ui/Icon';
import { MatchRing } from '../ui/MatchRing';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { openApplication } = useApp();

  return (
    <article className="glass-card glow-border flex flex-col justify-between rounded-xl p-6 transition-all duration-300">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-2">
              <img
                src={opportunity.logoUrl}
                alt={`${opportunity.company} logo`}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-xl font-semibold leading-tight text-on-surface">
                {opportunity.title}
              </h4>
              <p className="text-sm text-on-surface-variant">
                {opportunity.company} • {opportunity.location}
              </p>
            </div>
          </div>
          <MatchRing score={opportunity.matchScore} />
        </div>

        <div className="relative mb-6 rounded-lg border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-start gap-2">
            <Icon name="auto_awesome" className="mt-0.5 text-xl text-primary filled" />
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                AI Rationale
              </p>
              <p className="text-sm text-on-surface-variant">{opportunity.rationale}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => openApplication(opportunity)}
          className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-on-primary transition-all hover:brightness-110 active:scale-95"
        >
          Apply Now
        </button>
        <button
          type="button"
          onClick={() => openApplication(opportunity)}
          className="glass-card flex-1 rounded-lg border border-white/20 py-3 text-sm font-medium text-on-surface transition-all hover:bg-white/5 active:scale-95"
        >
          Generate Cover Letter
        </button>
      </div>
    </article>
  );
}
