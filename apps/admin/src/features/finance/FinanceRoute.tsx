import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, BanknoteIcon, TrendingUp, Wallet, type LucideIcon } from 'lucide-react';
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

interface FinanceSummary {
  todayRevenue: number;
  todayRevenueTrendPct: number;
  monthRevenue: number;
  monthRevenueTrendPct: number;
  pendingPayouts: number;
  refundsToday: number;
  refundsTrendPct: number;
  daily: { date: string; revenue: number; refunds: number; payouts: number }[];
  byChannel: { channel: string; amount: number }[];
}

interface Transaction {
  id: string;
  timestamp: string;
  member: string;
  channel: string;
  method: string;
  amountIdr: number;
  status: string;
}

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
const idrShort = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}k`;
  return `Rp ${v}`;
};

async function fetchSummary(): Promise<FinanceSummary> {
  return (await api.http.get('admin/finance/summary').json()) as FinanceSummary;
}

async function fetchTx(): Promise<Transaction[]> {
  const json = (await api.http.get('admin/finance/transactions').json()) as { transactions: Transaction[] };
  return json.transactions;
}

export function FinanceRoute() {
  const { t, i18n } = useTranslation();
  const summaryQ = useQuery({ queryKey: ['admin', 'finance-summary'], queryFn: fetchSummary });
  const txQ = useQuery({ queryKey: ['admin', 'finance-tx'], queryFn: fetchTx });

  if (summaryQ.isLoading || !summaryQ.data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }
  const s = summaryQ.data;

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue, payouts, and refunds — last 30 days
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <FinKpi
          label="Today's revenue"
          value={idr.format(s.todayRevenue)}
          trendPct={s.todayRevenueTrendPct}
          icon={BanknoteIcon}
          accent="brand"
        />
        <FinKpi
          label="Month revenue"
          value={idrShort(s.monthRevenue)}
          trendPct={s.monthRevenueTrendPct}
          icon={TrendingUp}
          accent="brand"
        />
        <FinKpi
          label="Pending payouts"
          value={idrShort(s.pendingPayouts)}
          icon={Wallet}
          accent="earth"
        />
        <FinKpi
          label="Refunds today"
          value={idr.format(s.refundsToday)}
          trendPct={s.refundsTrendPct}
          icon={ArrowDownRight}
          accent="rose"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue · last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={s.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#287338" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#287338" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(152 12% 38%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => idrShort(v)}
              />
              <Tooltip
                formatter={(v: number) => idr.format(v)}
                contentStyle={{
                  border: '1px solid hsl(35 22% 88%)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#287338" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={s.byChannel} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" tickFormatter={(v) => idrShort(v)} fontSize={10} stroke="hsl(152 12% 38%)" axisLine={false} tickLine={false} />
                <YAxis dataKey="channel" type="category" fontSize={11} stroke="hsl(152 12% 38%)" tickLine={false} axisLine={false} width={140} />
                <Tooltip
                  formatter={(v: number) => idr.format(v)}
                  cursor={{ fill: 'hsl(35 30% 94%)' }}
                  contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="amount" fill="#287338" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {txQ.isLoading || !txQ.data ? (
              <p className="p-4 text-sm text-muted-foreground">{t('admin.common.loading')}</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Channel</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {txQ.data.slice(0, 10).map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">
                        {formatter.format(new Date(tx.timestamp))}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="font-medium">{tx.channel}</div>
                        <div className="text-[11px] text-muted-foreground">{tx.method}</div>
                      </td>
                      <td className={`px-5 py-2.5 text-right font-mono text-xs ${tx.amountIdr < 0 ? 'text-rose-700' : ''}`}>
                        {tx.amountIdr < 0 ? '−' : ''}{idr.format(Math.abs(tx.amountIdr))}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinKpi({
  label,
  value,
  trendPct,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  trendPct?: number;
  icon: LucideIcon;
  accent: 'brand' | 'earth' | 'rose';
}) {
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
        {trendPct !== undefined ? (
          <p className={`mt-1 flex items-center gap-0.5 text-[11px] font-medium ${trendPct >= 0 ? 'text-brand-800' : 'text-rose-700'}`}>
            {trendPct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trendPct).toFixed(1)}% vs last week
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
