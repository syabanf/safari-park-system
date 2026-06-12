import { fetchEvents } from '@/features/home/queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, EmptyState, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarX, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EventsRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('events.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('events.subtitle')}</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={CalendarX} title={t('events.empty')} description={t('events.emptyHint')} />
      ) : (
        <div className="space-y-3">
          {data.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Link to={`/events/${e.id}`} className="block">
                <Card className="overflow-hidden border-border/60 bg-white/85 transition-shadow hover:shadow-md">
                  <div className="relative h-36 w-full overflow-hidden">
                    {e.image ? (
                      <img
                        src={e.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-brand-100 to-earth-100" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-800 backdrop-blur">
                      {e.tag}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-base font-semibold leading-tight drop-shadow">{e.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] opacity-90 drop-shadow">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatter.format(new Date(e.datetime))}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {e.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{e.summary}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
