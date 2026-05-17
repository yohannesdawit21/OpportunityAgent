import { AppShell } from '../components/layout/AppShell';
import { Icon } from '../components/ui/Icon';

const CONNECTIONS = [
  {
    name: 'Sarah Kim',
    role: 'Engineering Manager @ Lumina Systems',
    mutual: '3 mutual connections',
  },
  {
    name: 'James Ortiz',
    role: 'Recruiter @ NeuralFlow AI',
    mutual: 'Hackathon network',
  },
  {
    name: 'Priya Nair',
    role: 'Staff Engineer @ Nebula Cloud',
    mutual: 'GitHub collaborator',
  },
];

export function NetworkPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="hub" className="text-2xl text-primary" />
            <h1 className="text-3xl font-semibold text-on-surface">Network</h1>
          </div>
          <p className="text-on-surface-variant">
            People and recruiters connected to your opportunity pipeline.
          </p>
        </header>

        <div className="space-y-4">
          {CONNECTIONS.map((person) => (
            <article
              key={person.name}
              className="glass-card flex items-center justify-between gap-4 rounded-xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Icon name="person" className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{person.name}</p>
                  <p className="text-sm text-on-surface-variant">{person.role}</p>
                  <p className="mt-1 text-xs text-primary">{person.mutual}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-on-surface hover:bg-white/5"
              >
                Connect
              </button>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
