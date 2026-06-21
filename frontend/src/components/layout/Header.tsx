import { Link, useLocation } from 'react-router-dom';
import { USER_AVATAR } from '../../data/opportunities';
import { getApiMode } from '../../api';
import { useApp } from '../../context';
import { Icon } from '../ui/Icon';

interface HeaderProps {
  showNav?: boolean;
  minimal?: boolean;
}

const NAV_LINKS = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Leads', path: '/leads' },
  { label: 'Network', path: '/network' },
  { label: 'Profile', path: '/profile' },
  { label: 'Onboarding', path: '/' },
];

export function Header({ showNav = true, minimal = false }: HeaderProps) {
  const { pathname } = useLocation();
  const { analysisStatus, backendConnected } = useApp();
  const canUseApp = analysisStatus === 'complete';
  const apiMode = getApiMode();

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-background/80 px-4 shadow-[0_0_20px_rgba(180,197,255,0.05)] backdrop-blur-xl md:px-6">
      <Link
        to={canUseApp ? '/dashboard' : '/'}
        className="flex min-w-0 items-center gap-2"
      >
        <Icon name="smart_toy" className="shrink-0 text-2xl text-primary" />
        <span className="truncate text-lg font-bold tracking-tight text-primary sm:text-xl">
          <span className="sm:hidden">Agent</span>
          <span className="hidden sm:inline">OpportunityAgent</span>
        </span>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        {!minimal && (
          <span
            className={`hidden rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline ${
              apiMode === 'mock'
                ? 'bg-amber-500/20 text-amber-300'
                : backendConnected
                  ? 'bg-tertiary/20 text-tertiary'
                  : backendConnected === false
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-white/10 text-on-surface-variant'
            }`}
            title={
              apiMode === 'mock'
                ? 'In-browser mock API'
                : 'Express backend + Groq AI'
            }
          >
            {apiMode === 'mock'
              ? 'Mock'
              : backendConnected
                ? 'Live API'
                : backendConnected === false
                  ? 'Offline'
                  : '…'}
          </span>
        )}
        {showNav && !minimal && canUseApp && (
          <nav className="hidden gap-5 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.path ||
                  (link.path === '/' && pathname === '/onboarding')
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        {!minimal && canUseApp && (
          <Link to="/profile" className="hidden sm:block">
            <img
              src={USER_AVATAR}
              alt="User avatar"
              className="h-8 w-8 rounded-full border border-white/10 object-cover md:h-9 md:w-9"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
