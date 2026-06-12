import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Button, Card, CardContent, ErrorState, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Archive, Calendar, Check, Clock, Download, FileText, Play, Zap } from 'lucide-react';
import { useState } from 'react';

interface OpsReport {
  id: string;
  title: string;
  cadence: string;
  lastRun: string;
  nextRun: string;
  recipients: string[];
  status: 'healthy' | 'at-risk' | 'failing';
}

type Category = 'operational' | 'finance' | 'marketing' | 'compliance';

interface QuickReport {
  id: string;
  title: string;
  description: string;
  scope: string;
  estimatedMin: number;
  category: Category;
}

interface ArchivedReport {
  id: string;
  title: string;
  generatedAt: string;
  format: 'pdf' | 'csv' | 'xlsx';
  sizeKb: number;
  category: Category;
}

const statusVariant = {
  healthy: 'success',
  'at-risk': 'warning',
  failing: 'destructive',
} as const;

const statusKey: Record<OpsReport['status'], string> = {
  healthy: 'healthy',
  'at-risk': 'atRisk',
  failing: 'failing',
};

// ─── Report payloads ────────────────────────────────────────────────
// Each report kind produces a real, multi-row dataset so a generated /
// downloaded report is a populated table, not a metadata stub. Numbers are
// deterministic and consistent with the rest of the console's fixtures.

type ReportKind =
  | 'gate'
  | 'membership'
  | 'finance'
  | 'campaign'
  | 'compliance'
  | 'reconciliation'
  | 'kpi'
  | 'incidents'
  | 'attendance';

function reportKind(title: string, category?: Category): ReportKind {
  const t = title.toLowerCase();
  if (/revenue/.test(t)) return 'finance';
  if (/reconcil|globaltix/.test(t)) return 'reconciliation';
  if (/attendance|shift/.test(t)) return 'attendance';
  if (/kpi/.test(t)) return 'kpi';
  if (/incident|maintenance/.test(t)) return 'incidents';
  if (/member|cohort|churn/.test(t)) return 'membership';
  if (/finance|close/.test(t) || category === 'finance') return 'finance';
  if (/campaign|marketing/.test(t) || category === 'marketing') return 'campaign';
  if (/complian|permit|licen/.test(t) || category === 'compliance') return 'compliance';
  return 'gate';
}

