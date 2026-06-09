import { useAuthStore } from '@/features/auth/store';
import { useOnline } from '@/hooks/useOnline';
import { AppSwitcher } from '@tsi/ui';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const online = useOnline();
  const navigate = useNavigate();
  const storeGateId = useAuthStore((s) => s.gateId);
  const displayName = useAuthStore((s) => s.displayName);
  const role = useAuthStore((s) => s.role);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);

  const gateId = storeGateId ?? import.meta.env.VITE_GATE_ID ?? 'gate-unknown';
  const initials = (displayName ?? 'GV')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-xs font-bold text-white shadow-md shadow-brand-900/20">
          {initials}
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          {displayName ? (
            <>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {role ?? 'Validator'}
              </span>
              <span className="truncate text-sm font-semibold">{displayName}</span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Validator</span>
              <span className="text-sm font-semibold">Gate Console</span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs">
        <span className="hidden rounded-full bg-muted/60 px-2.5 py-1 font-mono text-[10px] text-muted-foreground sm:inline">
          {gateId}
        </span>
        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
            online ? 'bg-brand-100 text-brand-800' : 'bg-earth-100 text-earth-800'
          }`}
        >
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{online ? 'Online' : 'Offline'}</span>
        </div>
        <AppSwitcher current="validator" />
        {accessToken ? (
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              clear();
              navigate('/login');
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-white/80 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
