import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, DollarSign, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatCard } from '@/components/charts/StatCard';
import { api } from '@/lib/api';

interface OverviewData {
  activeMembers: number;
  activeMembersTrendPct: number;
  todaysEntries: number;
  todaysEntriesTrendPct: number;
  weekRevenueIdr: number;
  weekRevenueTrendPct: number;
  offlinePending: number;
  entriesLast7Days: { date: string; entries: number; activations: number }[];
  gateDistribution: { gate: string; entries: number }[];
  tierDistribution: { tier: string; count: number }[];
}

async function fetchOverview(): Promise<OverviewData> {
  return (await api.http.get('admin/overview').json()) as OverviewData;
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const tierColors = ['#287338', '#5bac6a', '#b08754', '#d4be96'];

export function OverviewRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'overview'], queryFn: fetchOverview });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const today = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(new Date());

  return (
    <div className="space-y-5 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('admin.overview.subtitle', { date: today })}
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight lg:text-2xl">{t('admin.overview.title')}</h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4 xl:grid-cols-4">
        <StatCard
          index={0}
          label={t('admin.overview.kpi.activeMembers')}
          value={data.activeMembers.toLocaleString(i18n.language)}
          icon={Users}
          trendPct={data.activeMembersTrendPct}
          trendLabel={t('admin.overview.trend', { value: '' })}
          accent="brand"
        />
        <StatCard
          index={1}
          label={t('admin.overview.kpi.todaysEntries')}
          value={data.todaysEntries.toLocaleString(i18n.language)}
          icon={Activity}
          trendPct={data.todaysEntriesTrendPct}
          accent="brand"
        />
        <StatCard
          index={2}
          label={t('admin.overview.kpi.weekRevenue')}
          value={idr.format(data.weekRevenueIdr)}
          icon={DollarSign}
          trendPct={data.weekRevenueTrendPct}
          accent="earth"
        />
        <StatCard
          index={3}
          label={t('admin.overview.kpi.offlinePending')}
          value={data.offlinePending.toLocaleString(i18n.language)}
          icon={AlertCircle}
          accent={data.offlinePending > 10 ? 'rose' : 'brand'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2 lg:pb-4">
            <CardTitle className="text-sm lg:text-base">{t('admin.overview.lastSeven')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 lg:px-6">
            <ResponsiveContainer width="100%" height={200} className="lg:!h-[260px]">
              <AreaChart data={data.entriesLast7Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="entries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#287338" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#287338" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="activations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b08754" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#b08754" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(35 22% 88%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="entries"
                  stroke="#287338"
                  strokeWidth={2}
                  fill="url(#entries)"
                />
                <Area
                  type="monotone"
                  dataKey="activations"
                  stroke="#b08754"
                  strokeWidth={2}
                  fill="url(#activations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 lg:pb-4">
            <CardTitle className="text-sm lg:text-base">{t('admin.overview.topTier')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 lg:px-6">
            <ResponsiveContainer width="100%" height={200} className="lg:!h-[260px]">
              <BarChart data={data.tierDistribution} layout="vertical" margin={{ left: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="tier" type="category" stroke="hsl(152 12% 38%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(35 30% 94%)' }}
                  contentStyle={{
                    border: '1px solid hsl(35 22% 88%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {data.tierDistribution.map((_, idx) => (
                    <Cell key={idx} fill={tierColors[idx % tierColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 lg:pb-4">
          <CardTitle className="text-sm lg:text-base">{t('admin.overview.byGate')}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 lg:px-6">
          <ResponsiveContainer width="100%" height={180} className="lg:!h-[220px]">
            <BarChart data={data.gateDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
              <XAxis dataKey="gate" stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(35 30% 94%)' }}
                contentStyle={{
                  border: '1px solid hsl(35 22% 88%)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="entries" radius={[8, 8, 0, 0]} fill="#287338" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
