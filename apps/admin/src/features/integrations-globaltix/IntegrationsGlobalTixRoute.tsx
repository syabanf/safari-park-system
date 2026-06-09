import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  Database,
  GitBranch,
  KeyRound,
  Repeat,
  RotateCw,
  Server,
  ShieldCheck,
  Sparkles,
  Webhook,
  Workflow,
  XCircle,
} from 'lucide-react';
import { BusinessFlow, type FlowStage } from '@/components/integrations/BusinessFlow';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SyncDay {
  date: string;
  attempted: number;
  confirmed: number;
  failed: number;
  avgLatencyMs: number;
}
interface ReconRow {
  id: string;
  redemptionId: string;
  passId: string;
  gateId: string;
  witAt: string;
  gtConfirmedAt: string | null;
  ageMinutes: number;
  attempts: number;
  stage: string;
  lastError: string;
  severity: 'high' | 'medium' | 'low';
}
interface WebhookRow {
  id: string;
  eventType: string;
  receivedAt: string;
  signatureOk: boolean;
  referenceNumber: string;
}
interface MappingRow {
  witField: string;
  gtField: string;
  note: string;
}
interface ProductRow {
  gtProductId: number;
  gtTicketTypeId: number;
  name: string;
  validity: string;
  allocatedLast24h: number;
  nettPrice: string;
}
interface Gap {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  impact: string;
  workaround: string;
  phaseTwoArgument: string;
}

interface GlobalTixData {
  vendor: 'globaltix';
  displayName: string;
  subtitle: string;
  status: 'connected' | 'disconnected' | 'error';
  environment: 'staging' | 'production';
  health: 'healthy' | 'degraded' | 'down';
  baseUrl: string;
  productionBaseUrl: string;
  authMethod: string;
  tokenExpiresAt: string;
  lastTokenRefresh: string;
  integrationModel: string;
  summary: {
    todayRedemptions: number;
    todayGtConfirmed: number;
    todayGtPending: number;
    todayGtFailed: number;
    sevenDayRedemptions: number;
    sevenDayReconciliationPct: number;
    avgRoundTripMs: number;
    webhooksReceived24h: number;
    webhookSignatureFailures24h: number;
  };
  pipeline: { description: string; stages: FlowStage[] };
  syncHistory: SyncDay[];
  reconciliationDrift: ReconRow[];
  recentWebhooks: WebhookRow[];
  fieldMapping: MappingRow[];
  products: ProductRow[];
  gaps: Gap[];
  config: {
    webhookEndpoint: string;
    retryStrategy: string;
    circuitBreaker: string;
    lastConfigChange: string;
    configChangedBy: string;
  };
}

async function fetchData(): Promise<GlobalTixData> {
  return (await api.http.get('admin/integrations/globaltix').json()) as GlobalTixData;
}

const severityTone: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-rose-100 text-rose-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-muted text-muted-foreground',
};

const num = new Intl.NumberFormat('id-ID');

export function IntegrationsGlobalTixRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'integrations', 'globaltix'],
    queryFn: fetchData,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const fmtDateTime = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const fmtTime = new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' });

  const confirmedPct = data.summary.todayRedemptions
    ? Math.round((data.summary.todayGtConfirmed / data.summary.todayRedemptions) * 1000) / 10
    : 0;

  return (
    <div className="space-y-5 lg:space-y-6">
      <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-base font-bold text-white shadow-md">
            GT
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight lg:text-2xl">{data.displayName}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{data.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${
              data.health === 'healthy'
                ? 'bg-brand-100 text-brand-800'
                : data.health === 'degraded'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                data.health === 'healthy'
                  ? 'bg-brand-600'
                  : data.health === 'degraded'
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
              } animate-pulse`}
            />
            {data.health}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-foreground">
            <Server className="h-3 w-3" />
            {data.environment}
          </span>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <RotateCw className="h-3.5 w-3.5" />
            Test connection
          </Button>
        </div>
      </header>

      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-800">Integration model</p>
        <p className="mt-1 text-sm text-foreground">{data.integrationModel}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={<Activity className="h-4 w-4" />}
          label="Today · redemptions"
          primary={num.format(data.summary.todayRedemptions)}
          hint={`${num.format(data.summary.todayGtConfirmed)} GT-confirmed`}
        />
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Reconciliation · 7d"
          primary={`${data.summary.sevenDayReconciliationPct}%`}
          hint={`${num.format(data.summary.sevenDayRedemptions)} redemptions`}
          tone={data.summary.sevenDayReconciliationPct >= 99.5 ? 'ok' : 'warn'}
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="Avg round-trip"
          primary={`${data.summary.avgRoundTripMs}ms`}
          hint="WIT → GT booking confirm"
        />
        <StatTile
          icon={<Webhook className="h-4 w-4" />}
          label="Webhooks · 24h"
          primary={num.format(data.summary.webhooksReceived24h)}
          hint={`${data.summary.webhookSignatureFailures24h} signature failures`}
          tone={data.summary.webhookSignatureFailures24h === 0 ? 'ok' : 'warn'}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" icon={<Sparkles className="h-3.5 w-3.5" />}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="pipeline" icon={<Workflow className="h-3.5 w-3.5" />} count={data.pipeline.stages.length}>
            Business flow
          </TabsTrigger>
          <TabsTrigger value="sync" icon={<Repeat className="h-3.5 w-3.5" />} count={data.syncHistory.length}>
            Sync history
          </TabsTrigger>
          <TabsTrigger
            value="drift"
            icon={<ArrowLeftRight className="h-3.5 w-3.5" />}
            count={data.reconciliationDrift.length}
          >
            Drift
          </TabsTrigger>
          <TabsTrigger value="webhooks" icon={<Webhook className="h-3.5 w-3.5" />} count={data.recentWebhooks.length}>
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="mapping" icon={<GitBranch className="h-3.5 w-3.5" />} count={data.fieldMapping.length}>
            Field mapping
          </TabsTrigger>
          <TabsTrigger value="products" icon={<Database className="h-3.5 w-3.5" />} count={data.products.length}>
            Products
          </TabsTrigger>
          <TabsTrigger value="gaps" icon={<AlertTriangle className="h-3.5 w-3.5" />} count={data.gaps.length}>
            Gap register
          </TabsTrigger>
          <TabsTrigger value="config" icon={<KeyRound className="h-3.5 w-3.5" />}>
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <BusinessFlow description={data.pipeline.description} stages={data.pipeline.stages} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Today's funnel</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Every WIT redemption mirrors a GT booking + immediate redeem
                </p>
                <div className="mt-4 space-y-3">
                  <FunnelStep
                    label="WIT redemptions"
                    value={data.summary.todayRedemptions}
                    pct={100}
                    tone="brand"
                  />
                  <FunnelStep
                    label="GT confirmed"
                    value={data.summary.todayGtConfirmed}
                    pct={confirmedPct}
                    tone="brand"
                  />
                  <FunnelStep
                    label="Pending"
                    value={data.summary.todayGtPending}
                    pct={(data.summary.todayGtPending / data.summary.todayRedemptions) * 100}
                    tone="warn"
                  />
                  <FunnelStep
                    label="Failed"
                    value={data.summary.todayGtFailed}
                    pct={(data.summary.todayGtFailed / data.summary.todayRedemptions) * 100}
                    tone="rose"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Sync latency · 12 days</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Avg round-trip per day</p>
                <ResponsiveContainer width="100%" height={200} className="mt-3">
                  <LineChart data={data.syncHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="avgLatencyMs" stroke="#287338" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <BusinessFlow description={data.pipeline.description} stages={data.pipeline.stages} />
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold">Daily sync attempts</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Attempted vs confirmed across the last 12 days</p>
              <ResponsiveContainer width="100%" height={260} className="mt-3">
                <BarChart data={data.syncHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="confirmed" stackId="a" fill="#287338" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="failed" stackId="a" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Attempted</th>
                    <th className="px-6 py-3 font-medium">Confirmed</th>
                    <th className="px-6 py-3 font-medium">Failed</th>
                    <th className="px-6 py-3 font-medium">Avg latency</th>
                    <th className="px-6 py-3 font-medium">Success rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.syncHistory.slice().reverse().map((d, i) => {
                    const rate = d.attempted ? ((d.confirmed / d.attempted) * 100).toFixed(2) : '—';
                    return (
                      <Row key={d.date} index={i}>
                        <td className="px-6 py-3 font-mono text-xs">{d.date}</td>
                        <td className="px-6 py-3 font-mono">{num.format(d.attempted)}</td>
                        <td className="px-6 py-3 font-mono text-brand-700">{num.format(d.confirmed)}</td>
                        <td className={`px-6 py-3 font-mono ${d.failed > 0 ? 'text-rose-700' : 'text-muted-foreground'}`}>
                          {num.format(d.failed)}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{d.avgLatencyMs}ms</td>
                        <td className="px-6 py-3 font-mono text-xs">{rate}%</td>
                      </Row>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drift">
          <div className="mb-4">
            <BusinessFlow
              description="Stages where the drift rows below are currently stuck"
              stages={data.pipeline.stages}
            />
          </div>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Redemption</th>
                    <th className="px-6 py-3 font-medium">Stage</th>
                    <th className="px-6 py-3 font-medium">Pass</th>
                    <th className="px-6 py-3 font-medium">Gate</th>
                    <th className="px-6 py-3 font-medium">WIT at</th>
                    <th className="px-6 py-3 font-medium">Age</th>
                    <th className="px-6 py-3 font-medium">Attempts</th>
                    <th className="px-6 py-3 font-medium">Last error</th>
                    <th className="px-6 py-3 font-medium">Severity</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.reconciliationDrift.map((r, i) => {
                    const stage = data.pipeline.stages.find((s) => s.key === r.stage);
                    const stageIndex = data.pipeline.stages.findIndex((s) => s.key === r.stage);
                    return (
                      <Row key={r.id} index={i}>
                        <td className="px-6 py-3 font-mono text-xs">{r.redemptionId}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-800">
                              {stageIndex + 1}
                            </span>
                            <span className="whitespace-nowrap text-xs font-medium">{stage?.label ?? r.stage}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono text-xs">{r.passId}</td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{r.gateId}</td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmtDateTime.format(new Date(r.witAt))}</td>
                        <td className="px-6 py-3 font-mono text-xs">{r.ageMinutes}m</td>
                        <td className="px-6 py-3 font-mono">{r.attempts}</td>
                        <td className="px-6 py-3 text-xs text-rose-700">{r.lastError}</td>
                        <td className="px-6 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${severityTone[r.severity]}`}>
                            {r.severity}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button size="sm" variant="outline" className="h-8 gap-1.5">
                            <RotateCw className="h-3 w-3" />
                            Retry
                          </Button>
                        </td>
                      </Row>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Webhook</th>
                    <th className="px-6 py-3 font-medium">Event</th>
                    <th className="px-6 py-3 font-medium">Reference</th>
                    <th className="px-6 py-3 font-medium">Received</th>
                    <th className="px-6 py-3 font-medium">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentWebhooks.map((w, i) => (
                    <Row key={w.id} index={i}>
                      <td className="px-6 py-3 font-mono text-xs">{w.id}</td>
                      <td className="px-6 py-3">
                        <Badge variant="secondary" className="text-[10px]">{w.eventType}</Badge>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">{w.referenceNumber}</td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmtTime.format(new Date(w.receivedAt))}</td>
                      <td className="px-6 py-3">
                        {w.signatureOk ? (
                          <span className="inline-flex items-center gap-1 text-xs text-brand-700">
                            <ShieldCheck className="h-3 w-3" />
                            valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-700">
                            <XCircle className="h-3 w-3" />
                            failed
                          </span>
                        )}
                      </td>
                    </Row>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">WIT field</th>
                    <th className="px-6 py-3 font-medium">GlobalTix field</th>
                    <th className="px-6 py-3 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fieldMapping.map((m, i) => (
                    <Row key={m.witField} index={i}>
                      <td className="px-6 py-3 font-mono text-xs">{m.witField}</td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{m.gtField}</td>
                      <td className="px-6 py-3 text-xs">{m.note}</td>
                    </Row>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">GT Product ID</th>
                    <th className="px-6 py-3 font-medium">GT TicketType ID</th>
                    <th className="px-6 py-3 font-medium">Validity</th>
                    <th className="px-6 py-3 font-medium">Allocated · 24h</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p, i) => (
                    <Row key={p.gtTicketTypeId} index={i}>
                      <td className="px-6 py-3 font-medium">{p.name}</td>
                      <td className="px-6 py-3 font-mono text-xs">{p.gtProductId}</td>
                      <td className="px-6 py-3 font-mono text-xs">{p.gtTicketTypeId}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{p.validity}</td>
                      <td className="px-6 py-3 font-mono">{num.format(p.allocatedLast24h)}</td>
                    </Row>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.gaps.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.32) }}
              >
                <Card className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-tight">{g.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${severityTone[g.severity]}`}>
                        {g.severity}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Impact on AP</p>
                        <p className="mt-0.5 text-foreground">{g.impact}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Workaround</p>
                        <p className="mt-0.5 text-foreground">{g.workaround}</p>
                      </div>
                      <div className="rounded-lg bg-brand-50/60 p-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-800">Phase-2 argument</p>
                        <p className="mt-0.5 text-foreground">{g.phaseTwoArgument}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardContent className="space-y-4 p-5">
              <ConfigRow label="Base URL · staging" value={data.baseUrl} mono />
              <ConfigRow label="Base URL · production" value={data.productionBaseUrl} mono />
              <ConfigRow label="Auth method" value={data.authMethod} />
              <ConfigRow label="Token expires at" value={fmtDateTime.format(new Date(data.tokenExpiresAt))} />
              <ConfigRow label="Last token refresh" value={fmtDateTime.format(new Date(data.lastTokenRefresh))} />
              <ConfigRow label="Webhook endpoint" value={data.config.webhookEndpoint} mono />
              <ConfigRow label="Retry strategy" value={data.config.retryStrategy} />
              <ConfigRow label="Circuit breaker" value={data.config.circuitBreaker} />
              <ConfigRow label="Last config change" value={`${fmtDateTime.format(new Date(data.config.lastConfigChange))} · ${data.config.configChangedBy}`} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatTile({
  icon,
  label,
  primary,
  hint,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  hint: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  const tones = {
    default: 'bg-brand-50 text-brand-700',
    ok: 'bg-brand-100 text-brand-800',
    warn: 'bg-amber-100 text-amber-800',
  } as const;
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-3.5 lg:p-4">
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg lg:h-9 lg:w-9 ${tones[tone]}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-lg font-bold tracking-tight">{primary}</p>
          <p className="truncate text-[10px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelStep({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: 'brand' | 'warn' | 'rose';
}) {
  const bar = {
    brand: 'bg-brand-500',
    warn: 'bg-amber-500',
    rose: 'bg-rose-500',
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-mono">
          {num.format(value)} · {pct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bar}`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
    </div>
  );
}

function ConfigRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:w-48">{label}</p>
      <p className={`text-sm ${mono ? 'font-mono text-xs' : ''} text-foreground sm:flex-1 sm:text-right`}>{value}</p>
    </div>
  );
}

function Row({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.4) }}
      className="border-b last:border-0 hover:bg-muted/30"
    >
      {children}
    </motion.tr>
  );
}
