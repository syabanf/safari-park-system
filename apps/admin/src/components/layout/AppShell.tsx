import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever we navigate (mobile only — desktop sidebar is sticky).
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is open on mobile.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex flex-1 flex-col">
        <TopBar onMenuClick={() => setMenuOpen(true)} />
        {/* pb-20 keeps content above the mobile bottom nav; reset on lg+. */}
        <main className="flex-1 px-4 pb-20 pt-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 lg:pb-8">
          <Outlet />
        </main>
        <BottomNav onMoreClick={() => setMenuOpen(true)} />
      </div>
    </div>
  );
}
