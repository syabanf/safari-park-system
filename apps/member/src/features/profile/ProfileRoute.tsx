import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { endpoints, queryKeys } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { AnnualPassArt, Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  Camera,
  ChevronRight,
  CalendarDays,
  Crown,
  Gift,
  Languages,
  LogOut,
  type LucideIcon,
  Percent,
  RefreshCw,
  ShoppingBag,
  Ticket,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/store';

interface ProfileExtras {
  stats: {
    visitsThisYear: number;
    remainingVisits: number;
    activePerks: number;
    totalSavedIdr: number;
  };
  recentVisits: { id: string; park: string; activity: string; date: string; image: string }[];
  activePerks: { id: string; title: string; icon: string; validUntil: string }[];
}

async function fetchExtras(): Promise<ProfileExtras> {
  return (await api.http.get('members/me/extras').json()) as ProfileExtras;
}

const perkIcon: Record<string, LucideIcon> = {
  percent: Percent,
  bag: ShoppingBag,
  camera: Camera,
};

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

// A friendly demo portrait for the avatar (mock data).
const AVATAR =
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80&auto=format&fit=crop';

export function ProfileRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);

  const memberQuery = useQuery({ queryKey: queryKeys.member.me(), queryFn: () => endpoints.getMe(api) });
  const passQuery = useQuery({ queryKey: queryKeys.pass.mine(), queryFn: () => endpoints.getMyPass(api) });
  const extrasQuery = useQuery({ queryKey: ['member', 'extras'], queryFn: fetchExtras });

  const member = memberQuery.data;
  const pass = passQuery.data;
  const extras = extrasQuery.data;

  if (memberQuery.isLoading || passQuery.isLoading || !member) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const fmtDate = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });
  const validUntil = pass
    ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(new Date(pass.validUntil))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pb-6"
    >
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-4 text-white shadow-lg shadow-brand-900/20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <img
            src={AVATAR}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full border-2 border-lime-400/80 object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{member.fullName}</h1>
            {pass ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-lime-500/90 px-2 py-0.5 text-[11px] font-bold text-brand-950">
                <Crown className="h-3 w-3" />
                Annual Pass {t(`pass.tier.${pass.tier}`)}
              </span>
            ) : null}
            {validUntil ? (
              <p className="mt-1.5 text-[11px] text-brand-100/90">
                {t('member.profile.validUntil')}{' '}
                <span className="font-semibold text-lime-300">{validUntil}</span>
              </p>
            ) : null}
          </div>
          <AnnualPassArt className="w-20 shrink-0 sm:w-24" showWordmark={false} />
        </div>
      </section>

      {/* Stats strip */}
      {extras ? (
        <section>
          <Card className="border-brand-100 bg-brand-50/70">
            <CardContent className="grid grid-cols-4 gap-1 p-3">
              <Stat icon={CalendarDays} label={t('member.profile.statVisits')} value={String(extras.stats.visitsThisYear)} unit={t('member.profile.unitTimes')} />
              <Stat icon={UserRound} label={t('member.profile.statRemaining')} value={String(extras.stats.remainingVisits)} unit={t('member.profile.unitTimes')} />
              <Stat icon={Gift} label={t('member.profile.statPerks')} value={String(extras.stats.activePerks)} unit={t('member.profile.unitActive')} />
              <Stat icon={Ticket} label={t('member.profile.statSaved')} value={idr.format(extras.stats.totalSavedIdr)} />
            </CardContent>
          </Card>
        </section>
      ) : null}

      {/* Recent visits */}
      {extras && extras.recentVisits.length > 0 ? (
        <section className="space-y-2.5">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-bold text-brand-900">{t('member.profile.recentVisits')}</h2>
            <Link to="/discover" className="flex items-center gap-0.5 text-xs font-semibold text-brand-700">
              {t('member.home.viewAll')}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {extras.recentVisits.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card className="overflow-hidden border-border/50">
                  <CardContent className="flex items-center gap-3 p-2.5">
                    <img src={v.image} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{v.park}</p>
                      <p className="truncate text-xs text-muted-foreground">{v.activity}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{fmtDate.format(new Date(v.date))}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Active perks */}
      {extras && extras.activePerks.length > 0 ? (
        <section className="space-y-2.5">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-bold text-brand-900">{t('member.profile.activePerks')}</h2>
            <Link to="/perks" className="flex items-center gap-0.5 text-xs font-semibold text-brand-700">
              {t('member.home.viewAll')}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {extras.activePerks.map((p) => {
              const Icon = perkIcon[p.icon] ?? Gift;
              return (
                <Card key={p.id} className="border-brand-100 bg-brand-50/60">
                  <CardContent className="flex flex-col items-center gap-2 p-3 text-center">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-semibold leading-tight text-brand-900">{p.title}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {t('perks.validUntil', { date: fmtDate.format(new Date(p.validUntil)) })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Renew CTA */}
      <Link
        to="/renewal"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-900/15 transition-transform active:scale-[0.98]"
      >
        <RefreshCw className="h-4 w-4" />
        {t('member.profile.renew')}
        <ChevronRight className="h-4 w-4" />
      </Link>

      {/* Account & settings */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('member.profile.account')}
        </h2>
        <Card className="border-border/50">
          <CardContent className="p-1.5">
            <button
              type="button"
              onClick={() => i18n.changeLanguage(i18n.language === 'id-ID' ? 'en-US' : 'id-ID')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
            >
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">{member.email}</span>
              <span className="text-xs uppercase text-muted-foreground">{i18n.language}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => {
                clear();
                navigate('/login');
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-700 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="flex-1 text-left">{t('member.profile.signOut')}</span>
            </button>
          </CardContent>
        </Card>
        <p className="text-center text-[10px] text-muted-foreground">Taman Safari Annual Pass · v0.1.0</p>
      </section>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-4 w-4 text-brand-700" />
      <p className="text-[9px] font-medium leading-tight text-brand-800/80">{label}</p>
      <p className="text-sm font-bold leading-none text-brand-900">{value}</p>
      {unit ? <p className="text-[9px] text-muted-foreground">{unit}</p> : null}
    </div>
  );
}
