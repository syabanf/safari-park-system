import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Star, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  onTimePct: number;
  lastDelivery: string;
  activeOrders: number;
}

interface PurchaseOrder {
  id: string;
  vendor: string;
  amountIdr: number;
  placedAt: string;
  expected: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'closed';
  items: number;
}

async function fetchVendors(): Promise<{ vendors: Vendor[]; purchaseOrders: PurchaseOrder[] }> {
  return (await api.http.get('admin/vendors').json()) as { vendors: Vendor[]; purchaseOrders: PurchaseOrder[] };
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const idrShort = (v: number) => (Math.abs(v) >= 1_000_000 ? `Rp ${(v / 1_000_000).toFixed(1)}M` : `Rp ${(v / 1_000).toFixed(0)}k`);

const statusVariant = {
  draft: 'secondary',
  sent: 'warning',
  confirmed: 'warning',
  delivered: 'success',
  closed: 'success',
} as const;

export function VendorsRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'vendors'], queryFn: fetchVendors });

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
  const totalOpen = data.purchaseOrders.filter((p) => p.status !== 'closed').length;
  const totalOpenValue = data.purchaseOrders
    .filter((p) => p.status !== 'closed' && p.status !== 'delivered')
    .reduce((s, p) => s + p.amountIdr, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.vendors.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.vendors.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Vendors" value={data.vendors.length} />
        <KpiTile label="Open POs" value={totalOpen} />
        <KpiTile label="Open value" value={idrShort(totalOpenValue)} />
        <KpiTile label="Avg on-time" value={`${Math.round(data.vendors.reduce((s, v) => s + v.onTimePct, 0) / data.vendors.length)}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supplier directory</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.vendors.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              onClick={() => navigate(`/vendors/${v.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/vendors/${v.id}`);
                }
              }}
              className="cursor-pointer rounded-2xl border border-border bg-white/85 p-4 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">{v.category}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-earth-50 px-2 py-0.5 text-[10px] font-medium text-earth-800">
                  <Star className="h-3 w-3 fill-current" />
                  {v.rating.toFixed(1)}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <Mini label="On-time" value={`${v.onTimePct}%`} />
                <Mini label="Active POs" value={String(v.activeOrders)} />
                <Mini label="Last delivery" value={fmt.format(new Date(v.lastDelivery))} />
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-brand-700" />
            Purchase orders
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">PO #</th>
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Placed</th>
                <th className="px-6 py-3 font-medium">Expected</th>
                <th className="px-6 py-3 text-right font-medium">Items</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.purchaseOrders.map((po, i) => (
                <motion.tr
                  key={po.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.3) }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-3 font-mono text-xs">{po.id}</td>
                  <td className="px-6 py-3 font-medium">{po.vendor}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmt.format(new Date(po.placedAt))}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmt.format(new Date(po.expected))}</td>
                  <td className="px-6 py-3 text-right font-mono">{po.items}</td>
                  <td className="px-6 py-3 text-right font-mono">{idr.format(po.amountIdr)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[po.status]}>{po.status}</Badge>
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

function KpiTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-xs font-medium">{value}</p>
    </div>
  );
}
