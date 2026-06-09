import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <TopBar />
      <main className="flex-1 px-4 py-6 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
