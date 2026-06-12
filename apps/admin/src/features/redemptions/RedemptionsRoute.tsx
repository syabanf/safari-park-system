import { api } from '@/lib/api';
import { useValueLabel } from '@/lib/filterValues';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, EmptyState, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminRedemption {
  id: string;
  passHolder: string;
  passId: string;
  gateId: string;
  scannedAt: string;
  verdict: 'allow' | 'deny' | 'manual';
  source: 'online' | 'offline' | 'manual';
}

async function fetchRedemptions(): Promise<AdminRedemption[]> {
  const json = (await api.http.get('admin/redemptions').json()) as { redemptions: AdminRedemption[] };
  return json.redemptions;
}

const verdictVariant: Record<AdminRedemption['verdict'], 'success' | 'destructive' | 'warning'> = {
  allow: 'success',
  deny: 'destructive',
  manual: 'warning',
};

export function RedemptionsRoute() {
  const { t, i18n } = useTranslation();
  const valueLabel = useValueLabel();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'redemptions'], queryFn: fetchRedemptions });

  const [query, setQuery] = useState('');
  const [gateSelected, setGateSelected] = useState<string[]>([]);
  const [verdictSelected, setVerdictSelected] = useState<string[]>([]);
  const [sourceSelected, setSourceSelected] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const counts = useMemo(() => {
    const c = {
      gate: new Map<string, number>(),
      verdict: new Map<string, number>(),
      source: new Map<string, number>(),
    };
    for (const r of data ?? []) {
      c.gate.set(r.gateId, (c.gate.get(r.gateId) ?? 0) + 1);
      c.verdict.set(r.verdict, (c.verdict.get(r.verdict) ?? 0) + 1);
      c.source.set(r.source, (c.source.get(r.source) ?? 0) + 1);
    }
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      if (gateSelected.length && !gateSelected.includes(r.gateId)) return false;
      if (verdictSelected.length && !verdictSelected.includes(r.verdict)) return false;
      if (sourceSelected.length && !sourceSelected.includes(r.source)) return false;
      if (dateRange.from && new Date(r.scannedAt) < new Date(dateRange.from)) return false;
      if (dateRange.to && new Date(r.scannedAt) > new Date(dateRange.to)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !r.passHolder.toLowerCase().includes(q) &&
          !r.passId.toLowerCase().includes(q) &&
          !r.gateId.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, gateSelected, verdictSelected, sourceSelected, dateRange, query]);

  const gateOptions = useMemo(
    () => Array.from(counts.gate.entries()).map(([value, count]) => ({ value, label: valueLabel(value), count })),
    [counts, valueLabel],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.redemptions.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.redemptions.subtitle')}</p>
      </div>

      <AdvancedFilters
        searchPlaceholder="Search holder, pass ID, or gate"
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'verdict',
            label: t('admin.filters.status') as string,
            selected: verdictSelected,
            onChange: setVerdictSelected,
            options: ['allow', 'deny', 'manual'].map((v) => ({
              value: v,
              label: valueLabel(v),
              count: counts.verdict.get(v),
            })),
          },
          {
            key: 'source',
            label: t('admin.filters.type') as string,
            selected: sourceSelected,
            onChange: setSourceSelected,
            options: ['online', 'offline', 'manual'].map((v) => ({
              value: v,
              label: valueLabel(v),
              count: counts.source.get(v),
            })),
          },
          { key: 'gate', label: t('admin.filters.gate') as string, selected: gateSelected, onChange: setGateSelected, options: gateOptions },
        ]}
        dateRange={{ key: 'scannedAt', label: t('admin.filters.date') as string, value: dateRange, onChange: setDateRange }}
        onClear={() => {
          setQuery('');
          setGateSelected([]);
          setVerdictSelected([]);
          setSourceSelected([]);
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
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('admin.common.noMatches')}
              description={t('admin.common.noMatchesHint')}
            />
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Holder</th>
                  <th className="px-6 py-3 font-medium">Gate</th>
                  <th className="px-6 py-3 font-medium">Verdict</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Pass ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.4) }}
                    onClick={() => navigate(`/redemptions/${r.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/redemptions/${r.id}`);
                      }
                    }}
                    className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(r.scannedAt))}
                    </td>
                    <td className="px-6 py-3 font-medium">{r.passHolder}</td>
                    <td className="px-6 py-3 text-muted-foreground">{r.gateId}</td>
                    <td className="px-6 py-3">
                      <Badge variant={verdictVariant[r.verdict]}>{r.verdict}</Badge>
                    </td>
                    <td className="px-6 py-3 text-xs">{r.source}</td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{r.passId}</td>
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
