import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/api';

interface PassBreakdown {
  byTier: { tier: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

// Per-pass rows are derived from the members directory — every member holds an
// Annual Pass — so the list is real data the detail route can open.
interface AdminMember {
  id: string;
  fullName: string;
  email: string;
  tier: 'adult' | 'child' | 'senior' | 'family';
  status: 'active' | 'expired' | 'suspended' | 'pending';
  validUntil: string;
  entries: number;
}

async function fetchPasses(): Promise<PassBreakdown> {
  return (await api.http.get('admin/passes/breakdown').json()) as PassBreakdown;
}

async function fetchMembers(): Promise<AdminMember[]> {
  const json = (await api.http.get('admin/members').json()) as { members: AdminMember[] };
  return json.members;
}

const tierColors = ['#287338', '#5bac6a', '#b08754', '#d4be96'];
const statusColors: Record<string, string> = {
  active: '#287338',
  expired: '#9a3a3a',
  suspended: '#b08754',
  pending: '#a5a5a5',
};

const statusVariant: Record<AdminMember['status'], 'success' | 'destructive' | 'warning' | 'secondary'> = {
  active: 'success',
  expired: 'destructive',
  suspended: 'warning',
  pending: 'secondary',
};

// Members are keyed m_1023 → the pass for that member is p_1023; the detail
// route accepts any id, so this keeps the link honest and stable.
const passIdFor = (memberId: string) => `p_${memberId.replace(/^m_/, '')}`;

export function PassesRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'passes'], queryFn: fetchPasses });
  const membersQ = useQuery({ queryKey: ['admin', 'members'], queryFn: fetchMembers });
  const [query, setQuery] = useState('');
  const [tierSelected, setTierSelected] = useState<string[]>([]);
  const [statusSelected, setStatusSelected] = useState<string[]>([]);

  const counts = useMemo(() => {
    const c = { tier: new Map<string, number>(), status: new Map<string, number>() };
    for (const m of membersQ.data ?? []) {
      c.tier.set(m.tier, (c.tier.get(m.tier) ?? 0) + 1);
      c.status.set(m.status, (c.status.get(m.status) ?? 0) + 1);
    }
    return c;
  }, [membersQ.data]);

  const filtered = useMemo(() => {
    const members = membersQ.data ?? [];
    return members.filter((m) => {
      if (tierSelected.length && !tierSelected.includes(m.tier)) return false;
      if (statusSelected.length && !statusSelected.includes(m.status)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !m.fullName.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q) &&
          !passIdFor(m.id).toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [membersQ.data, query, tierSelected, statusSelected]);

  if (isError) {
    return (
      <ErrorState
        title={t('admin.common.errorTitle')}
        description={t('admin.common.errorHint')}
        retryLabel={t('admin.common.retry')}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.passes.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.passes.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.byTier}
                  dataKey="count"
                  nameKey="tier"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.byTier.map((_, i) => (
                    <Cell key={i} fill={tierColors[i % tierColors.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(35 22% 88%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.byStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.byStatus.map((entry) => (
                    <Cell key={entry.status} fill={statusColors[entry.status] ?? '#287338'} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(35 22% 88%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <AdvancedFilters
        searchPlaceholder={t('admin.passes.search') as string}
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'tier',
            label: t('admin.filters.tier') as string,
            selected: tierSelected,
            onChange: setTierSelected,
            options: (['adult', 'child', 'senior', 'family'] as const).map((v) => ({
              value: v,
              label: t(`pass.tier.${v}`),
              count: counts.tier.get(v),
            })),
          },
          {
            key: 'status',
            label: t('admin.filters.status') as string,
            selected: statusSelected,
            onChange: setStatusSelected,
            options: (['active', 'expired', 'suspended', 'pending'] as const).map((v) => ({
              value: v,
              label: t(`pass.status.${v}`),
              count: counts.status.get(v),
            })),
          },
        ]}
        onClear={() => {
          setQuery('');
          setTierSelected([]);
          setStatusSelected([]);
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.passes.listTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {membersQ.isLoading ? (
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
                  <th className="px-6 py-3 font-medium">{t('admin.passes.columns.holder')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.passes.columns.passId')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.passes.columns.tier')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.passes.columns.status')}</th>
                  <th className="px-6 py-3 font-medium">{t('admin.passes.columns.validUntil')}</th>
                  <th className="px-6 py-3 text-right font-medium">{t('admin.passes.columns.entries')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => {
                  const passId = passIdFor(m.id);
                  return (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.4) }}
                      onClick={() => navigate(`/passes/${passId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/passes/${passId}`);
                        }
                      }}
                      className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
                            {m.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{m.fullName}</div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{passId}</td>
                      <td className="px-6 py-3 capitalize">{t(`pass.tier.${m.tier}`)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={statusVariant[m.status]}>{t(`pass.status.${m.status}`)}</Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{fmt.format(new Date(m.validUntil))}</td>
                      <td className="px-6 py-3 text-right font-mono text-xs">{m.entries}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
