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
    <>
      <div className="flex min-h-screen">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        {/* min-w-0 is critical: without it the flex child grows to fit its content
            (wide tables) and pushes the whole page beyond the viewport on mobile. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMenuOpen(true)} />
          {/* pb-20 (mobile bottom nav clearance) → reset at md (rail) and lg (full sidebar). */}
          <main className="min-w-0 flex-1 px-4 pb-20 pt-4 sm:px-6 sm:py-6 md:pb-8 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
      {/* BottomNav rendered as a sibling of the layout root so its `fixed`
          positioning anchors to the viewport, not a flex ancestor. */}
      <BottomNav onMoreClick={() => setMenuOpen(true)} />
    </>
  );
}
