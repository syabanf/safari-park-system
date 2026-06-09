import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { endpoints, queryKeys } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { Button, PassCard, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BannerCarousel } from '../home/BannerCarousel';
import { EventsPreview } from '../home/EventsPreview';
import { ParkStatusCard } from '../home/ParkStatusCard';
import { PerksPreview } from '../home/PerksPreview';
import { QuickActions } from '../home/QuickActions';
import {
  fetchBanners,
  fetchEvents,
  fetchParkStatus,
  fetchPerks,
} from '../home/queries';

export function HomeRoute() {
  const { t, i18n } = useTranslation();

  const passQuery = useQuery({
    queryKey: queryKeys.pass.mine(),
    queryFn: () => endpoints.getMyPass(api),
  });

  const memberQuery = useQuery({
    queryKey: queryKeys.member.me(),
    queryFn: () => endpoints.getMe(api),
  });

  const bannersQuery = useQuery({ queryKey: ['banners'], queryFn: fetchBanners });
  const parkStatusQuery = useQuery({ queryKey: ['park-status'], queryFn: fetchParkStatus });
  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
  const perksQuery = useQuery({ queryKey: ['perks'], queryFn: fetchPerks });

  if (passQuery.isLoading || memberQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const pass = passQuery.data;
  const member = memberQuery.data;
  if (!pass || !member) return null;

  const expiresLabel = t('pass.expiresOn', {
    date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
      new Date(pass.validUntil),
    ),
  });

  const visitsLabel = pass.visitsAllowed
    ? t('pass.visitsRemaining', { count: pass.visitsAllowed - pass.visitsUsed })
    : t('pass.unlimitedVisits');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.header
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative -mx-4 -mt-4 overflow-hidden rounded-b-3xl"
      >
        {parkStatusQuery.data?.heroImage ? (
          <img
            src={parkStatusQuery.data.heroImage}
            alt=""
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-900/60 to-brand-900/30" />
        <div className="relative px-4 py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-100/90 drop-shadow">
            {t('app.tagline')}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white drop-shadow">
            {t('member.home.greeting', { name: member.fullName.split(' ')[0] })}
          </h1>
          {parkStatusQuery.data ? (
            <p className="mt-1.5 text-xs text-brand-100/95 drop-shadow">
              {parkStatusQuery.data.parkName} · {parkStatusQuery.data.weather.tempC}°C ·{' '}
              {parkStatusQuery.data.weather.conditionEn}
            </p>
          ) : null}
        </div>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      >
        <PassCard
          holderName={pass.holderName}
          tierLabel={t(`pass.tier.${pass.tier}`)}
          statusLabel={t(`pass.status.${pass.status}`)}
          status={pass.status}
          expiresLabel={expiresLabel}
          visitsLabel={visitsLabel}
        />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Button asChild size="lg" className="h-14 w-full text-base shadow-lg shadow-brand-900/10">
          <Link to="/qr">
            <QrCode className="h-5 w-5" />
            {t('member.home.showQr')}
          </Link>
        </Button>
      </motion.section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('member.home.quickActions')}
        </h2>
        <QuickActions />
      </section>

      {parkStatusQuery.data ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('member.home.todayAtPark')}
          </h2>
          <ParkStatusCard status={parkStatusQuery.data} />
        </section>
      ) : null}

      {bannersQuery.data && bannersQuery.data.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('member.home.promotions')}
          </h2>
          <BannerCarousel banners={bannersQuery.data} />
        </section>
      ) : null}

      {eventsQuery.data && eventsQuery.data.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('member.home.upcomingEvents')}
            </h2>
            <Link to="/events" className="flex items-center gap-0.5 text-xs font-medium text-brand-700">
              {t('member.home.viewAll')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <EventsPreview events={eventsQuery.data} />
        </section>
      ) : null}

      {perksQuery.data && perksQuery.data.length > 0 ? (
        <section className="space-y-3 pb-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('member.home.memberPerks')}
            </h2>
            <Link to="/perks" className="flex items-center gap-0.5 text-xs font-medium text-brand-700">
              {t('member.home.viewAll')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <PerksPreview perks={perksQuery.data} />
        </section>
      ) : null}
    </motion.div>
  );
}
