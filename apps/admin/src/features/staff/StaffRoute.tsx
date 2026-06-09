import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle, Input } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Briefcase, Search, UserCheck, UserCog, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  department: string;
  gateId: string;
  shift: string;
  employeeId: string;
  attendance30d: number;
  status: 'active' | 'on-leave' | 'sick';
  joinedAt: string;
}

interface StaffSummary {
  headcount: number;
  onShiftNow: number;
  onLeaveThisWeek: number;
  openPositions: number;
  avgAttendance30d: number;
  byDepartment: { department: string; count: number }[];
  coverageByGate: { gate: string; morning: number; afternoon: number; gap: number }[];
}

async function fetchStaff(): Promise<{ staff: StaffMember[]; summary: StaffSummary }> {
  return (await api.http.get('admin/staff').json()) as { staff: StaffMember[]; summary: StaffSummary };
}

const statusVariant = {
  active: 'success',
  'on-leave': 'warning',
  sick: 'destructive',
} as const;

export function StaffRoute() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'staff'], queryFn: fetchStaff });
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState<'all' | string>('all');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.staff.filter((s) => {
      if (dept !== 'all' && s.department !== dept) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return s.fullName.toLowerCase().includes(q) || s.id.includes(q) || s.role.toLowerCase().includes(q);
    });
  }, [data, query, dept]);

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">Directory, roster, and gate coverage</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <TileWithIcon label="Headcount" value={data.summary.headcount} icon={Users} />
        <TileWithIcon label="On shift now" value={data.summary.onShiftNow} icon={UserCheck} />
        <TileWithIcon label="On leave this week" value={data.summary.onLeaveThisWeek} icon={UserCog} accent="earth" />
        <TileWithIcon label="Open positions" value={data.summary.openPositions} icon={Briefcase} accent="rose" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gate coverage today</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
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
              {data.summary.coverageByGate.map((c) => (
                <tr key={c.gate} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3 font-medium">{c.gate}</td>
                  <td className="px-6 py-3 text-center font-mono">{c.morning}</td>
                  <td className="px-6 py-3 text-center font-mono">{c.afternoon}</td>
                  <td className="px-6 py-3">
                    {c.gap > 0 ? (
                      <Badge variant="destructive">{c.gap} unfilled</Badge>
                    ) : (
                      <Badge variant="success">Fully covered</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, employee ID, role"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            {(['all', 'Operations', 'Animal Care', 'Commercial'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDept(d)}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  dept === d ? 'bg-brand-700 text-white' : 'border border-border bg-white text-muted-foreground hover:text-foreground'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Shift</th>
                <th className="px-6 py-3 text-right font-medium">Attendance 30d</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.012, 0.3) }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
                        {s.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{s.fullName}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{s.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">{s.role}</td>
                  <td className="px-6 py-3 text-muted-foreground">{s.department}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{s.shift}</td>
                  <td className="px-6 py-3 text-right font-mono">{s.attendance30d}%</td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
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

function TileWithIcon({ label, value, icon: Icon, accent = 'brand' }: { label: string; value: number; icon: typeof Users; accent?: 'brand' | 'earth' | 'rose' }) {
  const accentMap = {
    brand: 'bg-brand-100 text-brand-800',
    earth: 'bg-earth-100 text-earth-800',
    rose: 'bg-rose-100 text-rose-800',
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <span className={`grid h-7 w-7 place-items-center rounded-lg ${accentMap[accent]}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
