import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, EmptyState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '@/lib/api';

interface GapEntry {
  id: string;
  gap: string;
  impact: string;
  phase2: string;
  status: 'open' | 'documented' | 'mitigated';
}

async function fetchGaps(): Promise<GapEntry[]> {
  const json = (await api.http.get('admin/gap-register').json()) as { gaps: GapEntry[] };
  return json.gaps;
}

const statusVariant = {
  open: 'destructive',
  documented: 'warning',
  mitigated: 'success',
} as const;

const humanize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function GapRegisterRoute() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'gap-register'], queryFn: fetchGaps });
  const [query, setQuery] = useState('');
  const [statusSelected, setStatusSelected] = useState<string[]>([]);

  const statusCounts = useMemo(() => {
    const c = new Map<string, number>();
    for (const g of data ?? []) c.set(g.status, (c.get(g.status) ?? 0) + 1);
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((g) => {
      if (statusSelected.length && !statusSelected.includes(g.status)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !g.gap.toLowerCase().includes(q) &&
          !g.impact.toLowerCase().includes(q) &&
          !g.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, query, statusSelected]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.gapRegister.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.gapRegister.subtitle')}</p>
      </div>

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
            options: [...statusCounts.keys()].map((value) => ({
              value,
              label: humanize(value),
              count: statusCounts.get(value),
            })),
          },
        ]}
        onClear={() => {
          setQuery('');
          setStatusSelected([]);
        }}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isLoading || !data ? (
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
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">{t('admin.gapRegister.columns.title')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.gapRegister.columns.impact')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.gapRegister.columns.phase2')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.gapRegister.columns.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((gap, idx) => (
                  <motion.tr
                    key={gap.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="border-b align-top last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium">{gap.gap}</td>
                    <td className="px-6 py-4 text-muted-foreground">{gap.impact}</td>
                    <td className="px-6 py-4 text-muted-foreground">{gap.phase2}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[gap.status]}>{gap.status}</Badge>
                    </td>
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
