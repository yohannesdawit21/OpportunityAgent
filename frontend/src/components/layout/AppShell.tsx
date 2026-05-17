import type { ReactNode } from 'react';
import { useApp } from '../../context';
import { ApplicationHelperPanel } from '../../features/ApplicationHelperPanel';
import { Icon } from '../ui/Icon';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  showSearchFab?: boolean;
  /** Element id to scroll to when the mobile search FAB is tapped */
  searchScrollTargetId?: string;
}

export function AppShell({
  children,
  showSearchFab = false,
  searchScrollTargetId = 'matches',
}: AppShellProps) {
  const { selectedOpportunity } = useApp();
  const panelOpen = Boolean(selectedOpportunity);

  const scrollToMatches = () => {
    document.getElementById(searchScrollTargetId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <Header />
      <Sidebar />
      <main
        className={`pb-28 pt-24 transition-opacity lg:pl-80 ${
          panelOpen ? 'pointer-events-none opacity-40' : ''
        }`}
      >
        {children}
      </main>
      {showSearchFab && !panelOpen && (
        <button
          type="button"
          onClick={scrollToMatches}
          className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-white shadow-lg transition-transform hover:scale-105 active:scale-95 lg:hidden"
          aria-label="Jump to opportunity matches"
        >
          <Icon name="search" />
        </button>
      )}
      <BottomNav />
      {selectedOpportunity && <ApplicationHelperPanel />}
    </>
  );
}
