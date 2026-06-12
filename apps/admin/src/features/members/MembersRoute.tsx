import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, EmptyState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminMember {
  id: string;
  fullName: string;
  email: string;
  tier: 'adult' | 'child' | 'senior' | 'family';
  status: 'active' | 'expired' | 'suspended' | 'pending';
  validUntil: string;
  entries: number;
}

async function fetchMembers(): Promise<AdminMember[]> {
  const json = (await api.http.get('admin/members').json()) as { members: AdminMember[] };
  return json.members;
}

const statusVariant: Record<AdminMember['status'], 'success' | 'destructive' | 'warning' | 'secondary'> = {
  active: 'success',
  expired: 'destructive',
  suspended: 'warning',
  pending: 'secondary',
};

export function MembersRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusSelected, setStatusSelected] = useState<string[]>([]);
  const [tierSelected, setTierSelected] = useState<string[]>([]);
  const [validRange, setValidRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'members'], queryFn: fetchMembers });

  const counts = useMemo(() => {
    const c = { status: new Map<string, number>(), tier: new Map<string, number>() };
    for (const m of data ?? []) {
      c.status.set(m.status, (c.status.get(m.status) ?? 0) + 1);
      c.tier.set(m.tier, (c.tier.get(m.tier) ?? 0) + 1);
    }
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((m) => {
      if (statusSelected.length && !statusSelected.includes(m.status)) return false;
      if (tierSelected.length && !tierSelected.includes(m.tier)) return false;
      if (validRange.from && new Date(m.validUntil) < new Date(validRange.from)) return false;
      if (validRange.to && new Date(m.validUntil) > new Date(validRange.to)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !m.fullName.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q) &&
          !m.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, query, statusSelected, tierSelected, validRange]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.members.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.members.subtitle')}</p>
      </div>

      <AdvancedFilters
        searchPlaceholder={t('admin.members.search') as string}
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'status',
            label: 'Status',
            selected: statusSelected,
            onChange: setStatusSelected,
            options: (['active', 'expired', 'suspended', 'pending'] as const).map((v) => ({
              value: v,
              label: t(`pass.status.${v}`),
              count: counts.status.get(v),
            })),
          },
          {
            key: 'tier',
            label: 'Tier',
            selected: tierSelected,
            onChange: setTierSelected,
            options: (['adult', 'child', 'senior', 'family'] as const).map((v) => ({
              value: v,
              label: t(`pass.tier.${v}`),
              count: counts.tier.get(v),
            })),
          },
        ]}
        dateRange={{
          key: 'validUntil',
          label: 'Valid until',
          value: validRange,
          onChange: setValidRange,
        }}
        onClear={() => {
          setQuery('');
          setStatusSelected([]);
          setTierSelected([]);
          setValidRange({ from: null, to: null });
        }}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">{t('admin.common.loading')}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('admin.common.noMatches')}
              description={t('admin.common.noMatchesHint')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">{t('admin.members.columns.name')}</th>
                    <th className="px-6 py-3 font-medium">{t('admin.members.columns.email')}</th>
                    <th className="px-6 py-3 font-medium">{t('admin.members.columns.tier')}</th>
                    <th className="px-6 py-3 font-medium">{t('admin.members.columns.status')}</th>
                    <th className="px-6 py-3 font-medium">{t('admin.members.columns.validUntil')}</th>
                    <th className="px-6 py-3 text-right font-medium">{t('admin.members.columns.entries')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, idx) => (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.4) }}
                      onClick={() => navigate(`/members/${m.id}`)}
                      className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
                            {m.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{m.fullName}</div>
                            <div className="text-xs text-muted-foreground">{m.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{m.email}</td>
                      <td className="px-6 py-3 capitalize">{t(`pass.tier.${m.tier}`)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={statusVariant[m.status]}>{t(`pass.status.${m.status}`)}</Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
                          new Date(m.validUntil),
                        )}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs">{m.entries}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
