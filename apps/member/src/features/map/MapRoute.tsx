import { fetchParkInfo } from '@/features/home/queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, MapPin, Phone } from 'lucide-react';

export function MapRoute() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['park-info'], queryFn: fetchParkInfo });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('map.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('map.subtitle')}</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : data ? (
        <>
          <section className="space-y-3">
            {data.locations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <Card className="border-border/60 bg-white/85">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-700">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <h3 className="text-base font-semibold">{loc.name}</h3>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(loc.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-800 hover:bg-brand-100"
                      >
                        {t('map.openMap')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{loc.address}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {loc.hours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {loc.phone}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('map.tips')}
            </h2>
            <Card className="border-border/60 bg-white/85">
              <CardContent className="space-y-2 p-4">
                {data.tips.map((tip, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground">
                    · {tip}
                  </p>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </motion.div>
  );
}
