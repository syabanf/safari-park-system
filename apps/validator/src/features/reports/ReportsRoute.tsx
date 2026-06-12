import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, CardHeader, CardTitle, ErrorState, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Check, Clock, Download, ShieldX, type LucideIcon, Wifi } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ValidatorReports {
  summary: {
    todayScans: number;
    todayAllow: number;
    todayDeny: number;
    todayManual: number;
    avgLatencyMs: number;
    offlineRecoveries: number;
    shiftStart: string;
    shiftEnd: string;
  };
  daily: { date: string; scans: number; allow: number; deny: number; manual: number; offline: number }[];
  topReasons: { reason: string; count: number }[];
}

async function fetchReports(): Promise<ValidatorReports> {
  return (await api.http.get('validator/reports').json()) as ValidatorReports;
}

/** Quote a CSV cell, escaping embedded quotes/commas/newlines per RFC 4180. */
function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a CSV from the report data and trigger a client-side download. */
function downloadReportCsv(data: ValidatorReports) {
  const rows: (string | number)[][] = [];
  rows.push(['section', 'key', 'value']);

  const summary = data.summary;
  rows.push(['summary', 'todayScans', summary.todayScans]);
  rows.push(['summary', 'todayAllow', summary.todayAllow]);
  rows.push(['summary', 'todayDeny', summary.todayDeny]);
  rows.push(['summary', 'todayManual', summary.todayManual]);
  rows.push(['summary', 'avgLatencyMs', summary.avgLatencyMs]);
  rows.push(['summary', 'offlineRecoveries', summary.offlineRecoveries]);

  rows.push([]);
  rows.push(['daily.date', 'scans', 'allow', 'deny', 'manual', 'offline']);
  for (const d of data.daily) {
    rows.push([d.date, d.scans, d.allow, d.deny, d.manual, d.offline]);
  }

  rows.push([]);
  rows.push(['reason', 'count']);
  for (const r of data.topReasons) {
    rows.push([r.reason, r.count]);
  }

  const csv = rows.map((cols) => cols.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `validator-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ReportsRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['validator-reports'],
    queryFn: fetchReports,
  });
  const displayName = useAuthStore((s) => s.displayName);

  if (isError) {
    return (
      <ErrorState
        title={t('validator.common.error')}
        description={t('validator.common.errorHint')}
        retryLabel={t('validator.common.retry')}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {displayName
            ? `${t('validator.reports.greet')}, ${displayName.split(' ')[0]} 👋`
            : t('validator.reports.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.summary.todayScans > 5
            ? t('validator.reports.narrative', {
                allow: data.summary.todayAllow,
                total: data.summary.todayScans,
              })
            : t('validator.reports.narrativeQuiet')}
        </p>
      </header>

      <Card className="border-border/60 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brand-200">{t('validator.reports.yourShift')}</p>
            <p className="text-base font-semibold">
              {formatter.format(new Date(data.summary.shiftStart))} —{' '}
              {formatter.format(new Date(data.summary.shiftEnd))}
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadReportCsv(data)}
            className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:bg-white/25"
          >
            <Download className="h-3.5 w-3.5" />
            {t('validator.reports.exportCsv')}
          </button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <KpiTile label={t('validator.reports.summary.today')} value={data.summary.todayScans} icon={Wifi} accent="brand" />
        <KpiTile label={t('validator.reports.summary.allow')} value={data.summary.todayAllow} icon={Check} accent="brand" />
        <KpiTile label={t('validator.reports.summary.deny')} value={data.summary.todayDeny} icon={ShieldX} accent="rose" />
        <KpiTile label={t('validator.reports.summary.latency')} value={`${data.summary.avgLatencyMs} ms`} icon={Clock} accent="earth" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('validator.reports.trend14d')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.daily} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(152 16% 86%)" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(152 12% 36%)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(152 12% 36%)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ border: '1px solid hsl(152 16% 86%)', borderRadius: 12, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="allow" stackId="a" fill="#287338" radius={[0, 0, 0, 0]} />
              <Bar dataKey="manual" stackId="a" fill="#b08754" />
              <Bar dataKey="deny" stackId="a" fill="#9a3a3a" />
              <Bar dataKey="offline" stackId="a" fill="#d4be96" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('validator.reports.topReasons')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.topReasons.map((r) => (
            <div key={r.reason} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
              <span>{r.reason}</span>
              <span className="font-mono text-xs text-muted-foreground">{r.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function KpiTile({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: LucideIcon; accent: 'brand' | 'earth' | 'rose' }) {
  const map = {
    brand: 'bg-brand-100 text-brand-800',
    earth: 'bg-earth-100 text-earth-800',
    rose: 'bg-rose-100 text-rose-800',
  };
  return (
    <Card className="border-border/60 bg-white/85">
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