function reportData(kind: ReportKind): { headers: string[]; rows: (string | number)[][] } {
  switch (kind) {
    case 'gate':
      return {
        headers: ['Gate', 'Location', 'Scans', 'Allow', 'Deny', 'Manual', 'p95 latency (ms)'],
        rows: [
          ['gate-bgr-01', 'Bogor — Main Entrance', 412, 404, 3, 5, 287],
          ['gate-bgr-02', 'Bogor — Family Gate', 218, 214, 1, 3, 264],
          ['gate-prg-01', 'Prigen — North', 142, 139, 2, 1, 301],
          ['gate-prg-02', 'Prigen — South', 87, 85, 0, 2, 312],
          ['gate-bli-01', 'Bali — Coastal Gate', 64, 63, 1, 0, 276],
        ],
      };
    case 'membership':
      return {
        headers: ['Tier', 'Members', 'Activated (7d)', 'Churned (7d)', 'Renewal %'],
        rows: [
          ['Adult', 612, 71, 12, 88.4],
          ['Child', 308, 33, 5, 90.1],
          ['Senior', 184, 14, 3, 86.2],
          ['Family', 143, 19, 2, 91.7],
        ],
      };
    case 'finance':
      return {
        headers: ['Channel', 'Gross (IDR)', 'Refunds (IDR)', 'Net (IDR)'],
        rows: [
          ['Member app', 412_500_000, 3_200_000, 409_300_000],
          ['Admin console', 96_800_000, 1_100_000, 95_700_000],
          ['On-site', 64_200_000, 800_000, 63_400_000],
          ['GlobalTix OTA', 38_900_000, 0, 38_900_000],
        ],
      };
    case 'campaign':
      return {
        headers: ['Campaign', 'Sent', 'Opened', 'Clicked', 'Converted', 'Revenue (IDR)'],
        rows: [
          ['Photo Day', 4200, 2310, 540, 96, 81_600_000],
          ['Family Upgrade', 3800, 1900, 410, 72, 64_800_000],
          ['Earth Day', 5100, 2805, 612, 110, 22_000_000],
          ['Win-back', 2600, 1040, 180, 34, 28_900_000],
        ],
      };
    case 'compliance':
      return {
        headers: ['Document', 'Owner', 'Expires', 'Days left', 'Next action'],
        rows: [
          ['Vet operating licence', 'Dr. Sari Utami', '2026-08-14', 63, 'Renew with provincial office'],
          ['Water discharge permit', 'Facilities', '2026-07-02', 20, 'Submit lab results'],
          ['CITES re-export permit', 'Curator', '2026-09-30', 110, 'File annual return'],
          ['Boiler safety certificate', 'Engineering', '2026-06-28', 16, 'Schedule inspection'],
          ['Halal certification', 'F&B', '2026-10-15', 125, 'Book audit'],
        ],
      };
    case 'reconciliation':
      return {
        headers: ['Redemption', 'Pass', 'Gate', 'WIT at', 'GlobalTix', 'Delta'],
        rows: [
          ['red-9821', 'p_demo_4421', 'gate-bgr-02', '2026-06-12 06:12', 'missing', 'GlobalTix entry missing'],
          ['red-9783', 'p_demo_3092', 'gate-prg-01', '2026-06-12 04:58', 'error', 'Reference number collision'],
          ['red-9755', 'p_demo_2814', 'gate-bgr-01', '2026-06-12 01:30', 'late', 'Token rotated mid-flight'],
          ['red-9601', 'p_demo_1029', 'gate-bli-01', '2026-06-11 09:44', 'error', 'Product option deactivated'],
        ],
      };
    case 'kpi':
      return {
        headers: ['Metric', 'Value', 'Target', 'Status'],
        rows: [
          ['Gate validation success rate', '99.72%', '99.5%', 'On target'],
          ['Validation latency p95', '287 ms', '500 ms', 'On target'],
          ['Member activation rate', '76.4%', '80%', 'At risk'],
          ['GlobalTix reconciliation', '99.81%', '100%', 'At risk'],
          ['Support tickets / 1k entries', 3, 5, 'On target'],
        ],
      };
    case 'incidents':
      return {
        headers: ['Ticket', 'Asset', 'Severity', 'Status', 'Opened'],
        rows: [
          ['mt-006', 'Tram 3 — hydraulics', 'High', 'In progress', '2026-06-11'],
          ['mt-007', 'Bogor Main turnstile #2', 'Medium', 'Open', '2026-06-12'],
          ['mt-008', 'CCTV — Savanna loop', 'Low', 'Scheduled', '2026-06-10'],
          ['mt-009', 'Walk-in freezer — F&B', 'High', 'In progress', '2026-06-12'],
        ],
      };
    case 'attendance':
      return {
        headers: ['Staff', 'Role', 'Gate', 'Status', 'Clock in', 'Hours'],
        rows: [
          ['Rina Wijaya', 'Gate Officer', 'Bogor — Main', 'On shift', '10:02', 5.8],
          ['Adi Pratama', 'Senior Gate Officer', 'Bogor — Family', 'On shift', '09:30', 6.3],
          ['Bayu Saputra', 'Shift Supervisor', 'Prigen — North', 'On shift', '08:00', 7.9],
          ['Wahyu Nugroho', 'Field Tech', 'Prigen — South', 'On break', '09:15', 6.1],
          ['Citra Lestari', 'Gate Officer', 'Bali — Coastal', 'Off', '—', 0],
        ],
      };
  }
}

// Quote every field so commas/quotes inside values can't break the columns.
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

/** Build a populated report CSV (header block + data table) and download it. */
function downloadReport(title: string, opts: { category?: Category; scope?: string; generatedAt?: string }) {
  const { headers, rows } = reportData(reportKind(title, opts.category));
  const meta = toCsv(
    ['Field', 'Value'],
    [
      ['Report', title],
      ['Generated', opts.generatedAt ?? new Date().toISOString()],
      ...(opts.scope ? [['Scope', opts.scope] as (string | number)[]] : []),
      ['Source', 'Taman Safari Annual Pass · admin console'],
    ],
  );
  const csv = `${meta}\r\n\r\n${toCsv(headers, rows)}`;
  downloadCsv(`${slug(title)}.csv`, csv);
}

async function fetchScheduledReports(): Promise<OpsReport[]> {
  const json = (await api.http.get('admin/reports').json()) as { reports: OpsReport[] };
  return json.reports;
}

