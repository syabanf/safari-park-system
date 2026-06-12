import { api } from '@/lib/api';
import { useValueLabel } from '@/lib/filterValues';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { AdvancedFilters, Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorState } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Briefcase, SearchX, UserCheck, UserCog, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const valueLabel = useValueLabel();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'staff'], queryFn: fetchStaff });
  const [query, setQuery] = useState('');
  const [deptSelected, setDeptSelected] = useState<string[]>([]);
  const [roleSelected, setRoleSelected] = useState<string[]>([]);
  const [statusSelected, setStatusSelected] = useState<string[]>([]);

  const counts = useMemo(() => {
    const c = {
      department: new Map<string, number>(),
      role: new Map<string, number>(),
      status: new Map<string, number>(),
    };
    for (const s of data?.staff ?? []) {
      c.department.set(s.department, (c.department.get(s.department) ?? 0) + 1);
      c.role.set(s.role, (c.role.get(s.role) ?? 0) + 1);
      c.status.set(s.status, (c.status.get(s.status) ?? 0) + 1);
    }
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.staff.filter((s) => {
      if (deptSelected.length && !deptSelected.includes(s.department)) return false;
      if (roleSelected.length && !roleSelected.includes(s.role)) return false;
      if (statusSelected.length && !statusSelected.includes(s.status)) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
      );
    });
  }, [data, query, deptSelected, roleSelected, statusSelected]);

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.staff.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.staff.subtitle')}</p>
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

      <AdvancedFilters
        searchPlaceholder={t('admin.filters.search') as string}
        searchValue={query}
        onSearchChange={setQuery}
        multiSelect={[
          {
            key: 'department',
            label: t('admin.filters.department') as string,
            selected: deptSelected,
            onChange: setDeptSelected,
            options: [...counts.department.keys()].map((v) => ({
              value: v,
              label: valueLabel(v),
              count: counts.department.get(v),
            })),
          },
          {
            key: 'role',
            label: t('admin.filters.role') as string,
            selected: roleSelected,
            onChange: setRoleSelected,
            options: [...counts.role.keys()].map((v) => ({
              value: v,
              label: valueLabel(v),
              count: counts.role.get(v),
            })),
          },
          {
            key: 'status',
            label: t('admin.filters.status') as string,
            selected: statusSelected,
            onChange: setStatusSelected,
            options: [...counts.status.keys()].map((v) => ({
              value: v,
              label: valueLabel(v),
              count: counts.status.get(v),
            })),
          },
        ]}
        onClear={() => {
          setQuery('');
          setDeptSelected([]);
          setRoleSelected([]);
          setStatusSelected([]);
        }}
      />

      <Card>
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
                  onClick={() => navigate(`/staff/${s.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/staff/${s.id}`);
                    }
                  }}
                  className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40"
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
          )}
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
