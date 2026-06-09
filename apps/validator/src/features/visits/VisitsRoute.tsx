import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

interface RecentVisit {
  id: string;
  passId: string;
  holderName: string;
  tier: string;
  scannedAt: string;
  source: 'online' | 'offline' | 'manual';
  avatar?: string;
}

async function fetchVisits(): Promise<RecentVisit[]> {
  const json = (await api.http.get('validator/recent-visits').json()) as { visits: RecentVisit[] };
  return json.visits;
}

export function VisitsRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['recent-visits'], queryFn: fetchVisits });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('validator.visits.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('validator.visits.subtitle')}</p>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('validator.visits.empty')}</p>
      ) : (
        <ul className="space-y-2 pb-6">
          {data.map((v, i) => (
            <motion.li
              key={v.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.4) }}
            >
              <Card className="border-border/60 bg-white/85">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
                    {v.avatar ?? v.holderName.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{v.holderName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {v.passId} · {v.tier}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground">
                      {new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' }).format(new Date(v.scannedAt))}
                    </span>
                    {v.source === 'offline' ? (
                      <Badge variant="warning" className="flex items-center gap-0.5 text-[9px]">
                        <WifiOff className="h-3 w-3" />
                        offline
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
