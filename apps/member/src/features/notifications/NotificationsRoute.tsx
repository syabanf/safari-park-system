import { fetchNotifications } from '@/features/home/queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Bell, CalendarDays, Gift, RefreshCw, Ticket } from 'lucide-react';

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
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const unread = (data ?? []).filter((n) => !n.read).length;
  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('notifications.title')}</h1>
          {unread > 0 ? (
            <p className="mt-1 text-xs font-medium text-brand-700">
              {t('notifications.unread', { count: unread })}
            </p>
          ) : null}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-800">
          <Bell className="h-5 w-5" />
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('notifications.empty')}</p>
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
