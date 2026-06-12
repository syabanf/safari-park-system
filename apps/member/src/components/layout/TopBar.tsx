import { fetchNotifications } from '@/features/home/queries';
import { useAuthStore } from '@/features/auth/store';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AppSwitcher } from '@tsi/ui';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TopBar() {
  const { t } = useTranslation();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!accessToken,
  });
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <header className="glass sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border/50 px-4">
      <Link to="/home" className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white shadow-md shadow-brand-900/20">
          T
        </div>
        <div className="flex min-w-0 flex-col leading-none">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Annual Pass
          </span>
          <span className="mt-0.5 truncate text-sm font-bold text-brand-900">Taman Safari Bogor</span>
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <AppSwitcher current="member" />
        <Link
          to="/notifications"
          aria-label={t('notifications.title') as string}
          className="relative grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-white/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white ring-2 ring-background">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
