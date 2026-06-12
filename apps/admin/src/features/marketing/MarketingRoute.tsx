import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { MailOpen, MousePointer, Send, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  audience: string;
  sent: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenueIdr: number;
  status: 'running' | 'paused' | 'completed';
  startsAt: string;
  endsAt: string;
}

interface MarketingSummary {
  totalSent30d: number;
  totalOpened30d: number;
  totalClicks30d: number;
  totalConversions30d: number;
  avgOpenRatePct: number;
  avgClickRatePct: number;
  days: { date: string; sent: number; opened: number; clicks: number }[];
}

async function fetchMarketing(): Promise<{ campaigns: Campaign[]; summary: MarketingSummary }> {
  return (await api.http.get('admin/marketing').json()) as { campaigns: Campaign[]; summary: MarketingSummary };
}

const idrShort = (v: number) => (Math.abs(v) >= 1_000_000 ? `Rp ${(v / 1_000_000).toFixed(1)}M` : `Rp ${(v / 1_000).toFixed(0)}k`);

const statusVariant = {
  running: 'success',
  paused: 'warning',
  completed: 'secondary',
} as const;

export function MarketingRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'marketing'], queryFn: fetchMarketing });

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

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.marketing.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.marketing.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Sent · 30d" value={data.summary.totalSent30d.toLocaleString()} icon={Send} />
        <KpiTile label="Open rate" value={`${data.summary.avgOpenRatePct.toFixed(1)}%`} icon={MailOpen} />
        <KpiTile label="Click rate" value={`${data.summary.avgClickRatePct.toFixed(1)}%`} icon={MousePointer} />
        <KpiTile label="Conversions · 30d" value={data.summary.totalConversions30d.toLocaleString()} icon={Target} accent="brand" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement · last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.summary.days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b08754" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#b08754" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#287338" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#287338" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="sent" stroke="#b08754" strokeWidth={2} fill="url(#sent)" />
              <Area type="monotone" dataKey="opened" stroke="#287338" strokeWidth={2.5} fill="url(#opened)" />
              <Area type="monotone" dataKey="clicks" stroke="#5bac6a" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Campaign</th>
                <th className="px-6 py-3 font-medium">Channel</th>
                <th className="px-6 py-3 font-medium">Window</th>
                <th className="px-6 py-3 text-right font-medium">Sent</th>
                <th className="px-6 py-3 text-right font-medium">Opened</th>
                <th className="px-6 py-3 text-right font-medium">Clicked</th>
                <th className="px-6 py-3 text-right font-medium">Conv.</th>
                <th className="px-6 py-3 text-right font-medium">Revenue</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => navigate(`/marketing/${c.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/marketing/${c.id}`);
                    }
                  }}
                  className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40"
                >
                  <td className="px-6 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.audience}</div>
                  </td>
                  <td className="px-6 py-3 text-xs">{c.channel}</td>
                  <td className="px-6 py-3 font-mono text-[11px] text-muted-foreground">
                    {fmt.format(new Date(c.startsAt))} — {fmt.format(new Date(c.endsAt))}
                  </td>
                  <td className="px-6 py-3 text-right font-mono">{c.sent.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-mono">{c.opened.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-mono">{c.clicked.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-mono">{c.conversions}</td>
                  <td className="px-6 py-3 text-right font-mono text-xs">{idrShort(c.revenueIdr)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiTile({ label, value, icon: Icon, accent = 'brand' }: { label: string; value: string; icon: typeof Send; accent?: 'brand' | 'earth' | 'rose' }) {
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
