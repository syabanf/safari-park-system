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
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  ListChecks,
  MapPin,
  Plug,
  Server,
  Sparkles,
  Store,
  Ticket,
  Utensils,
  Workflow,
  Wrench,
} from 'lucide-react';
import {
  BusinessFlowSelector,
  type BusinessFlowDef,
} from '@/components/integrations/BusinessFlowSelector';
import { BlackboxPanel, type BlackboxData } from '@/components/integrations/BlackboxPanel';

interface ProductRow {
  id: string;
  name: string;
  purpose: string;
  status: 'target' | 'not-applicable' | 'maybe-phase-2';
  note: string;
}
interface PerkMapping {
  perkId: string;
  title: string;
  mapping: string;
  voucherType: string;
  status: 'mapped' | 'n/a' | 'pending';
}
interface Outlet {
  id: string;
  name: string;
  location: string;
  status: 'pending' | 'live' | 'paused';
}
interface OpenQuestion {
  id: string;
  severity: 'high' | 'medium' | 'low';
  question: string;
  owner: string;
  status: 'pending' | 'answered';
}
interface Voucher {
  id: string;
  perkId: string;
  memberId: string;
  outletId: string;
  issuedAt: string;
  redeemedAt: string | null;
  state: 'issued' | 'redeemed' | 'expired';
  value: string;
}
interface NextStep {
  id: string;
  label: string;
  owner: string;
  eta: string;
}

interface EsbData {
  vendor: 'esb';
  displayName: string;
  subtitle: string;
  status: 'connected' | 'provisional' | 'disconnected';
  environment: 'unset' | 'staging' | 'production';
  health: 'healthy' | 'degraded' | 'down' | 'unknown';
  baseUrl: string;
  authMethod: string;
  integrationModel: string;
  summary: {
    perksDefined: number;
    vouchersIssuedThisMonth: number;
    vouchersRedeemedThisMonth: number;
    redemptionRatePct: number;
    outletsConfigured: number;
    outletsExpected: number;
  };
  pipelines: BusinessFlowDef[];
  products: ProductRow[];
  perkMapping: PerkMapping[];
  outlets: Outlet[];
  openQuestions: OpenQuestion[];
  recentVoucherActivity: Voucher[];
  nextSteps: NextStep[];
  blackbox: BlackboxData;
}

async function fetchData(): Promise<EsbData> {
  return (await api.http.get('admin/integrations/esb').json()) as EsbData;
}

const productStatusTone: Record<ProductRow['status'], string> = {
  target: 'bg-brand-100 text-brand-800',
  'maybe-phase-2': 'bg-amber-100 text-amber-800',
  'not-applicable': 'bg-muted text-muted-foreground',
};

const mappingStatusTone: Record<PerkMapping['status'], string> = {
  mapped: 'bg-brand-100 text-brand-800',
  'n/a': 'bg-muted text-muted-foreground',
  pending: 'bg-amber-100 text-amber-800',
};

const mappingStatusLabel: Record<PerkMapping['status'], string> = {
  mapped: 'Ready',
  'n/a': 'Not F&B',
  pending: 'Pending',
};

const outletStatusTone: Record<Outlet['status'], string> = {
  live: 'bg-brand-100 text-brand-800',
  pending: 'bg-amber-100 text-amber-800',
  paused: 'bg-rose-100 text-rose-800',
};

const voucherStateTone: Record<Voucher['state'], string> = {
  redeemed: 'bg-brand-100 text-brand-800',
  issued: 'bg-blue-100 text-blue-800',
  expired: 'bg-rose-100 text-rose-800',
};

const severityTone: Record<OpenQuestion['severity'], string> = {
  high: 'bg-rose-100 text-rose-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-muted text-muted-foreground',
};
const priorityLabel: Record<OpenQuestion['severity'], string> = {
  high: 'Blocker',
  medium: 'Soon',
  low: 'Low',
};

const num = new Intl.NumberFormat('id-ID');

