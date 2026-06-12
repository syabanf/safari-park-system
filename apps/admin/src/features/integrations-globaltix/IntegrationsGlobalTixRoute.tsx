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
  CheckCircle2,
  Clock,
  Database,
  Flag,
  GitBranch,
  Heart,
  Lock,
  Repeat,
  RotateCw,
  Server,
  ShieldCheck,
  Sparkles,
  Webhook,
  Workflow,
  Wrench,
  XCircle,
} from 'lucide-react';
import {
  BusinessFlowSelector,
  type BusinessFlowDef,
} from '@/components/integrations/BusinessFlowSelector';
import { BlackboxPanel, type BlackboxData } from '@/components/integrations/BlackboxPanel';
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
  pipelines: BusinessFlowDef[];
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
  blackbox: BlackboxData;
}

async function fetchData(): Promise<GlobalTixData> {
  return (await api.http.get('admin/integrations/globaltix').json()) as GlobalTixData;
}

const severityTone: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-rose-100 text-rose-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-muted text-muted-foreground',
};
const priorityLabel: Record<'high' | 'medium' | 'low', string> = {
  high: 'Urgent',
  medium: 'Soon',
  low: 'Low',
};
const healthLabel: Record<'healthy' | 'degraded' | 'down', string> = {
  healthy: 'Working smoothly',
  degraded: 'Needs attention',
  down: 'Connection down',
};

const num = new Intl.NumberFormat('id-ID');

