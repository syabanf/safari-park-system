import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface BookingDetail {
  id: string;
  customer: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  type: string;
  paxCount: number;
  date: string;
  timeSlot: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string;
  revenueIdr: number;
  depositIdr: number;
  balanceIdr: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  timeline: { id: string; label: string; timestamp: string; actor: string }[];
  itinerary: { time: string; item: string }[];
}

async function fetchBooking(id: string): Promise<BookingDetail> {
  return (await api.http.get(`admin/bookings/${id}`).json()) as BookingDetail;
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const paymentVariant = { paid: 'success', partial: 'warning', unpaid: 'destructive' } as const;

export function BookingDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'bookings', id], queryFn: () => fetchBooking(id), enabled: !!id });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });
  const dateOnly = new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      <Link to="/bookings" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to bookings
      </Link>

      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.type} · {data.id}</p>
            <h1 className="text-2xl font-bold tracking-tight">{data.customer}</h1>
            <p className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {dateOnly.format(new Date(data.date))} · {data.timeSlot}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {data.location}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {data.paxCount} pax</span>
            </p>
          </div>
          <Badge variant="success">{data.status}</Badge>
        </div>
      </motion.header>

      <div className="grid gap-3 md:grid-cols-4">
        <Tile label="Revenue" value={idr.format(data.revenueIdr)} />
        <Tile label="Deposit" value={idr.format(data.depositIdr)} />
        <Tile label="Balance" value={idr.format(data.balanceIdr)} />
        <Tile label="Payment" value={data.paymentStatus} badge variant={paymentVariant[data.paymentStatus]} />
      </div>

      <Tabs defaultValue="itinerary">
        <TabsList>
          <TabsTrigger value="itinerary" count={data.itinerary.length}>Itinerary</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="timeline" count={data.timeline.length}>Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary">
          <Card>
            <CardContent className="p-4">
              <ol className="relative space-y-3 border-l-2 border-brand-200 pl-4">
                {data.itinerary.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-brand-200 bg-white" />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.time}</p>
                    <p className="text-sm font-medium">{s.item}</p>
                  </motion.li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardContent className="space-y-3 p-4 text-sm">
              <Row label="Contact" value={data.contactPerson} />
              <Row label="Email" value={data.contactEmail} />
              <Row label="Phone" value={data.contactPhone} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-4">
              <ol className="space-y-3">
                {data.timeline.map((e, i) => (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">{e.label}</p>
                      <p className="text-xs text-muted-foreground">{fmt.format(new Date(e.timestamp))} · {e.actor}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader><CardTitle className="text-base">Internal notes</CardTitle></CardHeader>
            <CardContent>
              <p className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed">{data.notes}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Tile({ label, value, badge, variant }: { label: string; value: string | number; badge?: boolean; variant?: 'success' | 'warning' | 'destructive' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        {badge && variant ? (
          <div className="mt-2"><Badge variant={variant}>{value}</Badge></div>
        ) : (
          <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
