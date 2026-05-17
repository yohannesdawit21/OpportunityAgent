import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context';
import { Icon } from '../ui/Icon';

const appItems = [
  { id: 'home', icon: 'home', label: 'Home', path: '/dashboard' },
  { id: 'leads', icon: 'bolt', label: 'Leads', path: '/leads' },
  { id: 'network', icon: 'explore', label: 'Network', path: '/network' },
  { id: 'profile', icon: 'person', label: 'Profile', path: '/profile' },
] as const;

const onboardingItem = {
  id: 'onboarding',
  icon: 'rocket_launch',
  label: 'Setup',
  path: '/',
} as const;

const BOTTOM_NAV_PATHS = new Set([
  '/',
  '/dashboard',
  '/leads',
  '/network',
  '/profile',
]);

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { analysisStatus, closeApplication } = useApp();
  const canUseApp = analysisStatus === 'complete';

  if (!BOTTOM_NAV_PATHS.has(pathname)) {
    return null;
  }

  if (pathname === '/' && !canUseApp) {
    return null;
  }

  const items =
    pathname === '/' && canUseApp
      ? [onboardingItem, ...appItems]
      : [...appItems];

  const activeId =
    items.find((item) => item.path === pathname)?.id ??
    (pathname === '/' ? 'onboarding' : 'home');

  const goTo = (path: string) => {
    closeApplication();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around rounded-t-xl border-t border-white/10 bg-background/40 px-4 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(item.path)}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
              active
                ? 'font-bold text-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Icon name={item.icon} className="text-xl" />
            <span
              className={`font-semibold tracking-wide ${
                items.length > 4 ? 'text-[10px]' : 'text-xs'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