export function IntegrationsEsbRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'integrations', 'esb'],
    queryFn: fetchData,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const fmtDate = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const fmtTime = new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' });

  return (
    <div className="space-y-5 lg:space-y-6">
      <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-earth-700 to-earth-800 text-base font-bold text-white shadow-md">
            ESB
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight lg:text-2xl">{data.displayName}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Restaurant &amp; café tills — turns member perks into real discounts at the counter
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
            Not connected yet
          </span>
        </div>
      </header>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800">
            <Plug className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">Not connected yet — waiting on access from ESB</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
              Food &amp; drink perks arrive in a later phase. We've already mapped out exactly how it will
              work, so the moment ESB grants access the member perks switch on with no surprises. The
              numbers below are projections of what to expect.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={<Sparkles className="h-4 w-4" />}
          label="Member perks"
          primary={String(data.summary.perksDefined)}
          hint="3 apply at F&B counters"
        />
        <StatTile
          icon={<Ticket className="h-4 w-4" />}
          label="Vouchers · 30d"
          primary={num.format(data.summary.vouchersIssuedThisMonth)}
          hint={`${num.format(data.summary.vouchersRedeemedThisMonth)} used`}
        />
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Members who used them"
          primary={`${data.summary.redemptionRatePct}%`}
          hint="of vouchers issued"
          tone="ok"
        />
        <StatTile
          icon={<Store className="h-4 w-4" />}
          label="Outlets ready"
          primary={`${data.summary.outletsConfigured}/${data.summary.outletsExpected}`}
          hint="set up so far"
          tone="warn"
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
          <TabsTrigger value="mapping" icon={<Utensils className="h-3.5 w-3.5" />} count={data.perkMapping.length}>
            Perks at the counter
          </TabsTrigger>
          <TabsTrigger value="outlets" icon={<Store className="h-3.5 w-3.5" />} count={data.outlets.length}>
            Outlets
          </TabsTrigger>
          <TabsTrigger value="vouchers" icon={<Ticket className="h-3.5 w-3.5" />} count={data.recentVoucherActivity.length}>
            Vouchers
          </TabsTrigger>
          <TabsTrigger value="questions" icon={<HelpCircle className="h-3.5 w-3.5" />} count={data.openQuestions.length}>
            Open questions
          </TabsTrigger>
          <TabsTrigger value="roadmap" icon={<ListChecks className="h-3.5 w-3.5" />} count={data.nextSteps.length}>
            Next steps
          </TabsTrigger>
          <TabsTrigger value="technical" icon={<Wrench className="h-3.5 w-3.5" />}>
            Technical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <BusinessFlowSelector flows={data.pipelines} />
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-earth-100 text-earth-800">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Where this plugs in</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      ESB runs the tills at our restaurants and cafés. We connect to one part of it — the
                      order system — so a member's perk becomes a real discount the moment they pay. ESB's
                      other products (online ordering, branded apps) aren't part of this; the full list is
                      under <span className="font-medium text-foreground">Technical</span>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <BusinessFlowSelector flows={data.pipelines} />
        </TabsContent>

        <TabsContent value="mapping">
          <p className="mb-3 text-xs text-muted-foreground">
            Which member perks apply at the F&amp;B counter, and what happens at the till for each one.
          </p>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Perk</th>
                    <th className="px-6 py-3 font-medium">What happens at the till</th>
                    <th className="px-6 py-3 font-medium">Voucher</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.perkMapping.map((m, i) => (
                    <Row key={m.perkId} index={i}>
                      <td className="px-6 py-3">
                        <p className="font-medium">{m.title}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{m.perkId}</p>
                      </td>
                      <td className={`px-6 py-3 text-xs ${m.status === 'n/a' ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {m.status === 'n/a' ? 'Not a food & drink perk — handled elsewhere' : m.mapping}
                      </td>
                      <td className="px-6 py-3 text-xs">
                        {m.voucherType === '—' ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <Badge variant="secondary">{m.voucherType}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${mappingStatusTone[m.status]}`}>
                          {mappingStatusLabel[m.status]}
                        </span>
                      </td>
                    </Row>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outlets">
          <p className="mb-3 text-xs text-muted-foreground">
            The restaurants and cafés where members will be able to use their perks.
          </p>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Outlet</th>
                    <th className="px-6 py-3 font-medium">Location</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.outlets.map((o, i) => (
                    <Row key={o.id} index={i}>
                      <td className="px-6 py-3">
                        <p className="font-medium">{o.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{o.id}</p>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {o.location}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${outletStatusTone[o.status]}`}>
                          {o.status === 'pending' ? 'Not set up' : o.status === 'live' ? 'Live' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" disabled={o.status === 'pending'}>
                          <Utensils className="h-3 w-3" />
                          Configure
                        </Button>
                      </td>
                    </Row>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <p className="mb-3 text-xs text-muted-foreground">
            Recent member vouchers — issued, used, or expired.
          </p>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Voucher</th>
                    <th className="px-6 py-3 font-medium">Member</th>
                    <th className="px-6 py-3 font-medium">Outlet</th>
                    <th className="px-6 py-3 font-medium">Value</th>
                    <th className="px-6 py-3 font-medium">Issued</th>
                    <th className="px-6 py-3 font-medium">Used</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentVoucherActivity.map((v, i) => (
                    <Row key={v.id} index={i}>
                      <td className="px-6 py-3 font-mono text-xs">{v.id}</td>
                      <td className="px-6 py-3 font-mono text-xs">{v.memberId}</td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{v.outletId}</td>
                      <td className="px-6 py-3 text-xs">{v.value}</td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmtTime.format(new Date(v.issuedAt))}</td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {v.redeemedAt ? fmtTime.format(new Date(v.redeemedAt)) : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${voucherStateTone[v.state]}`}>
                          {v.state === 'redeemed' ? 'Used' : v.state === 'issued' ? 'Issued' : 'Expired'}
                        </span>
                      </td>
                    </Row>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <p className="mb-3 text-xs text-muted-foreground">
            What we still need to confirm with ESB before the connection can be built.
          </p>
          <div className="space-y-3">
            {data.openQuestions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.04, 0.32) }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${severityTone[q.severity]}`}>
                            {priorityLabel[q.severity]}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Waiting on {q.owner}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-foreground">{q.question}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap">
          <p className="mb-3 text-xs text-muted-foreground">
            The path to switching on F&amp;B perks, and who owns each step.
          </p>
          <Card>
            <CardContent className="p-5">
              <ol className="relative space-y-4 border-l-2 border-brand-200 pl-5">
                {data.nextSteps.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.05 }}
                  >
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-brand-200 bg-white" />
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                      <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">{s.owner}</Badge>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          ETA {fmtDate.format(new Date(s.eta))}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">For engineers.</span> Which ESB systems we
              use, connection details, and the live connection monitor. Day-to-day operations don't need
              this tab.
            </div>

            <TechSection icon={<Server className="h-4 w-4" />} title="Connection">
              <ConfigRow label="How this connection will work" value={data.integrationModel} />
              <ConfigRow label="Base URL" value={data.baseUrl} mono />
              <ConfigRow label="Auth method" value={data.authMethod} />
              <ConfigRow label="Environment" value={data.environment === 'unset' ? 'Not set' : data.environment} />
            </TechSection>

            <TechSection icon={<Plug className="h-4 w-4" />} title="ESB product surfaces" count={data.products.length}>
              <p className="mb-3 text-xs text-muted-foreground">
                ESB ships five API products; only OMS is the integration target for member perks.
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {data.products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.32) }}
                  >
                    <div className="h-full rounded-2xl border border-border/60 bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${productStatusTone[p.status]}`}>
                          {p.status === 'not-applicable' ? 'N/A' : p.status === 'maybe-phase-2' ? 'P2?' : 'Target'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.purpose}</p>
                      <p className="mt-2 text-xs text-foreground">{p.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TechSection>

            <TechSection icon={<Heart className="h-4 w-4" />} title="Live connection monitor">
              <BlackboxPanel data={data.blackbox} pending />
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
    default: 'bg-earth-100 text-earth-800',
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
