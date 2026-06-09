import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link, useParams } from 'react-router-dom';

interface CampaignDetail {
  id: string;
  name: string;
  channel: string;
  audience: string;
  status: 'running' | 'paused' | 'completed';
  startsAt: string;
  endsAt: string;
  sent: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenueIdr: number;
  funnel: { stage: string; count: number }[];
  daily: { date: string; sent: number; opened: number; converted: number }[];
  creatives: { id: string; kind: string; preview: string; openRate: number }[];
}

async function fetchCampaign(id: string): Promise<CampaignDetail> {
  return (await api.http.get(`admin/marketing/${id}`).json()) as CampaignDetail;
}

const idrShort = (v: number) => `Rp ${(v / 1_000_000).toFixed(1)}M`;

const statusVariant = { running: 'success', paused: 'warning', completed: 'secondary' } as const;

export function CampaignDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'marketing', id], queryFn: () => fetchCampaign(id), enabled: !!id });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <Link to="/marketing" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to campaigns
      </Link>

      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700"><Megaphone className="h-6 w-6" /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.channel} · {data.audience}</p>
              <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{fmt.format(new Date(data.startsAt))} — {fmt.format(new Date(data.endsAt))}</p>
            </div>
          </div>
          <Badge variant={statusVariant[data.status]}>{data.status}</Badge>
        </div>
      </motion.header>

      <div className="grid gap-3 md:grid-cols-5">
        <Tile label="Sent" value={data.sent.toLocaleString()} />
        <Tile label="Opened" value={data.opened.toLocaleString()} />
        <Tile label="Clicked" value={data.clicked.toLocaleString()} />
        <Tile label="Conversions" value={data.conversions.toLocaleString()} />
        <Tile label="Revenue" value={idrShort(data.revenueIdr)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.funnel} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" fontSize={10} stroke="hsl(152 12% 38%)" axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" fontSize={11} stroke="hsl(152 12% 38%)" tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="#287338" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Daily engagement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="opened-d" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#287338" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#287338" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="opened" stroke="#287338" strokeWidth={2.5} fill="url(#opened-d)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Creatives</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.creatives.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
              <div>
                <p className="font-medium">{c.kind}</p>
                <p className="text-xs text-muted-foreground">"{c.preview}"</p>
              </div>
              <span className="font-mono text-xs">Open {c.openRate}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 text-xl font-bold tracking-tight">{value}</p></CardContent></Card>;
}
