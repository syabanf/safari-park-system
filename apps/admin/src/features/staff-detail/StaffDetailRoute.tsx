import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, CalendarDays, FileText, Mail, Phone, type LucideIcon, UserCog, Wallet } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface StaffDetail {
  id: string;
  fullName: string;
  role: string;
  department: string;
  gateId: string;
  employeeId: string;
  phone: string;
  email: string;
  joinedAt: string;
  shift: string;
  salaryBandIdr: number;
  status: string;
  badges: { id: string; label: string; tier: string; count?: number }[];
  attendance30d: number;
  scansThisMonth: number;
  upcomingShifts: { date: string; start: string; end: string; gateLabel: string; status: string }[];
  recentTimeline: { id: string; label: string; timestamp: string; kind: 'attendance' | 'work' }[];
  documents: { id: string; name: string; filename: string; uploaded: string }[];
}

async function fetchStaff(id: string): Promise<StaffDetail> {
  return (await api.http.get(`admin/staff/${id}`).json()) as StaffDetail;
}

const idrShort = (v: number) => `Rp ${(v / 1_000_000).toFixed(1)}M`;

const shiftBadge: Record<string, 'success' | 'warning' | 'destructive'> = {
  scheduled: 'success',
  'swap-requested': 'warning',
  leave: 'destructive',
};

export function StaffDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'staff', id],
    queryFn: () => fetchStaff(id),
    enabled: !!id,
  });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });
  const dateOnly = new Intl.DateTimeFormat(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="space-y-6">
      <Link to="/staff" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to staff
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-lg font-bold text-white shadow-lg shadow-brand-900/20">
          {data.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.role}</p>
          <h1 className="text-2xl font-bold tracking-tight">{data.fullName}</h1>
          <p className="font-mono text-xs text-muted-foreground">{data.employeeId} · {data.gateId}</p>
        </div>
      </motion.header>

      <div className="grid gap-3 md:grid-cols-4">
        <Tile label="Attendance 30d" value={`${data.attendance30d}%`} icon={UserCog} />
        <Tile label="Scans this month" value={data.scansThisMonth.toLocaleString()} icon={CalendarDays} />
        <Tile label="Salary band" value={idrShort(data.salaryBandIdr)} icon={Wallet} accent="earth" />
        <Tile label="Achievements" value={data.badges.length} icon={Award} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="schedule" count={data.upcomingShifts.length}>Schedule</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents" count={data.documents.length}>Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <ContactRow icon={Mail} label="Email" value={data.email} />
              <ContactRow icon={Phone} label="Phone" value={data.phone} />
              <ContactRow icon={CalendarDays} label="Joined" value={fmt.format(new Date(data.joinedAt))} />
              <ContactRow icon={UserCog} label="Shift" value={data.shift} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Day</th>
                    <th className="px-6 py-3 font-medium">Shift</th>
                    <th className="px-6 py-3 font-medium">Gate</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingShifts.map((s, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-6 py-3 font-medium">{dateOnly.format(new Date(s.date))}</td>
                      <td className="px-6 py-3 font-mono text-xs">{s.start} — {s.end}</td>
                      <td className="px-6 py-3 text-muted-foreground">{s.gateLabel}</td>
                      <td className="px-6 py-3">
                        <Badge variant={shiftBadge[s.status] ?? 'secondary'}>{s.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-4">
              <ol className="space-y-3">
                {data.recentTimeline.map((entry, i) => (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    className="flex items-start gap-3"
                  >
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        entry.kind === 'attendance' ? 'bg-brand-500' : 'bg-earth-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">{entry.label}</p>
                      <p className="text-xs text-muted-foreground">{fmt.format(new Date(entry.timestamp))}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="space-y-2 p-4">
              {data.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-brand-700" />
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{d.filename}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{fmt.format(new Date(d.uploaded))}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Tile({ label, value, icon: Icon, accent = 'brand' }: { label: string; value: string | number; icon: LucideIcon; accent?: 'brand' | 'earth' | 'rose' }) {
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

function ContactRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
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
