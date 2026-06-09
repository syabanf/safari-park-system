import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Activity, AlertOctagon, ArrowLeft, DoorOpen, History, TrendingUp, Wifi, WifiOff } from 'lucide-react';
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
import { Link, useParams } from 'react-router-dom';

interface GateDetail {
  id: string;
  location: string;
  status: 'online' | 'offline' | 'degraded';
  hardware: string;
  pendingRedemptions: number;
  publicKeyCacheAgeMinutes: number;
  uptimePct: number;
  avgLatencyMs: number;
  todaysScans: number;
  scansLast24h: { hour: string; online: number; offline: number; manual: number }[];
  recentScans: {
    id: string;
    passHolder: string;
    passId: string;
    verdict: 'allow' | 'deny' | 'manual';
    source: 'online' | 'offline' | 'manual';
    scannedAt: string;
  }[];
  incidents: {
    id: string;
    title: string;
    timestamp: string;
    durationMin: number;
    severity: 'low' | 'medium' | 'high';
  }[];
}

async function fetchGate(id: string): Promise<GateDetail> {
  return (await api.http.get(`admin/gates/${id}`).json()) as GateDetail;
}

const statusVariant = {
  online: 'success',
  offline: 'destructive',
  degraded: 'warning',
} as const;

const statusIcon = {
  online: Wifi,
  offline: WifiOff,
  degraded: Activity,
};

const verdictVariant = {
  allow: 'success',
  deny: 'destructive',
  manual: 'warning',
} as const;

export function GateDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'gates', id],
    queryFn: () => fetchGate(id),
    enabled: !!id,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const Icon = statusIcon[data.status];
  const formatter = new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' });

  return (
    <div className="space-y-6">
      <Link
        to="/gates"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to gates
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
              <DoorOpen className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {t('admin.gates.detail.title')}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">{data.location}</h1>
              <p className="font-mono text-xs text-muted-foreground">{data.id}</p>
            </div>
          </div>
          <Badge variant={statusVariant[data.status]} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {data.status}
          </Badge>
        </div>
      </motion.header>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance" icon={<TrendingUp className="h-3.5 w-3.5" />}>
            Performance
          </TabsTrigger>
          <TabsTrigger value="scans" icon={<History className="h-3.5 w-3.5" />} count={data.recentScans.length}>
            Scans
          </TabsTrigger>
          <TabsTrigger value="incidents" icon={<AlertOctagon className="h-3.5 w-3.5" />} count={data.incidents.length}>
            Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <KpiTile label="Scans today" value={data.todaysScans.toLocaleString()} />
              <KpiTile label="Avg latency" value={`${data.avgLatencyMs} ms`} />
              <KpiTile label="Uptime" value={`${data.uptimePct.toFixed(1)}%`} />
              <KpiTile label="Pending sync" value={data.pendingRedemptions.toString()} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('admin.gates.detail.todaysVolume')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.scansLast24h} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                    <XAxis dataKey="hour" stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        border: '1px solid hsl(35 22% 88%)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="online" stackId="a" fill="#287338" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="offline" stackId="a" fill="#b08754" />
                    <Bar dataKey="manual" stackId="a" fill="#9a3a3a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scans">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.gates.detail.recentScans')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Holder</th>
                    <th className="px-5 py-3 font-medium">Verdict</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentScans.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">
                        {formatter.format(new Date(s.scannedAt))}
                      </td>
                      <td className="px-5 py-2.5">{s.passHolder}</td>
                      <td className="px-5 py-2.5">
                        <Badge variant={verdictVariant[s.verdict]}>{s.verdict}</Badge>
                      </td>
                      <td className="px-5 py-2.5 text-xs">{s.source}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{t('admin.gates.detail.incidents')}</CardTitle>
              </CardHeader>
              <CardContent>
                {data.incidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('admin.gates.detail.noIncidents')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.incidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="flex items-start justify-between gap-2 rounded-xl border border-border bg-muted/30 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{inc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.DateTimeFormat(i18n.language, {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            }).format(new Date(inc.timestamp))}{' '}
                            · {inc.durationMin} min
                          </p>
                        </div>
                        <Badge variant={inc.severity === 'high' ? 'destructive' : 'warning'}>
                          {inc.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hardware & keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Device</p>
                  <p className="mt-0.5 font-medium">{data.hardware}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Public-key cache age</p>
                  <p className="mt-0.5 font-mono">{data.publicKeyCacheAgeMinutes} min</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Pending sync</p>
                  <p className="mt-0.5 font-mono">{data.pendingRedemptions}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
