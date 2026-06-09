import { fetchPerks } from '@/features/home/queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

export function PerksRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['perks'], queryFn: fetchPerks });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('perks.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('perks.subtitle')}</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No perks available.</p>
      ) : (
        <div className="space-y-3">
          {data.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Card className="overflow-hidden border-border/60 bg-white">
                <div className="flex items-stretch">
                  <div className="relative h-auto w-28 shrink-0 overflow-hidden">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-200 to-earth-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                    <div className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-xl bg-white/85 text-brand-800 backdrop-blur">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {p.category}
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold leading-tight">{p.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {t('perks.validUntil', {
                            date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
                              new Date(p.validUntil),
                            ),
                          })}
                        </p>
                      </div>
                      <Gift className="h-4 w-4 shrink-0 text-brand-700" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
