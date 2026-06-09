import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Booking {
  id: string;
  customer: string;
  type: string;
  paxCount: number;
  date: string;
  timeSlot: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  revenueIdr: number;
}

interface BookingsData {
  bookings: Booking[];
  capacity: { date: string; booked: number; capacity: number }[];
}

async function fetchBookings(): Promise<BookingsData> {
  return (await api.http.get('admin/bookings').json()) as BookingsData;
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const idrShort = (v: number) => (Math.abs(v) >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`);

const statusVariant = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'destructive',
} as const;

export function BookingsRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'bookings'], queryFn: fetchBookings });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const totalRevenue = data.bookings.reduce((s, b) => s + (b.status !== 'cancelled' ? b.revenueIdr : 0), 0);
  const totalPax = data.bookings.reduce((s, b) => s + (b.status !== 'cancelled' ? b.paxCount : 0), 0);
  const confirmed = data.bookings.filter((b) => b.status === 'confirmed').length;
  const pending = data.bookings.filter((b) => b.status === 'pending').length;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Group tours, private events, school visits</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Confirmed" value={confirmed} />
        <KpiTile label="Pending" value={pending} />
        <KpiTile label="Pax (next 21d)" value={totalPax} />
        <KpiTile label="Revenue pipeline" value={idr.format(totalRevenue)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capacity · next 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.capacity} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(152 12% 38%)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ border: '1px solid hsl(35 22% 88%)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="booked" fill="#287338" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming bookings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Pax</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 text-right font-medium">Revenue</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((b, i) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.3) }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-3">
                    <div className="font-medium">{b.customer}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{b.id}</div>
                  </td>
                  <td className="px-6 py-3 text-xs">{b.type}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {fmt.format(new Date(b.date))} · {b.timeSlot}
                  </td>
                  <td className="px-6 py-3 text-right font-mono">{b.paxCount}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{b.location}</td>
                  <td className="px-6 py-3 text-right font-mono text-xs">{idrShort(b.revenueIdr)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
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

function KpiTile({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
