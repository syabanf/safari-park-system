import { fetchNotifications } from '@/features/home/queries';
import { useAuthStore } from '@/features/auth/store';
import { useOnline } from '@/hooks/useOnline';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AppSwitcher } from '@tsi/ui';
import { Bell, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function TopBar() {
  const { t } = useTranslation();
  const online = useOnline();
  const navigate = useNavigate();
  const displayName = useAuthStore((s) => s.displayName);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!accessToken,
  });
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  const initials = displayName
    ? displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'T';

  return (
    <header className="glass sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
      <Link to="/home" className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white shadow-md shadow-brand-900/20">
          {initials}
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          {displayName ? (
            <>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t('app.name')}
              </span>
              <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Annual Pass</span>
              <span className="truncate text-sm font-semibold text-foreground">{t('app.name')}</span>
            </>
          )}
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium sm:flex ${
            online ? 'bg-brand-100/70 text-brand-800' : 'bg-earth-100/80 text-earth-800'
          }`}
        >
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{online ? 'Online' : t('qr.offline')}</span>
        </div>
        <AppSwitcher current="member" />
        <Link
          to="/notifications"
          aria-label={t('notifications.title') as string}
          className="relative grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-white/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </Link>
        {accessToken ? (
          <button
            type="button"
            aria-label={t('member.profile.signOut') as string}
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
