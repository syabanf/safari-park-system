import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, EmptyState, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { CalendarClock, ShieldCheck, ShieldX, Clock, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ComplianceDoc {
  id: string;
  name: string;
  authority: string;
  expires: string;
  status: 'valid' | 'expiring-soon' | 'expired';
}

async function fetchCompliance(): Promise<ComplianceDoc[]> {
  const json = (await api.http.get('admin/compliance').json()) as { documents: ComplianceDoc[] };
  return json.documents;
}

const statusVariant = {
  valid: 'success',
  'expiring-soon': 'warning',
  expired: 'destructive',
} as const;

const statusIcon = {
  valid: ShieldCheck,
  'expiring-soon': Clock,
  expired: ShieldX,
};

function daysUntil(date: string) {
  return Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
}

const humanize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function ComplianceRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'compliance'], queryFn: fetchCompliance });

  const [query, setQuery] = useState('');
  const [statusSelected, setStatusSelected] = useState<string[]>([]);
  const [categorySelected, setCategorySelected] = useState<string[]>([]);

  const counts = useMemo(() => {
    const c = { status: new Map<string, number>(), category: new Map<string, number>() };
    for (const d of data ?? []) {
      c.status.set(d.status, (c.status.get(d.status) ?? 0) + 1);
      c.category.set(d.authority, (c.category.get(d.authority) ?? 0) + 1);
    }
    return c;
  }, [data]);

  const filtered = useMemo(
    () =>
      (data ?? []).filter((d) => {
        if (statusSelected.length && !statusSelected.includes(d.status)) return false;
        if (categorySelected.length && !categorySelected.includes(d.authority)) return false;
        if (query) {
          const q = query.toLowerCase();
          if (!d.name.toLowerCase().includes(q) && !d.authority.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [data, query, statusSelected, categorySelected],
  );

  if (isError)
    return (
      <ErrorState
        title={t('admin.common.errorTitle')}
        description={t('admin.common.errorHint')}
        retryLabel={t('admin.common.retry')}
        onRetry={() => refetch()}
      />
    );

  const valid = (data ?? []).filter((d) => d.status === 'valid').length;
  const expiring = (data ?? []).filter((d) => d.status === 'expiring-soon').length;
  const expired = (data ?? []).filter((d) => d.status === 'expired').length;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.compliance.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.compliance.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <KpiTile label="Valid" value={valid} icon={ShieldCheck} accent="brand" />
        <KpiTile label="Expiring soon" value={expiring} icon={Clock} accent="earth" />
        <KpiTile label="Expired" value={expired} icon={ShieldX} accent="rose" />
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
            options: Array.from(counts.status.entries()).map(([value, count]) => ({
              value,
              label: humanize(value),
              count,
            })),
          },
          {
            key: 'category',
            label: t('admin.filters.category') as string,
            selected: categorySelected,
            onChange: setCategorySelected,
            options: Array.from(counts.category.entries()).map(([value, count]) => ({
              value,
              label: humanize(value),
              count,
            })),
          },
        ]}
        onClear={() => {
          setQuery('');
          setStatusSelected([]);
          setCategorySelected([]);
        }}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX} title={t('admin.common.noMatches')} description={t('admin.common.noMatchesHint')} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((doc, i) => {
            const Icon = statusIcon[doc.status];
            const days = daysUntil(doc.expires);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                onClick={() => navigate(`/compliance/${doc.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/compliance/${doc.id}`);
                  }
                }}
                className="cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card
                  className={`overflow-hidden border-border/60 transition-shadow hover:shadow-md ${
                    doc.status === 'expired'
                      ? 'bg-rose-50/50'
                      : doc.status === 'expiring-soon'
                        ? 'bg-earth-50/50'
                        : 'bg-white/85'
                  }`}
                >
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-xl ${
                          doc.status === 'expired'
                            ? 'bg-rose-100 text-rose-700'
                            : doc.status === 'expiring-soon'
                              ? 'bg-earth-100 text-earth-800'
                              : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.authority}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusVariant[doc.status]}>
                        {doc.status === 'expired' ? `Expired ${Math.abs(days)}d ago` : `${days}d`}
                      </Badge>
                      <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {fmt.format(new Date(doc.expires))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KpiTile({ label, value, icon: Icon, accent }: { label: string; value: number; icon: typeof ShieldCheck; accent: 'brand' | 'earth' | 'rose' }) {
  const map = {
    brand: 'bg-brand-100 text-brand-800',
    earth: 'bg-earth-100 text-earth-800',
    rose: 'bg-rose-100 text-rose-800',
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <span className={`grid h-7 w-7 place-items-center rounded-lg ${map[accent]}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
