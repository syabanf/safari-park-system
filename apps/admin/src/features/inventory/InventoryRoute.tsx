import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { AlertTriangle, Box, PackageOpen, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  reorderAt: number;
  unit: string;
  lastRestocked: string;
  needsReorder: boolean;
}

interface InventorySummary {
  skuCount: number;
  valueIdr: number;
  belowReorder: number;
  expiringSoon: number;
  byCategory: { category: string; value: number }[];
}

async function fetchInventory(): Promise<{ items: InventoryItem[]; summary: InventorySummary }> {
  return (await api.http.get('admin/inventory').json()) as { items: InventoryItem[]; summary: InventorySummary };
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const idrShort = (v: number) => (Math.abs(v) >= 1_000_000 ? `Rp ${(v / 1_000_000).toFixed(1)}M` : `Rp ${(v / 1_000).toFixed(0)}k`);

const categoryColors = ['#287338', '#5bac6a', '#b08754', '#d4be96', '#9a3a3a'];

const humanize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const stockStateOf = (it: InventoryItem) => (it.needsReorder ? 'reorder' : 'in-stock');

export function InventoryRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'inventory'], queryFn: fetchInventory });

  const [query, setQuery] = useState('');
  const [categorySelected, setCategorySelected] = useState<string[]>([]);
  const [statusSelected, setStatusSelected] = useState<string[]>([]);

  const items = data?.items ?? [];

  const counts = useMemo(() => {
    const c = { category: new Map<string, number>(), status: new Map<string, number>() };
    for (const it of items) {
      c.category.set(it.category, (c.category.get(it.category) ?? 0) + 1);
      const st = stockStateOf(it);
      c.status.set(st, (c.status.get(st) ?? 0) + 1);
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (categorySelected.length && !categorySelected.includes(it.category)) return false;
      if (statusSelected.length && !statusSelected.includes(stockStateOf(it))) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !it.name.toLowerCase().includes(q) &&
          !it.sku.toLowerCase().includes(q) &&
          !it.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [items, query, categorySelected, statusSelected]);

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
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.inventory.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.inventory.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="SKUs" value={data.summary.skuCount} icon={Box} />
        <KpiTile label="Total value" value={idrShort(data.summary.valueIdr)} icon={PackageOpen} />
        <KpiTile label="Below reorder" value={data.summary.belowReorder} icon={AlertTriangle} accent="rose" />
        <KpiTile label="Expiring soon" value={data.summary.expiringSoon} icon={AlertTriangle} accent="earth" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock value by category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.summary.byCategory} layout="vertical" margin={{ left: 30 }}>
              <XAxis type="number" tickFormatter={(v) => idrShort(v)} fontSize={10} stroke="hsl(152 12% 38%)" axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} width={120} />
              <Tooltip
                formatter={(v: number) => idr.format(v)}
                cursor={{ fill: 'hsl(35 30% 94%)' }}
                contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.summary.byCategory.map((_, i) => (
                  <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <AdvancedFilters
        searchPlaceholder={t('admin.filters.search') as string}
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'category',
            label: t('admin.filters.category') as string,
            selected: categorySelected,
            onChange: setCategorySelected,
            options: [...counts.category.keys()].map((value) => ({
              value,
              label: humanize(value),
              count: counts.category.get(value),
            })),
          },
          {
            key: 'status',
            label: t('admin.filters.status') as string,
            selected: statusSelected,
            onChange: setStatusSelected,
            options: [...counts.status.keys()].map((value) => ({
              value,
              label: humanize(value),
              count: counts.status.get(value),
            })),
          },
        ]}
        onClear={() => {
          setQuery('');
          setCategorySelected([]);
          setStatusSelected([]);
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock list</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('admin.common.noMatches')}
              description={t('admin.common.noMatchesHint')}
            />
          ) : (
            <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 text-right font-medium">Stock</th>
                <th className="px-6 py-3 text-right font-medium">Reorder at</th>
                <th className="px-6 py-3 font-medium">Last restocked</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, i) => (
                <motion.tr
                  key={it.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.3) }}
                  onClick={() => navigate(`/inventory/${it.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/inventory/${it.id}`);
                    }
                  }}
                  className={`cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40 ${it.needsReorder ? 'bg-rose-50/30' : ''}`}
                >
                  <td className="px-6 py-3 font-mono text-xs">{it.sku}</td>
                  <td className="px-6 py-3">
                    <div className="font-medium">{it.name}</div>
                    {it.needsReorder ? (
                      <Badge variant="destructive" className="mt-1">Reorder now</Badge>
                    ) : null}
                  </td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{it.category}</td>
                  <td className="px-6 py-3 text-right font-mono">{it.stock} {it.unit}</td>
                  <td className="px-6 py-3 text-right font-mono text-xs text-muted-foreground">{it.reorderAt} {it.unit}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{fmt.format(new Date(it.lastRestocked))}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiTile({ label, value, icon: Icon, accent = 'brand' }: { label: string; value: string | number; icon: typeof Box; accent?: 'brand' | 'earth' | 'rose' }) {
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
