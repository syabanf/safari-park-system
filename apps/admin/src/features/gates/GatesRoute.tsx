import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, EmptyState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Activity, DoorOpen, SearchX, Wifi, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GateMap } from '@/features/gate-map/GateMap';
import { api } from '@/lib/api';

interface AdminGate {
  id: string;
  location: string;
  status: 'online' | 'offline' | 'degraded';
  lastScanAt: string;
  pendingRedemptions: number;
  scansToday: number;
}

async function fetchGates(): Promise<AdminGate[]> {
  const json = (await api.http.get('admin/gates').json()) as { gates: AdminGate[] };
  return json.gates;
}

const statusIcon = {
  online: Wifi,
  offline: WifiOff,
  degraded: Activity,
};

const statusVariant = {
  online: 'success',
  offline: 'destructive',
  degraded: 'warning',
} as const;

const humanize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function GatesRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'gates'], queryFn: fetchGates });

  const [query, setQuery] = useState('');
  const [statusSelected, setStatusSelected] = useState<string[]>([]);

  const counts = useMemo(() => {
    const c = { status: new Map<string, number>() };
    for (const g of data ?? []) {
      c.status.set(g.status, (c.status.get(g.status) ?? 0) + 1);
    }
    return c;
  }, [data]);

  const filtered = useMemo(
    () =>
      (data ?? []).filter((g) => {
        if (statusSelected.length && !statusSelected.includes(g.status)) return false;
        if (query) {
          const q = query.toLowerCase();
          if (!g.location.toLowerCase().includes(q) && !g.id.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [data, query, statusSelected],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.gates.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.gates.subtitle')}</p>
      </div>

      <GateMap />

      <AdvancedFilters
        searchPlaceholder={t('admin.filters.search') as string}
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'status',
            label: t('admin.filters.status') as string,
            selected: statusSelected,
            onChange: setStatusSelected,
            options: Array.from(counts.status.entries()).map(([value, count]) => ({
              value,
              label: humanize(value),
              count,
            })),
          },
        ]}
        onClear={() => {
          setQuery('');
          setStatusSelected([]);
        }}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX} title={t('admin.common.noMatches')} description={t('admin.common.noMatchesHint')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((gate, idx) => {
            const Icon = statusIcon[gate.status];
            return (
              <motion.div
                key={gate.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <Link to={`/gates/${gate.id}`} className="block">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                          <DoorOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{gate.location}</p>
                          <p className="text-xs font-mono text-muted-foreground">{gate.id}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[gate.status]} className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {gate.status}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Scans today</p>
                        <p className="text-lg font-semibold">{gate.scansToday.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pending sync</p>
                        <p
                          className={`text-lg font-semibold ${
                            gate.pendingRedemptions > 0 ? 'text-earth-700' : ''
                          }`}
                        >
                          {gate.pendingRedemptions}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Last scan:{' '}
                      {new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(gate.lastScanAt))}
                    </p>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
