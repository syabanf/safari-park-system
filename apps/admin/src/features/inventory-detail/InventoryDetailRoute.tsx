import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, Box, MapPin } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link, useParams } from 'react-router-dom';

interface InventoryDetail {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  reorderAt: number;
  leadTimeDays: number;
  unitCostIdr: number;
  description: string;
  movement: { date: string; inflow: number; outflow: number }[];
  history: { id: string; date: string; action: 'used' | 'restocked'; qty: number; by: string; note: string }[];
  locations: { warehouse: string; qty: number }[];
}

async function fetchItem(id: string): Promise<InventoryDetail> {
  return (await api.http.get(`admin/inventory/${id}`).json()) as InventoryDetail;
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export function InventoryDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'inventory', id], queryFn: () => fetchItem(id), enabled: !!id });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const needsReorder = data.stock < data.reorderAt;

  return (
    <div className="space-y-6">
      <Link to="/inventory" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to inventory
      </Link>

      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
              <Box className="h-6 w-6" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{data.sku} · {data.category}</p>
              <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
            </div>
          </div>
          {needsReorder ? <Badge variant="destructive">Reorder now</Badge> : <Badge variant="success">In stock</Badge>}
        </div>
      </motion.header>

      <div className="grid gap-3 md:grid-cols-4">
        <Tile label="Stock" value={`${data.stock} ${data.unit}`} />
        <Tile label="Reorder at" value={`${data.reorderAt} ${data.unit}`} />
        <Tile label="Lead time" value={`${data.leadTimeDays}d`} />
        <Tile label="Unit cost" value={idr.format(data.unitCostIdr)} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Stock movement · 14 days</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.movement} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="inflow" stackId="a" fill="#287338" radius={[0, 0, 0, 0]} />
              <Bar dataKey="outflow" stackId="a" fill="#9a3a3a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Locations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.locations.map((l) => (
              <div key={l.warehouse} className="flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-700" /> {l.warehouse}</span>
                <span className="font-mono">{l.qty} {data.unit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.history.map((h) => (
              <div key={h.id} className="rounded-xl bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    <Badge variant={h.action === 'restocked' ? 'success' : 'warning'}>{h.action}</Badge>{' '}
                    {h.qty} {data.unit}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{fmt.format(new Date(h.date))}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{h.note} · by {h.by}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
