import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Card, CardContent, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

interface AuditEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  actor: string;
  event: string;
  target: string;
  summary: string;
}

async function fetchAudit(): Promise<AuditEntry[]> {
  const json = (await api.http.get('admin/audit').json()) as { entries: AuditEntry[] };
  return json.entries;
}

const levelColors = {
  info: 'bg-brand-100 text-brand-800',
  warn: 'bg-earth-100 text-earth-800',
  error: 'bg-rose-100 text-rose-800',
} as const;

export function AuditRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'audit'], queryFn: fetchAudit });

  const [query, setQuery] = useState('');
  const [levelSelected, setLevelSelected] = useState<string[]>([]);
  const [actorSelected, setActorSelected] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  const counts = useMemo(() => {
    const c = { level: new Map<string, number>(), actor: new Map<string, number>() };
    for (const e of data ?? []) {
      c.level.set(e.level, (c.level.get(e.level) ?? 0) + 1);
      c.actor.set(e.actor, (c.actor.get(e.actor) ?? 0) + 1);
    }
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((e) => {
      if (levelSelected.length && !levelSelected.includes(e.level)) return false;
      if (actorSelected.length && !actorSelected.includes(e.actor)) return false;
      if (dateRange.from && new Date(e.timestamp) < new Date(dateRange.from)) return false;
      if (dateRange.to && new Date(e.timestamp) > new Date(dateRange.to)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !e.event.toLowerCase().includes(q) &&
          !e.actor.toLowerCase().includes(q) &&
          !e.target.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, levelSelected, actorSelected, dateRange, query]);

  const actorOptions = useMemo(
    () => Array.from(counts.actor.entries()).map(([value, count]) => ({ value, label: value, count })),
    [counts],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.audit.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.audit.subtitle')}</p>
      </header>

      <AdvancedFilters
        searchPlaceholder="Search event, actor, or target"
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'level',
            label: t('admin.filters.severity') as string,
            selected: levelSelected,
            onChange: setLevelSelected,
            options: ['info', 'warn', 'error'].map((v) => ({
              value: v,
              label: v.toUpperCase(),
              count: counts.level.get(v),
            })),
          },
          { key: 'actor', label: t('admin.filters.role') as string, selected: actorSelected, onChange: setActorSelected, options: actorOptions },
        ]}
        dateRange={{ key: 'timestamp', label: t('admin.filters.date') as string, value: dateRange, onChange: setDateRange }}
        onClear={() => {
          setQuery('');
          setLevelSelected([]);
          setActorSelected([]);
          setDateRange({ from: null, to: null });
        }}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isError ? (
            <ErrorState
              title={t('admin.common.errorTitle')}
              description={t('admin.common.errorHint')}
              retryLabel={t('admin.common.retry')}
              onRetry={() => refetch()}
            />
          ) : isLoading || !data ? (
            <div className="p-6 text-sm text-muted-foreground">{t('admin.common.loading')}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">{t('admin.audit.columns.timestamp')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.audit.columns.level')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.audit.columns.actor')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.audit.columns.event')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.audit.columns.target')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.4) }}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                      {formatter.format(new Date(entry.timestamp))}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${levelColors[entry.level]}`}
                      >
                        {entry.level}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{entry.actor}</td>
                    <td className="px-6 py-3 font-medium">{entry.event}</td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{entry.target}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