/** ms → a plain "0.3s" a non-engineer can read. */
function seconds(ms: number): string {
  return `${(ms / 1_000).toFixed(1)}s`;
}
/** minutes → "2h 18m". */
function waited(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const SHARE_CARDS = [
  {
    icon: Server,
    tone: 'bg-blue-100 text-blue-800',
    title: 'Shared with GlobalTix',
    body: 'Only what is needed to record a visit or a sale: a reference number, the time, and the ticket type. No names, no contact details.',
  },
  {
    icon: Lock,
    tone: 'bg-brand-100 text-brand-800',
    title: 'Kept private with us',
    body: 'Member identities, contact details, and the rotating QR codes that stop passes being shared never leave our platform.',
  },
  {
    icon: ShieldCheck,
    tone: 'bg-earth-100 text-earth-800',
    title: 'Why it works this way',
    body: 'GlobalTix is a sales and ticketing channel, not the home of our members. Keeping identity with us protects privacy and makes a future switch painless.',
  },
];

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
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Our ticketing partner — keeps sales and visits in step with our platform
            </p>
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
            {healthLabel[data.health]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-foreground">
            <Server className="h-3 w-3" />
            {data.environment === 'production' ? 'Live' : 'Test environment'}
          </span>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <RotateCw className="h-3.5 w-3.5" />
            Test connection
          </Button>
        </div>
      </header>

      {/* Plain-language explainer — what this connection is for */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-800">
          What this connection does
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          Every time a guest enters the park or buys a ticket, we record it with GlobalTix too — so
          both systems always agree on visits and sales. The tabs below show those business processes
          in plain language. Anything an engineer needs — raw traffic, connection settings — lives
          under <span className="font-semibold">Technical</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={<Activity className="h-4 w-4" />}
          label="Visits today"
          primary={num.format(data.summary.todayRedemptions)}
          hint={`${num.format(data.summary.todayGtConfirmed)} recorded with GlobalTix`}
        />
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Systems in agreement · 7d"
          primary={`${data.summary.sevenDayReconciliationPct}%`}
          hint={`across ${num.format(data.summary.sevenDayRedemptions)} visits`}
          tone={data.summary.sevenDayReconciliationPct >= 99.5 ? 'ok' : 'warn'}
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="Typical sync speed"
          primary={seconds(data.summary.avgRoundTripMs)}
          hint="to record one visit"
        />
        <StatTile
          icon={<Webhook className="h-4 w-4" />}
          label="Updates from GlobalTix · 24h"
          primary={num.format(data.summary.webhooksReceived24h)}
          hint={
            data.summary.webhookSignatureFailures24h === 0
              ? 'all verified genuine'
              : `${data.summary.webhookSignatureFailures24h} rejected`
          }
          tone={data.summary.webhookSignatureFailures24h === 0 ? 'ok' : 'warn'}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" icon={<Sparkles className="h-3.5 w-3.5" />}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="pipeline" icon={<Workflow className="h-3.5 w-3.5" />} count={data.pipelines.length}>
            Processes
          </TabsTrigger>
          <TabsTrigger
            value="drift"
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            count={data.reconciliationDrift.length}
          >
            Needs attention
          </TabsTrigger>
          <TabsTrigger value="sync" icon={<Repeat className="h-3.5 w-3.5" />} count={data.syncHistory.length}>
            Daily activity
          </TabsTrigger>
          <TabsTrigger value="share" icon={<Lock className="h-3.5 w-3.5" />}>
            What we share
          </TabsTrigger>
          <TabsTrigger value="gaps" icon={<Flag className="h-3.5 w-3.5" />} count={data.gaps.length}>
            Gaps &amp; roadmap
          </TabsTrigger>
          <TabsTrigger value="technical" icon={<Wrench className="h-3.5 w-3.5" />}>
            Technical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <BusinessFlowSelector flows={data.pipelines} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm font-semibold">Today's visits, step by step</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Every visit that enters the park is recorded with GlobalTix
                  </p>
                  <div className="mt-4 space-y-3">
                    <FunnelStep
                      label="Entered the park"
                      value={data.summary.todayRedemptions}
                      pct={100}
                      tone="brand"
                    />
                    <FunnelStep
                      label="Recorded with GlobalTix"
                      value={data.summary.todayGtConfirmed}
                      pct={confirmedPct}
                      tone="brand"
                    />
                    <FunnelStep
                      label="Still syncing"
                      value={data.summary.todayGtPending}
                      pct={(data.summary.todayGtPending / data.summary.todayRedemptions) * 100}
                      tone="warn"
                    />
                    <FunnelStep
                      label="Needs attention"
                      value={data.summary.todayGtFailed}
                      pct={(data.summary.todayGtFailed / data.summary.todayRedemptions) * 100}
                      tone="rose"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm font-semibold">Recording speed · last 12 days</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Average time to record a visit — lower is faster
                  </p>
                  <ResponsiveContainer width="100%" height={200} className="mt-3">
                    <LineChart data={data.syncHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`} />
                      <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${(v / 1000).toFixed(2)}s`, 'avg']} />
                      <Line type="monotone" dataKey="avgLatencyMs" stroke="#287338" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <BusinessFlowSelector flows={data.pipelines} />
        </TabsContent>

        <TabsContent value="drift">
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
            These visits were let into the park but haven't been confirmed by GlobalTix yet. Our gates
            already approved each guest — this only affects the record kept with our partner. Most clear
            on their own; retry the rest.
          </div>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Visit</th>
                    <th className="px-6 py-3 font-medium">Gate</th>
                    <th className="px-6 py-3 font-medium">Waited</th>
                    <th className="px-6 py-3 font-medium">Stuck at</th>
                    <th className="px-6 py-3 font-medium">Priority</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const apFlow = data.pipelines.find((p) => p.key === 'ap-redemption');
                    return data.reconciliationDrift.map((r, i) => {
                      const stage = apFlow?.stages.find((s) => s.key === r.stage);
                      const stageIndex = apFlow?.stages.findIndex((s) => s.key === r.stage) ?? -1;
                      return (
                        <Row key={r.id} index={i}>
                          <td className="px-6 py-3 font-mono text-xs">{r.redemptionId}</td>
                          <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{r.gateId}</td>
                          <td className="px-6 py-3 text-xs font-semibold">{waited(r.ageMinutes)}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
                                {stageIndex + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="whitespace-nowrap text-xs font-medium">{stage?.label ?? r.stage}</p>
                                <p className="truncate font-mono text-[10px] text-muted-foreground/70">{r.lastError}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${severityTone[r.severity]}`}>
                              {priorityLabel[r.severity]}
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
                    });
                  })()}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold">Visits recorded each day</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                How many visits synced to GlobalTix, and how many needed a retry — last 12 days
              </p>
              <ResponsiveContainer width="100%" height={260} className="mt-3">
                <BarChart data={data.syncHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="confirmed" name="Recorded" stackId="a" fill="#287338" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="failed" name="Needed retry" stackId="a" fill="#dc2626" radius={[8, 8, 0, 0]} />
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
                    <th className="px-6 py-3 font-medium">Visits</th>
                    <th className="px-6 py-3 font-medium">Recorded</th>
                    <th className="px-6 py-3 font-medium">Needed retry</th>
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
                        <td className="px-6 py-3 font-mono text-xs">{rate}%</td>
                      </Row>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {SHARE_CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.3) }}
                >
                  <Card className="h-full">
                    <CardContent className="p-5">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl ${c.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold">{c.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            The exact field-by-field mapping is available under <span className="font-medium text-foreground">Technical → Field mapping</span>.
          </p>
        </TabsContent>

        <TabsContent value="gaps">
          <p className="mb-3 text-xs text-muted-foreground">
            Where GlobalTix can't do what an Annual Pass needs today — and how we work around it now,
            plus the argument for bringing it in-house in Phase 2.
          </p>
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
                        {priorityLabel[g.severity]}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">What it means for the pass</p>
                        <p className="mt-0.5 text-foreground">{g.impact}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">How we handle it now</p>
                        <p className="mt-0.5 text-foreground">{g.workaround}</p>
                      </div>
                      <div className="rounded-lg bg-brand-50/60 p-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-800">The case for Phase 2</p>
                        <p className="mt-0.5 text-foreground">{g.phaseTwoArgument}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">For engineers.</span> Connection settings,
              raw API traffic, and field-level mappings. Day-to-day operations don't need this tab.
            </div>

            <TechSection icon={<Server className="h-4 w-4" />} title="Connection">
              <ConfigRow label="How this connection works" value={data.integrationModel} />
              <ConfigRow label="Base URL · staging" value={data.baseUrl} mono />
              <ConfigRow label="Base URL · production" value={data.productionBaseUrl} mono />
              <ConfigRow label="Auth method" value={data.authMethod} />
              <ConfigRow label="Token expires at" value={fmtDateTime.format(new Date(data.tokenExpiresAt))} />
              <ConfigRow label="Last token refresh" value={fmtDateTime.format(new Date(data.lastTokenRefresh))} />
              <ConfigRow label="Webhook endpoint" value={data.config.webhookEndpoint} mono />
              <ConfigRow label="Retry strategy" value={data.config.retryStrategy} />
              <ConfigRow label="Circuit breaker" value={data.config.circuitBreaker} />
              <ConfigRow label="Last config change" value={`${fmtDateTime.format(new Date(data.config.lastConfigChange))} · ${data.config.configChangedBy}`} />
            </TechSection>

            <TechSection icon={<Database className="h-4 w-4" />} title="Products at GlobalTix" count={data.products.length}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Product</th>
                      <th className="px-4 py-2.5 font-medium">GT Product ID</th>
                      <th className="px-4 py-2.5 font-medium">GT TicketType ID</th>
                      <th className="px-4 py-2.5 font-medium">Validity</th>
                      <th className="px-4 py-2.5 font-medium">Allocated · 24h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p, i) => (
                      <Row key={p.gtTicketTypeId} index={i}>
                        <td className="px-4 py-2.5 font-medium">{p.name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{p.gtProductId}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{p.gtTicketTypeId}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.validity}</td>
                        <td className="px-4 py-2.5 font-mono">{num.format(p.allocatedLast24h)}</td>
                      </Row>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechSection>

            <TechSection icon={<GitBranch className="h-4 w-4" />} title="Field mapping" count={data.fieldMapping.length}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Our field</th>
                      <th className="px-4 py-2.5 font-medium">GlobalTix field</th>
                      <th className="px-4 py-2.5 font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fieldMapping.map((m, i) => (
                      <Row key={m.witField} index={i}>
                        <td className="px-4 py-2.5 font-mono text-xs">{m.witField}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{m.gtField}</td>
                        <td className="px-4 py-2.5 text-xs">{m.note}</td>
                      </Row>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechSection>

            <TechSection icon={<Webhook className="h-4 w-4" />} title="Updates received (webhooks)" count={data.recentWebhooks.length}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Webhook</th>
                      <th className="px-4 py-2.5 font-medium">Event</th>
                      <th className="px-4 py-2.5 font-medium">Reference</th>
                      <th className="px-4 py-2.5 font-medium">Received</th>
                      <th className="px-4 py-2.5 font-medium">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentWebhooks.map((w, i) => (
                      <Row key={w.id} index={i}>
                        <td className="px-4 py-2.5 font-mono text-xs">{w.id}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="secondary" className="text-[10px]">{w.eventType}</Badge>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs">{w.referenceNumber}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{fmtTime.format(new Date(w.receivedAt))}</td>
                        <td className="px-4 py-2.5">
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
              </div>
            </TechSection>

            <TechSection icon={<Heart className="h-4 w-4" />} title="Live connection monitor">
              <BlackboxPanel data={data.blackbox} />
            </TechSection>
          </div>
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

function TechSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </span>
          <p className="text-sm font-semibold">{title}</p>
          {count !== undefined ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {count}
            </span>
          ) : null}
        </div>
        {children}
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
