import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Button, Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Coffee, LogIn, LogOut } from 'lucide-react';

interface AttendanceData {
  today: {
    date: string;
    clockedInAt: string | null;
    clockedOutAt: string | null;
    scheduledStart: string;
    scheduledEnd: string;
    status: 'on-shift' | 'completed' | 'not-started';
    breaks: { startedAt: string; endedAt: string | null; durationMin: number }[];
  };
  week: {
    date: string;
    weekday: string;
    present: boolean;
    clockedInAt: string | null;
    clockedOutAt: string | null;
    hoursWorked: number;
    late: boolean;
  }[];
  monthSummary: {
    totalDaysWorked: number;
    totalDaysScheduled: number;
    totalHours: number;
    attendanceRate: number;
    lateCount: number;
    onTimeRate: number;
  };
}

async function fetchAttendance(): Promise<AttendanceData> {
  return (await api.http.get('validator/attendance').json()) as AttendanceData;
}

export function AttendanceRoute() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['attendance'], queryFn: fetchAttendance });

  const clockIn = useMutation({
    mutationFn: () => api.http.post('validator/attendance/clock-in').json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const clockOut = useMutation({
    mutationFn: () => api.http.post('validator/attendance/clock-out').json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  const timeFormatter = new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' });

  const statusBadge =
    data.today.status === 'on-shift'
      ? 'success'
      : data.today.status === 'completed'
        ? 'secondary'
        : 'warning';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('validator.attendance.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('validator.attendance.subtitle')}</p>
      </header>

      <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-200">
                {t('validator.attendance.todayStatus')}
              </p>
              <p className="mt-1 text-xl font-bold">
                {t(`validator.attendance.${data.today.status === 'on-shift' ? 'onShift' : data.today.status === 'completed' ? 'completed' : 'notStarted'}`)}
              </p>
            </div>
            <Badge variant={statusBadge}>{data.today.status}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wider text-brand-200">{t('validator.attendance.clockedIn')}</p>
              <p className="mt-1 font-semibold">
                {data.today.clockedInAt ? timeFormatter.format(new Date(data.today.clockedInAt)) : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wider text-brand-200">{t('validator.attendance.clockedOut')}</p>
              <p className="mt-1 font-semibold">
                {data.today.clockedOutAt ? timeFormatter.format(new Date(data.today.clockedOutAt)) : '—'}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-brand-200">
            {t('validator.attendance.scheduled')}:{' '}
            {timeFormatter.format(new Date(data.today.scheduledStart))} —{' '}
            {timeFormatter.format(new Date(data.today.scheduledEnd))}
          </p>

          {data.today.breaks.length > 0 ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-200">
              <Coffee className="h-3.5 w-3.5" />
              <span>
                {t('validator.attendance.breaks')}: {data.today.breaks.reduce((s, b) => s + b.durationMin, 0)} min
              </span>
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            {!data.today.clockedInAt ? (
              <Button
                size="lg"
                className="flex-1 bg-white text-brand-900 hover:bg-white/90"
                disabled={clockIn.isPending}
                onClick={() => clockIn.mutate()}
              >
                <LogIn className="h-4 w-4" />
                {t('validator.attendance.clockIn')}
              </Button>
            ) : !data.today.clockedOutAt ? (
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                disabled={clockOut.isPending}
                onClick={() => clockOut.mutate()}
              >
                <LogOut className="h-4 w-4" />
                {t('validator.attendance.clockOut')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('validator.attendance.weeklyPattern')}
        </h2>
        <Card className="border-border/60 bg-white/85">
          <CardContent className="p-4">
            <div className="flex justify-between gap-1">
              {data.week.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-[10px] uppercase text-muted-foreground">{day.weekday}</span>
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-[10px] font-semibold ${
                      !day.present
                        ? 'bg-rose-100 text-rose-700'
                        : day.late
                          ? 'bg-earth-100 text-earth-800'
                          : 'bg-brand-100 text-brand-800'
                    }`}
                  >
                    {day.present ? day.hoursWorked.toFixed(0) + 'h' : '—'}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('validator.attendance.monthSummary')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/60 bg-white/85">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t('validator.attendance.attendanceRate')}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight">
                {data.monthSummary.attendanceRate.toFixed(1)}%
              </p>
              <p className="text-[11px] text-muted-foreground">
                {data.monthSummary.totalDaysWorked} / {data.monthSummary.totalDaysScheduled}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-white/85">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t('validator.attendance.totalHours')}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight">{data.monthSummary.totalHours}h</p>
              <p className="text-[11px] text-muted-foreground">
                {t('validator.attendance.late')}: {data.monthSummary.lateCount}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </motion.div>
  );
}
