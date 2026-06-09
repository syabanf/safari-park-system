import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, ShieldCheck, TimerReset, type LucideIcon } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SlaMetric {
  id: string;
  label: string;
  category: 'gate' | 'security' | 'membership' | 'integration' | 'support';
  unit: '%' | 'ms' | 'count';
  target: number;
  value: number;
  status: 'on-target' | 'at-risk' | 'breach';
  trendPct: number;
  description: string;
}

interface SlaData {
  metrics: SlaMetric[];
  latencyTrend: { hour: string; p50: number; p95: number; p99: number }[];
}

async function fetchSla(): Promise<SlaData> {
  return (await api.http.get('admin/sla').json()) as SlaData;
}

const statusBadge: Record<SlaMetric['status'], 'success' | 'warning' | 'destructive'> = {
  'on-target': 'success',
  'at-risk': 'warning',
  breach: 'destructive',
};

const statusRing: Record<SlaMetric['status'], string> = {
  'on-target': 'ring-brand-200 bg-brand-50/60',
  'at-risk': 'ring-earth-200 bg-earth-50/60',
  breach: 'ring-rose-200 bg-rose-50/60',
};

const categoryIcon: Record<SlaMetric['category'], LucideIcon> = {
  gate: ShieldCheck,
  security: ShieldCheck,
  membership: ShieldCheck,
  integration: TimerReset,
  support: TimerReset,
};

function formatValue(m: SlaMetric): string {
  if (m.unit === '%') return `${m.value.toFixed(2)}%`;
  if (m.unit === 'ms') return `${m.value} ms`;
  return m.value.toLocaleString();
}

function formatTarget(m: SlaMetric): string {
  if (m.unit === '%') return `≥ ${m.target}%`;
  if (m.unit === 'ms') return `< ${m.target} ms`;
  return `≤ ${m.target}`;
}

export function SlaRoute() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'sla'], queryFn: fetchSla });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.sla.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.sla.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((m, i) => {
          const Icon = categoryIcon[m.category];
          const positive = m.trendPct >= 0;
          const trendIsGood =
            m.unit === 'ms' || m.unit === 'count' ? m.trendPct <= 0 : m.trendPct >= 0;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Card className={`ring-1 ${statusRing[m.status]}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t(`admin.sla.categories.${m.category}`)}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-tight">{m.label}</p>
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-white/80 shadow-sm ring-1 ring-black/5">
                      <Icon className="h-4 w-4 text-brand-700" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-tight">{formatValue(m)}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      {t('admin.sla.target')} · {formatTarget(m)}
                    </span>
                    <Badge variant={statusBadge[m.status]}>
                      {t(`admin.sla.status.${m.status}`)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px]">
                    <span
                      className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${
                        trendIsGood
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(m.trendPct).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">{m.description}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.sla.latencyTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.latencyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
              <XAxis dataKey="hour" stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(152 12% 38%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit="ms"
              />
              <Tooltip
                contentStyle={{
                  border: '1px solid hsl(35 22% 88%)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="p50" stroke="#5bac6a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" stroke="#287338" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="p99" stroke="#b08754" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
