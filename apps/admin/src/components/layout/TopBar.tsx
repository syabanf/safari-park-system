import { useTranslation } from '@tsi/i18n';
import { AppSwitcher, Input } from '@tsi/ui';
import { Bell, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

export function TopBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const displayName = useAuthStore((s) => s.displayName);
  const role = useAuthStore((s) => s.role);
  const clear = useAuthStore((s) => s.clear);

  const label = displayName ?? email ?? 'admin@tamansafari.id';
  const initial = (displayName ?? email ?? 'A').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/70 px-6 py-4 backdrop-blur-md">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('admin.common.search') as string}
          className="h-10 rounded-full border-border/60 bg-white/80 pl-9 shadow-sm focus-visible:ring-brand-400"
        />
      </div>
      <div className="flex items-center gap-3">
        <AppSwitcher current="admin" />
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-white/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-white/80 py-1 pl-1 pr-2 text-sm shadow-sm">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white">
            {initial}
          </div>
          <div className="flex flex-col leading-tight pr-1">
            <span className="text-xs font-semibold">{label}</span>
            {role ? <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{role}</span> : null}
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              clear();
              navigate('/login');
            }}
            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
