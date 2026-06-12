import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Calendar, Clock, SearchX, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'closed';
  reportedBy: string;
  location: string;
  reportedAt: string;
  closedAt: string | null;
  injuries: number;
  type: 'visitor' | 'animal' | 'operational' | 'facility';
}

interface SafetySummary {
  openIncidents: number;
  daysWithoutMajor: number;
  drillsThisMonth: number;
  avgResponseMin: number;
  bySeverity: { low: number; medium: number; high: number };
}

async function fetchSafety(): Promise<{ incidents: Incident[]; summary: SafetySummary }> {
  return (await api.http.get('admin/safety').json()) as { incidents: Incident[]; summary: SafetySummary };
}

const severityVariant = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
} as const;

const statusVariant = {
  open: 'destructive',
  investigating: 'warning',
  closed: 'success',
} as const;

const humanize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function SafetyRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'safety'], queryFn: fetchSafety });
  const [query, setQuery] = useState('');
  const [severitySelected, setSeveritySelected] = useState<string[]>([]);
  const [statusSelected, setStatusSelected] = useState<string[]>([]);
  const [typeSelected, setTypeSelected] = useState<string[]>([]);

  const counts = useMemo(() => {
    const c = {
      severity: new Map<string, number>(),
      status: new Map<string, number>(),
      type: new Map<string, number>(),
    };
    for (const inc of data?.incidents ?? []) {
      c.severity.set(inc.severity, (c.severity.get(inc.severity) ?? 0) + 1);
      c.status.set(inc.status, (c.status.get(inc.status) ?? 0) + 1);
      c.type.set(inc.type, (c.type.get(inc.type) ?? 0) + 1);
    }
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    return (data?.incidents ?? []).filter((inc) => {
      if (severitySelected.length && !severitySelected.includes(inc.severity)) return false;
      if (statusSelected.length && !statusSelected.includes(inc.status)) return false;
      if (typeSelected.length && !typeSelected.includes(inc.type)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!inc.title.toLowerCase().includes(q) && !inc.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, query, severitySelected, statusSelected, typeSelected]);

  if (isError)
    return (
      <ErrorState
        title={t('admin.common.errorTitle')}
        description={t('admin.common.errorHint')}
        retryLabel={t('admin.common.retry')}
        onRetry={() => refetch()}
      />
    );
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.safety.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.safety.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Open incidents" value={data.summary.openIncidents} icon={AlertTriangle} accent="rose" />
        <KpiTile label="Days without major" value={data.summary.daysWithoutMajor} icon={ShieldCheck} accent="brand" />
        <KpiTile label="Drills this month" value={data.summary.drillsThisMonth} icon={Calendar} accent="earth" />
        <KpiTile label="Avg response" value={`${data.summary.avgResponseMin}m`} icon={Clock} accent="brand" />
      </div>

      <AdvancedFilters
        searchPlaceholder={t('admin.filters.search') as string}
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'severity',
            label: t('admin.filters.severity') as string,
            selected: severitySelected,
            onChange: setSeveritySelected,
            options: [...counts.severity.keys()].map((v) => ({
              value: v,
              label: humanize(v),
              count: counts.severity.get(v),
            })),
          },
          {
            key: 'status',
            label: t('admin.filters.status') as string,
            selected: statusSelected,
            onChange: setStatusSelected,
            options: [...counts.status.keys()].map((v) => ({
              value: v,
              label: humanize(v),
              count: counts.status.get(v),
            })),
          },
          {
            key: 'type',
            label: t('admin.filters.type') as string,
            selected: typeSelected,
            onChange: setTypeSelected,
            options: [...counts.type.keys()].map((v) => ({
              value: v,
              label: humanize(v),
              count: counts.type.get(v),
            })),
          },
        ]}
        onClear={() => {
          setQuery('');
          setSeveritySelected([]);
          setStatusSelected([]);
          setTypeSelected([]);
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Incident log</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('admin.common.noMatches')}
              description={t('admin.common.noMatchesHint')}
            />
          ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Incident</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Reported</th>
                <th className="px-6 py-3 text-right font-medium">Injuries</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => (
                <motion.tr
                  key={inc.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => navigate(`/safety/${inc.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/safety/${inc.id}`);
                    }
                  }}
                  className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40"
                >
                  <td className="px-6 py-3">
                    <div className="font-medium">{inc.title}</div>
                    <div className="text-[11px] text-muted-foreground">{inc.location} · {inc.reportedBy}</div>
                  </td>
                  <td className="px-6 py-3 text-xs capitalize">{inc.type}</td>
                  <td className="px-6 py-3">
                    <Badge variant={severityVariant[inc.severity]}>{inc.severity}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[inc.status]}>{inc.status}</Badge>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {fmt.format(new Date(inc.reportedAt))}
                  </td>
                  <td className="px-6 py-3 text-right font-mono">
                    {inc.injuries === 0 ? '—' : inc.injuries}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By severity — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <SevTile label="Low" value={data.summary.bySeverity.low} variant="success" />
            <SevTile label="Medium" value={data.summary.bySeverity.medium} variant="warning" />
            <SevTile label="High" value={data.summary.bySeverity.high} variant="destructive" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SevTile({ label, value, variant }: { label: string; value: number; variant: 'success' | 'warning' | 'destructive' }) {
  const cls = {
    success: 'bg-brand-50 text-brand-800',
    warning: 'bg-earth-50 text-earth-800',
    destructive: 'bg-rose-50 text-rose-800',
  }[variant];
  return (
    <div className={`rounded-2xl p-4 ${cls}`}>
      <p className="text-xs uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function KpiTile({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: typeof Activity; accent: 'brand' | 'earth' | 'rose' }) {
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
