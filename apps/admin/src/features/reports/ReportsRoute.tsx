import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Button, Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Archive, Calendar, Clock, Download, FileText, Play, Zap } from 'lucide-react';

interface OpsReport {
  id: string;
  title: string;
  cadence: string;
  lastRun: string;
  nextRun: string;
  recipients: string[];
  status: 'healthy' | 'at-risk' | 'failing';
}

interface QuickReport {
  id: string;
  title: string;
  description: string;
  scope: string;
  estimatedMin: number;
  category: 'operational' | 'finance' | 'marketing' | 'compliance';
}

interface ArchivedReport {
  id: string;
  title: string;
  generatedAt: string;
  format: 'pdf' | 'csv' | 'xlsx';
  sizeKb: number;
  category: 'operational' | 'finance' | 'marketing' | 'compliance';
}

const statusVariant = {
  healthy: 'success',
  'at-risk': 'warning',
  failing: 'destructive',
} as const;

// Build a CSV string from a header row + data rows, quoting every field so
// commas/quotes inside values can't break the columns.
function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}

// Trigger a real client-side download of a CSV blob — no backend involved.
function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'report';

const quickReports: QuickReport[] = [
  {
    id: 'q-1',
    title: 'Today gate operations',
    description: 'Per-gate scans, allow/deny/manual breakdown, latency p95',
    scope: 'Last 24h',
    estimatedMin: 1,
    category: 'operational',
  },
  {
    id: 'q-2',
    title: 'Weekly membership cohort',
    description: 'Activation rate, churn, renewal funnel by tier',
    scope: 'Last 7 days',
    estimatedMin: 2,
    category: 'operational',
  },
  {
    id: 'q-3',
    title: 'Finance close — month-to-date',
    description: 'Revenue by channel, refunds, payouts, pending reconciliation',
    scope: 'Current month',
    estimatedMin: 3,
    category: 'finance',
  },
  {
    id: 'q-4',
    title: 'Campaign ROI',
    description: 'Sent / opened / clicked / converted per campaign with revenue attributed',
    scope: 'Last 30 days',
    estimatedMin: 2,
    category: 'marketing',
  },
  {
    id: 'q-5',
    title: 'Compliance digest',
    description: 'Expiring permits/licences with owner + next action',
    scope: '90-day horizon',
    estimatedMin: 1,
    category: 'compliance',
  },
  {
    id: 'q-6',
    title: 'GlobalTix reconciliation export',
    description: 'WIT ledger vs GlobalTix delta, severity-ordered',
    scope: 'Current week',
    estimatedMin: 1,
    category: 'operational',
  },
];

const now = Date.now();
const archive: ArchivedReport[] = [
  { id: 'a-1', title: 'Daily operational summary — Jun 8', generatedAt: new Date(now - 13 * 3600_000).toISOString(), format: 'pdf', sizeKb: 412, category: 'operational' },
  { id: 'a-2', title: 'Daily operational summary — Jun 7', generatedAt: new Date(now - 37 * 3600_000).toISOString(), format: 'pdf', sizeKb: 408, category: 'operational' },
  { id: 'a-3', title: 'Weekly KPI — W23', generatedAt: new Date(now - 40 * 3600_000).toISOString(), format: 'pdf', sizeKb: 1240, category: 'operational' },
  { id: 'a-4', title: 'Monthly finance close — May', generatedAt: new Date(now - 96 * 3600_000).toISOString(), format: 'xlsx', sizeKb: 2840, category: 'finance' },
  { id: 'a-5', title: 'GlobalTix reconciliation — Jun 7', generatedAt: new Date(now - 5 * 3600_000).toISOString(), format: 'csv', sizeKb: 86, category: 'operational' },
  { id: 'a-6', title: 'Marketing weekly — W23', generatedAt: new Date(now - 36 * 3600_000).toISOString(), format: 'pdf', sizeKb: 720, category: 'marketing' },
  { id: 'a-7', title: 'Incident & maintenance digest — Jun 8', generatedAt: new Date(now - 20 * 3600_000).toISOString(), format: 'pdf', sizeKb: 540, category: 'operational' },
];

