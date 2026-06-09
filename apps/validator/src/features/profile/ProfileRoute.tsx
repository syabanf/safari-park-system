import { useAuthStore } from '@/features/auth/store';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Award, ChevronRight, Clock, History, Inbox, LogOut, type LucideIcon, Settings, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface StaffProfile {
  id: string;
  fullName: string;
  role: string;
  employeeId: string;
  gateId: string;
  gateLabel: string;
  shift: string;
  avatarInitials: string;
  phone: string;
  email: string;
  joinedAt: string;
  stats: {
    scansThisShift: number;
    scansThisWeek: number;
    avgPerHour: number;
    flawlessShiftsStreak: number;
  };
  badges: { id: string; label: string; tier: 'gold' | 'silver' | 'bronze'; count?: number }[];
}

async function fetchStaffProfile(): Promise<StaffProfile> {
  return (await api.http.get('validator/staff/me').json()) as StaffProfile;
}

const tierAccent = {
  gold: 'from-amber-400 to-amber-600 text-white',
  silver: 'from-slate-300 to-slate-500 text-white',
  bronze: 'from-amber-700 to-amber-900 text-white',
};

export function ProfileRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clear);
  const { data, isLoading } = useQuery({ queryKey: ['staff-me'], queryFn: fetchStaffProfile });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  const quickLinks: { to: string; label: string; icon: LucideIcon }[] = [
    { to: '/attendance', label: t('validator.attendance.title'), icon: Clock },
    { to: '/visits', label: t('validator.visits.title'), icon: History },
    { to: '/recent', label: t('validator.recent.title'), icon: History },
    { to: '/queue', label: t('validator.queue.title'), icon: Inbox },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 text-lg font-bold text-white backdrop-blur">
              {data.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-brand-200">{data.role}</p>
              <h1 className="truncate text-xl font-bold">{data.fullName}</h1>
              <p className="font-mono text-[11px] text-brand-200">{data.employeeId} · {data.gateId}</p>
              <p className="mt-1 text-xs text-brand-100">{data.shift}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-2 gap-3">
        <StatTile label={t('validator.profile.thisShift')} value={data.stats.scansThisShift} unit="scans" />
        <StatTile label={t('validator.profile.thisWeek')} value={data.stats.scansThisWeek} unit="scans" />
        <StatTile label="Avg / hour" value={data.stats.avgPerHour} unit="" />
        <StatTile label={t('validator.profile.streak')} value={data.stats.flawlessShiftsStreak} unit="shifts" highlight />
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('validator.profile.achievements')}
        </h2>
        <Card className="border-border/60 bg-white/85">
          <CardContent className="p-4">
            <ul className="space-y-3">
              {data.badges.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${tierAccent[b.tier]} shadow-sm`}>
                    {b.tier === 'gold' ? <Trophy className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{b.label}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {b.tier}
                      {b.count !== undefined ? ` · ${b.count}d streak` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('validator.profile.quickLinks')}
        </h2>
        <Card className="border-border/60 bg-white/85">
          <CardContent className="p-1.5">
            {quickLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
              >
                <Icon className="h-4 w-4 text-brand-700" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2 pb-6">
        <Card className="border-border/60 bg-white/85">
          <CardContent className="p-1.5">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">{t('validator.profile.settings')}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => {
                clearAuth();
                navigate('/login');
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-700 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="flex-1 text-left">{t('validator.profile.signOut')}</span>
            </button>
          </CardContent>
        </Card>
        <p className="text-center text-[10px] text-muted-foreground">
          v0.1.0 · {data.email}
        </p>
      </section>
    </motion.div>
  );
}

function StatTile({ label, value, unit, highlight }: { label: string; value: number; unit: string; highlight?: boolean }) {
  return (
    <Card className={`border-border/60 ${highlight ? 'bg-gradient-to-br from-brand-50 via-white to-earth-50' : 'bg-white/85'}`}>
      <CardContent className="p-3.5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {unit ? <span className="text-[10px] text-muted-foreground">{unit}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
