import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import { CalendarClock, ChevronLeft, ChevronRight, Clock, Repeat, Users, type LucideIcon } from 'lucide-react';

interface Roster {
  weekStart: string;
  weekEnd: string;
  days: string[];
  legend: { key: string; label: string; color: string }[];
  rows: { name: string; role: string; gate: string; cells: string[]; hours: number }[];
}

interface SwapRequest {
  id: string;
  from: string;
  to: string;
  date: string;
  shift: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  requestedAt: string;
}

interface Coverage {
  gate: string;
  morningStaffed: number;
  morningNeeded: number;
  afternoonStaffed: number;
  afternoonNeeded: number;
}

async function fetchRoster(): Promise<Roster> {
  return (await api.http.get('admin/shifts/roster').json()) as Roster;
}
async function fetchSwaps(): Promise<SwapRequest[]> {
  const json = (await api.http.get('admin/shifts/swaps').json()) as { swaps: SwapRequest[] };
  return json.swaps;
}
async function fetchCoverage(): Promise<Coverage[]> {
  const json = (await api.http.get('admin/shifts/coverage').json()) as { coverage: Coverage[] };
  return json.coverage;
}

const cellColor = (k: string) => {
  switch (k) {
    case 'M':
      return 'bg-brand-100 text-brand-800';
    case 'A':
      return 'bg-earth-100 text-earth-800';
    case 'L':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-muted/60 text-muted-foreground';
  }
};

const swapVariant = {
  pending: 'warning',
  approved: 'success',
  declined: 'destructive',
  completed: 'secondary',
} as const;

export function ShiftsRoute() {
  const { t, i18n } = useTranslation();
  const rosterQ = useQuery({ queryKey: ['admin', 'shifts', 'roster'], queryFn: fetchRoster });
  const swapsQ = useQuery({ queryKey: ['admin', 'shifts', 'swaps'], queryFn: fetchSwaps });
  const coverageQ = useQuery({ queryKey: ['admin', 'shifts', 'coverage'], queryFn: fetchCoverage });

  if (rosterQ.isLoading || !rosterQ.data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const r = rosterQ.data;
  const fmtRange = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long' });
  const fmtTime = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' });

  const pendingSwaps = (swapsQ.data ?? []).filter((s) => s.status === 'pending').length;
  const gapsCount = (coverageQ.data ?? []).reduce((s, c) => s + Math.max(0, c.morningNeeded - c.morningStaffed) + Math.max(0, c.afternoonNeeded - c.afternoonStaffed), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.shifts.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.shifts.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Pending swaps" value={pendingSwaps} icon={Repeat} accent={pendingSwaps > 0 ? 'earth' : 'brand'} />
        <KpiTile label="Coverage gaps" value={gapsCount} icon={Users} accent={gapsCount > 0 ? 'rose' : 'brand'} />
        <KpiTile label="Staff on roster" value={r.rows.length} icon={CalendarClock} />
        <KpiTile label="Avg hrs / staff" value={`${Math.round(r.rows.reduce((s, x) => s + x.hours, 0) / r.rows.length)}h`} icon={Clock} />
      </div>

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster" icon={<CalendarClock className="h-3.5 w-3.5" />}>Weekly roster</TabsTrigger>
          <TabsTrigger value="swaps" icon={<Repeat className="h-3.5 w-3.5" />} count={swapsQ.data?.length}>Swap requests</TabsTrigger>
          <TabsTrigger value="coverage" icon={<Users className="h-3.5 w-3.5" />}>Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {fmtRange.format(new Date(r.weekStart))} — {fmtRange.format(new Date(r.weekEnd))}
                </CardTitle>
                <p className="mt-1 flex gap-3 text-[11px]">
                  {r.legend.map((l) => (
                    <span key={l.key} className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-sm ${cellColor(l.key)}`} />
                      {l.label}
                    </span>
                  ))}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white hover:bg-muted">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white hover:bg-muted">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="sticky left-0 z-10 bg-card px-4 py-3 font-medium">Staff</th>
                    {r.days.map((d) => (
                      <th key={d} className="px-3 py-3 text-center font-medium">{d}</th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row, i) => (
                    <motion.tr
                      key={row.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="sticky left-0 bg-card px-4 py-3">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-[11px] text-muted-foreground">{row.role} · {row.gate}</div>
                      </td>
                      {row.cells.map((c, ci) => (
                        <td key={ci} className="px-3 py-3 text-center">
                          <span className={`inline-grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold ${cellColor(c)}`}>
                            {c}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-mono text-xs">{row.hours}h</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swaps">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              {!swapsQ.data ? (
                <div className="p-6 text-sm text-muted-foreground">{t('admin.common.loading')}</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-3 font-medium">From</th>
                      <th className="px-6 py-3 font-medium">To</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Shift</th>
                      <th className="px-6 py-3 font-medium">Reason</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swapsQ.data.map((s, i) => (
                      <motion.tr key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3 font-medium">{s.from}</td>
                        <td className="px-6 py-3">{s.to}</td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmtTime.format(new Date(s.date))}</td>
                        <td className="px-6 py-3 text-xs">{s.shift}</td>
                        <td className="px-6 py-3 text-xs text-muted-foreground">{s.reason}</td>
                        <td className="px-6 py-3"><Badge variant={swapVariant[s.status]}>{s.status}</Badge></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              {!coverageQ.data ? (
                <div className="p-6 text-sm text-muted-foreground">{t('admin.common.loading')}</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Gate</th>
                      <th className="px-6 py-3 text-center font-medium">Morning</th>
                      <th className="px-6 py-3 text-center font-medium">Afternoon</th>
                      <th className="px-6 py-3 font-medium">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverageQ.data.map((c) => {
                      const morningGap = c.morningNeeded - c.morningStaffed;
                      const afternoonGap = c.afternoonNeeded - c.afternoonStaffed;
                      const total = Math.max(0, morningGap) + Math.max(0, afternoonGap);
                      return (
                        <tr key={c.gate} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-6 py-3 font-medium">{c.gate}</td>
                          <td className="px-6 py-3 text-center font-mono text-sm">
                            <span className={morningGap > 0 ? 'text-rose-700' : ''}>
                              {c.morningStaffed} / {c.morningNeeded}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center font-mono text-sm">
                            <span className={afternoonGap > 0 ? 'text-rose-700' : ''}>
                              {c.afternoonStaffed} / {c.afternoonNeeded}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            {total > 0 ? (
                              <Badge variant="destructive">{total} unfilled</Badge>
                            ) : (
                              <Badge variant="success">Fully covered</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiTile({ label, value, icon: Icon, accent = 'brand' }: { label: string; value: string | number; icon: LucideIcon; accent?: 'brand' | 'earth' | 'rose' }) {
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
