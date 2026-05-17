import { useEffect, useState, type ReactNode } from 'react';
import { checkApiHealth, getApiMode } from '../../api';
import { Icon } from './Icon';

function Banner({
  className,
  children,
  role,
}: {
  className: string;
  children: ReactNode;
  role?: 'status' | 'alert';
}) {
  return (
    <div className={className} role={role}>
      {children}
    </div>
  );
}

export function ApiStatusBanner() {
  const mode = getApiMode();
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [agentReady, setAgentReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (mode === 'mock') {
      setBackendOk(null);
      setAgentReady(null);
      return;
    }
    let cancelled = false;
    void checkApiHealth()
      .then((h) => {
        if (!cancelled) {
          setBackendOk(h.ok);
          setAgentReady(h.agent ?? false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBackendOk(false);
          setAgentReady(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  if (mode === 'mock') {
    return (
      <Banner
        className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100"
        role="status"
      >
        <Icon name="offline_bolt" className="text-amber-400" />
        <span>
          <strong className="font-semibold">Mock API</strong> — set{' '}
          <code className="rounded bg-black/30 px-1">VITE_USE_MOCK_API=false</code>{' '}
          for production.
        </span>
      </Banner>
    );
  }

  if (backendOk === null) {
    return (
      <Banner
        className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-on-surface-variant"
        role="status"
      >
        <Icon name="sync" className="animate-spin text-primary" />
        Connecting to backend…
      </Banner>
    );
  }

  if (!backendOk) {
    return (
      <Banner
        className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-100"
        role="alert"
      >
        <Icon name="error" className="text-red-400" />
        <span>
          <strong className="font-semibold">Backend offline.</strong>{' '}
          {import.meta.env.PROD
            ? 'Check that Vercel Framework preset is “Services” and open /api/health on your URL.'
            : 'Run npm run dev:backend in the backend/ folder.'}
        </span>
      </Banner>
    );
  }

  if (agentReady === false) {
    return (
      <Banner
        className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100"
        role="alert"
      >
        <Icon name="warning" className="text-amber-400" />
        <span>
          <strong className="font-semibold">CURSOR_API_KEY missing on Vercel.</strong>{' '}
          Add it under Project → Settings → Environment Variables (Production), redeploy,
          then run Analyze Profile again. Without it you only get demo job cards
          (Lumina, Nebula, etc.).
        </span>
      </Banner>
    );
  }

  return (
    <Banner
      className="mb-4 flex items-center gap-2 rounded-lg border border-tertiary/30 bg-tertiary/10 px-4 py-2.5 text-sm text-tertiary"
      role="status"
    >
      <Icon name="cloud_done" className="text-tertiary" />
      <span>
        <strong className="font-semibold">Live API</strong> — Cursor agent connected
      </span>
    </Banner>
  );
}
