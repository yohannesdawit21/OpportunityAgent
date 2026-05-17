import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationHelperPanel } from '../../features/ApplicationHelperPanel';
import { Icon } from '../ui/Icon';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  showSearchFab?: boolean;
}

export function AppShell({ children, showSearchFab = false }: AppShellProps) {
  const { selectedOpportunity } = useApp();
  const panelOpen = Boolean(selectedOpportunity);

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
          className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-white shadow-lg transition-transform hover:scale-105 active:scale-95 lg:hidden"
          aria-label="Search opportunities"
        >
          <Icon name="search" />
        </button>
      )}
      <BottomNav />
      {selectedOpportunity && <ApplicationHelperPanel />}
    </>
  );
}
