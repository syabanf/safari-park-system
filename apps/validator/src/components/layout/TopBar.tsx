import { useAuthStore } from '@/features/auth/store';
import { useOnline } from '@/hooks/useOnline';
import { AppSwitcher } from '@tsi/ui';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const online = useOnline();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-[11px] font-bold text-white shadow-md shadow-brand-900/20">
          GV
        </div>
        <div className="flex min-w-0 flex-col leading-none">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Validator
          </span>
          <span className="mt-0.5 truncate text-sm font-bold text-brand-900">Gate Console</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            online ? 'bg-brand-100 text-brand-800' : 'bg-earth-100 text-earth-800'
          }`}
        >
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {online ? 'Online' : 'Offline'}
        </span>
        <AppSwitcher current="validator" />
        {accessToken ? (
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              clear();
              navigate('/login');
            }}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-white/80 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
