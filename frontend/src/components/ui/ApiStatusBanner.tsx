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

  useEffect(() => {
    if (mode === 'mock') {
      setBackendOk(null);
      return;
    }
    let cancelled = false;
    void checkApiHealth()
      .then((h) => {
        if (!cancelled) setBackendOk(h.ok);
      })
      .catch(() => {
        if (!cancelled) setBackendOk(false);
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
          and run the backend for live data.
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
          {import.meta.env.PROD ? (
            <>
              API not reachable. In Vercel: Framework preset <strong>Services</strong>, set{' '}
              <code className="rounded bg-black/30 px-1">CURSOR_API_KEY</code> and{' '}
              <code className="rounded bg-black/30 px-1">VITE_API_URL=/api</code>, then redeploy.
              Test{' '}
              <a
                href="/api/health"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                /api/health
              </a>
              .
            </>
          ) : (
            'Run npm run dev:backend in the backend/ folder.'
          )}
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
        <strong className="font-semibold">Live API</strong> — connected to Express
        + Cursor Agent SDK
      </span>
    </Banner>
  );
}