async function fetchScheduledReports(): Promise<OpsReport[]> {
  const json = (await api.http.get('admin/reports').json()) as { reports: OpsReport[] };
  return json.reports;
}

const categoryAccent: Record<QuickReport['category'], string> = {
  operational: 'bg-brand-100 text-brand-800',
  finance: 'bg-earth-100 text-earth-800',
  marketing: 'bg-rose-100 text-rose-800',
  compliance: 'bg-slate-100 text-slate-700',
};

export function AdminReportsRoute() {
  const { t, i18n } = useTranslation();
  const { data: scheduled, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: fetchScheduledReports,
  });

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.reports.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.reports.subtitle')}</p>
      </header>

      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled" icon={<Clock className="h-3.5 w-3.5" />} count={scheduled?.length}>
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="quick" icon={<Zap className="h-3.5 w-3.5" />} count={quickReports.length}>
            Quick reports
          </TabsTrigger>
          <TabsTrigger value="archive" icon={<Archive className="h-3.5 w-3.5" />} count={archive.length}>
            Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled">
          {isLoading || !scheduled ? (
            <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {scheduled.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{r.title}</p>
                            <p className="text-xs text-muted-foreground">{r.cadence}</p>
                          </div>
                        </div>
                        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-muted/40 p-2.5">
                          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Last run
                          </p>
                          <p className="mt-1 font-medium">{formatter.format(new Date(r.lastRun))}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-2.5">
                          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Next run
                          </p>
                          <p className="mt-1 font-medium">{formatter.format(new Date(r.nextRun))}</p>
                        </div>
                      </div>
                      <p className="mt-3 truncate text-[11px] text-muted-foreground">
                        To: {r.recipients.join(', ')}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() =>
                            downloadCsv(
                              `${slug(r.title)}-latest.csv`,
                              toCsv(
                                ['Field', 'Value'],
                                [
                                  ['Report', r.title],
                                  ['Cadence', r.cadence],
                                  ['Status', r.status],
                                  ['Last run', formatter.format(new Date(r.lastRun))],
                                  ['Next run', formatter.format(new Date(r.nextRun))],
                                  ['Recipients', r.recipients.join('; ')],
                                ],
                              ),
                            )
                          }
                        >
                          <Download className="h-3 w-3" />
                          Latest
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          disabled
                          title={t('admin.reports.demoBuild') as string}
                        >
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quick">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickReports.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-start justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${categoryAccent[q.category]}`}
                      >
                        {q.category}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        ~{q.estimatedMin} min
                      </span>
                    </div>
                    <div className="min-h-[64px]">
                      <p className="text-base font-semibold leading-tight">{q.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{q.description}</p>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">{q.scope}</p>
                    <Button
                      size="sm"
                      className="mt-auto w-full"
                      disabled
                      title={t('admin.reports.demoBuild') as string}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Generate now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archive">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Report</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Format</th>
                    <th className="px-6 py-3 text-right font-medium">Size</th>
                    <th className="px-6 py-3 font-medium">Generated</th>
                    <th className="px-6 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {archive.map((a, i) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-6 py-3 font-medium">{a.title}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${categoryAccent[a.category]}`}>
                          {a.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs uppercase">{a.format}</td>
                      <td className="px-6 py-3 text-right font-mono text-xs text-muted-foreground">
                        {a.sizeKb} KB
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {formatter.format(new Date(a.generatedAt))}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() =>
                            downloadCsv(
                              `${slug(a.title)}.csv`,
                              toCsv(
                                ['Field', 'Value'],
                                [
                                  ['Report', a.title],
                                  ['Category', a.category],
                                  ['Format', a.format],
                                  ['Size (KB)', a.sizeKb],
                                  ['Generated', formatter.format(new Date(a.generatedAt))],
                                ],
                              ),
                            )
                          }
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
