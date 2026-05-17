import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'bolt', label: 'Leads', path: '/leads' },
  { icon: 'hub', label: 'Network', path: '/network' },
  { icon: 'person', label: 'Profile', path: '/profile' },
  { icon: 'rocket_launch', label: 'Onboarding', path: '/' },
];

export function Sidebar() {
  const { profile } = useApp();
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-80 flex-col border-r border-white/5 bg-surface/60 pt-20 backdrop-blur-2xl lg:flex">
      <div className="px-6 py-4">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Icon name="person" className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-on-surface">{profile.name}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
              AI Ready • Premium
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active =
              pathname === item.path ||
              (item.path === '/' && pathname === '/onboarding');
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all ${
                  active
                    ? 'translate-x-1 border-r-2 border-primary bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
