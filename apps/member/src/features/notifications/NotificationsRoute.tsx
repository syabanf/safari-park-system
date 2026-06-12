import { fetchNotifications } from '@/features/home/queries';
import type { NotificationData } from '@/features/home/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, EmptyState, ErrorState, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Bell, BellOff, CalendarDays, CheckCheck, Gift, RefreshCw, Ticket } from 'lucide-react';

const iconForCategory = {
  pass: Ticket,
  perk: Gift,
  event: CalendarDays,
  renewal: RefreshCw,
} as const;

const accentForCategory = {
  pass: 'bg-brand-100 text-brand-800',
  perk: 'bg-rose-100 text-rose-800',
  event: 'bg-earth-100 text-earth-800',
  renewal: 'bg-slate-100 text-slate-800',
} as const;

export function NotificationsRoute() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const unread = (data ?? []).filter((n) => !n.read).length;
  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Optimistic, client-only: flip every notification to read. The same query
  // key feeds the TopBar bell, so its unread badge clears in lockstep.
  const markAllRead = () => {
    queryClient.setQueryData<NotificationData[]>(['notifications'], (prev) =>
      (prev ?? []).map((n) => (n.read ? n : { ...n, read: true })),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{t('notifications.title')}</h1>
          {unread > 0 ? (
            <p className="mt-1 text-xs font-medium text-brand-700">
              {t('notifications.unread', { count: unread })}
            </p>
          ) : null}
        </div>
        {unread > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t('notifications.markAllRead')}
          </button>
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800">
            <Bell className="h-5 w-5" />
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={t('common.errorTitle')}
          description={t('common.errorHint')}
          onRetry={() => refetch()}
          retryLabel={t('common.retry')}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={t('notifications.empty')}
          description={t('notifications.emptyHint')}
        />
      ) : (
        <div className="space-y-2">
          {data.map((n, i) => {
            const Icon = iconForCategory[n.category];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <Card
                  className={`border-border/60 ${n.read ? 'bg-white/70' : 'bg-white shadow-sm shadow-brand-900/5'}`}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentForCategory[n.category]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{n.title}</p>
                        {!n.read ? (
                          <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {formatter.format(new Date(n.timestamp))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
