import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Phone, Star, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface VendorDetail {
  id: string;
  name: string;
  category: string;
  rating: number;
  onTimePct: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  sinceYear: number;
  totalSpendIdr: number;
  activeOrders: number;
  purchaseOrders: { id: string; placedAt: string; amountIdr: number; status: string; items: number }[];
  deliveryHistory: { id: string; date: string; onTime: boolean; qualityScore: number; notes: string }[];
}

async function fetchVendor(id: string): Promise<VendorDetail> {
  return (await api.http.get(`admin/vendors/${id}`).json()) as VendorDetail;
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const idrShort = (v: number) => `Rp ${(v / 1_000_000).toFixed(1)}M`;

const statusVariant: Record<string, 'secondary' | 'warning' | 'success'> = {
  draft: 'secondary', sent: 'warning', confirmed: 'warning', delivered: 'success', closed: 'success',
};

export function VendorDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'vendors', id], queryFn: () => fetchVendor(id), enabled: !!id });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <Link to="/vendors" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to vendors
      </Link>

      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-earth-100 text-earth-800"><Truck className="h-6 w-6" /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.category} · Since {data.sinceYear}</p>
              <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
              <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{data.address}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-earth-50 px-2 py-0.5 text-xs font-medium text-earth-800">
            <Star className="h-3 w-3 fill-current" />
            {data.rating.toFixed(1)}
          </div>
        </div>
      </motion.header>

      <div className="grid gap-3 md:grid-cols-4">
        <Tile label="On-time" value={`${data.onTimePct}%`} />
        <Tile label="Active POs" value={data.activeOrders} />
        <Tile label="Total spend" value={idrShort(data.totalSpendIdr)} />
        <Tile label="Avg rating" value={data.rating.toFixed(1)} />
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders" count={data.purchaseOrders.length}>Purchase orders</TabsTrigger>
          <TabsTrigger value="delivery" count={data.deliveryHistory.length}>Delivery history</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardContent className="p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">PO #</th>
                    <th className="px-6 py-3 font-medium">Placed</th>
                    <th className="px-6 py-3 text-right font-medium">Items</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.purchaseOrders.map((po, i) => (
                    <motion.tr key={po.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-6 py-3 font-mono text-xs">{po.id}</td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmt.format(new Date(po.placedAt))}</td>
                      <td className="px-6 py-3 text-right font-mono">{po.items}</td>
                      <td className="px-6 py-3 text-right font-mono">{idr.format(po.amountIdr)}</td>
                      <td className="px-6 py-3"><Badge variant={statusVariant[po.status] ?? 'secondary'}>{po.status}</Badge></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardContent className="space-y-2 p-4">
              {data.deliveryHistory.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }} className="rounded-xl bg-muted/30 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={d.onTime ? 'success' : 'warning'}>{d.onTime ? 'On time' : 'Late'}</Badge>
                      <span className="text-xs text-muted-foreground">Quality {d.qualityScore.toFixed(1)}/5</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{fmt.format(new Date(d.date))}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{d.notes}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-2">
              <ContactRow icon={Mail} label="Contact person" value={data.contactPerson} />
              <ContactRow icon={Mail} label="Email" value={data.contactEmail} />
              <ContactRow icon={Phone} label="Phone" value={data.contactPhone} />
              <ContactRow icon={MapPin} label="Address" value={data.address} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 text-xl font-bold tracking-tight">{value}</p></CardContent></Card>;
}

function ContactRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-brand-700" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