const quickReports: QuickReport[] = [
  { id: 'q-1', title: 'Today gate operations', description: 'Per-gate scans, allow/deny/manual breakdown, latency p95', scope: 'Last 24h', estimatedMin: 1, category: 'operational' },
  { id: 'q-2', title: 'Weekly membership cohort', description: 'Activation rate, churn, renewal funnel by tier', scope: 'Last 7 days', estimatedMin: 2, category: 'operational' },
  { id: 'q-3', title: 'Finance close — month-to-date', description: 'Revenue by channel, refunds, payouts, pending reconciliation', scope: 'Current month', estimatedMin: 3, category: 'finance' },
  { id: 'q-4', title: 'Campaign ROI', description: 'Sent / opened / clicked / converted per campaign with revenue attributed', scope: 'Last 30 days', estimatedMin: 2, category: 'marketing' },
  { id: 'q-5', title: 'Compliance digest', description: 'Expiring permits/licences with owner + next action', scope: '90-day horizon', estimatedMin: 1, category: 'compliance' },
  { id: 'q-6', title: 'GlobalTix reconciliation export', description: 'WIT ledger vs GlobalTix delta, severity-ordered', scope: 'Current week', estimatedMin: 1, category: 'operational' },
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

const categoryAccent: Record<Category, string> = {
  operational: 'bg-brand-100 text-brand-800',
  finance: 'bg-earth-100 text-earth-800',
  marketing: 'bg-rose-100 text-rose-800',
  compliance: 'bg-slate-100 text-slate-700',
};

export function AdminReportsRoute() {
  const { t, i18n } = useTranslation();
  const { data: scheduled, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: fetchScheduledReports,
  });
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const catLabel = (c: Category) => t(`admin.reports.categories.${c}`);

  function generate(q: QuickReport) {
    downloadReport(q.title, { category: q.category, scope: q.scope });
    setGeneratedId(q.id);
    window.setTimeout(() => setGeneratedId((v) => (v === q.id ? null : v)), 2200);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.reports.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.reports.subtitle')}</p>
      </header>

      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled" icon={<Clock className="h-3.5 w-3.5" />} count={scheduled?.length}>
            {t('admin.reports.tabs.scheduled')}
          </TabsTrigger>
          <TabsTrigger value="quick" icon={<Zap className="h-3.5 w-3.5" />} count={quickReports.length}>
            {t('admin.reports.tabs.quick')}
          </TabsTrigger>
          <TabsTrigger value="archive" icon={<Archive className="h-3.5 w-3.5" />} count={archive.length}>
            {t('admin.reports.tabs.archive')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled">
          {isError ? (
            <ErrorState
              title={t('admin.common.errorTitle')}
              description={t('admin.common.errorHint')}
              retryLabel={t('admin.common.retry')}
              onRetry={() => void refetch()}
            />
          ) : isLoading || !scheduled ? (
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
                        <Badge variant={statusVariant[r.status]}>
                          {t(`admin.reports.status.${statusKey[r.status]}`)}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-muted/40 p-2.5">
                          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {t('admin.reports.lastRun')}
                          </p>
                          <p className="mt-1 font-medium">{formatter.format(new Date(r.lastRun))}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-2.5">
                          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {t('admin.reports.nextRun')}
                          </p>
                          <p className="mt-1 font-medium">{formatter.format(new Date(r.nextRun))}</p>
                        </div>
                      </div>
                      <p className="mt-3 truncate text-[11px] text-muted-foreground">
                        {t('admin.reports.recipients')}: {r.recipients.join(', ')}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => downloadReport(r.title, { generatedAt: r.lastRun })}
                        >
                          <Download className="h-3 w-3" />
                          {t('admin.reports.latest')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          disabled
                          title={t('admin.reports.demoBuild') as string}
                        >
                          {t('admin.reports.configure')}
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
            {quickReports.map((q, i) => {
              const done = generatedId === q.id;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${categoryAccent[q.category]}`}>
                          {catLabel(q.category)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {t('admin.reports.minutes', { n: q.estimatedMin })}
                        </span>
                      </div>
                      <div className="min-h-[64px]">
                        <p className="text-base font-semibold leading-tight">{q.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{q.description}</p>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground">{q.scope}</p>
                      <Button
                        size="sm"
                        className="mt-auto w-full"
                        variant={done ? 'outline' : 'default'}
                        onClick={() => generate(q)}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        {done ? t('admin.reports.generated') : t('admin.reports.generate')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="archive">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">{t('admin.reports.cols.report')}</th>
                    <th className="px-6 py-3 font-medium">{t('admin.reports.cols.category')}</th>
                    <th className="px-6 py-3 font-medium">{t('admin.reports.cols.format')}</th>
                    <th className="px-6 py-3 text-right font-medium">{t('admin.reports.cols.size')}</th>
                    <th className="px-6 py-3 font-medium">{t('admin.reports.cols.generated')}</th>
                    <th className="px-6 py-3 text-right font-medium">{t('admin.reports.cols.action')}</th>
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
                          {catLabel(a.category)}
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
                          onClick={() => downloadReport(a.title, { category: a.category, generatedAt: a.generatedAt })}
                        >
                          <Download className="h-3 w-3" />
                          {t('admin.reports.download')}
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
