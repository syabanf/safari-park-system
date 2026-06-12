import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { endpoints, queryKeys } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { AnnualPassArt, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BannerCarousel } from '../home/BannerCarousel';
import { BenefitsStrip } from '../home/BenefitsStrip';
import { EventsPreview } from '../home/EventsPreview';
import { ExploreCards } from '../home/ExploreCards';
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
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const pass = passQuery.data;
  const member = memberQuery.data;
  if (!pass || !member) return null;

  const validUntil = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
    new Date(pass.validUntil),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative -mx-4 -mt-6 overflow-hidden rounded-b-[2rem]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-900/55 to-brand-900/25" />
        <div className="relative px-5 pb-7 pt-10">
          <h1 className="text-[28px] font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-lg">
            {t('member.home.heroLead')}
            <br />
            <span className="text-lime-400">{t('member.home.heroAccent')}</span>
          </h1>
          <p className="mt-2.5 max-w-[16rem] text-sm leading-snug text-brand-50/90 drop-shadow">
            {t('member.home.heroSubtitle')}
          </p>
          <Link
            to="/renewal"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-500 px-5 py-2.5 text-sm font-bold text-brand-950 shadow-lg shadow-brand-950/30 transition-transform active:scale-95"
          >
            {t('member.home.heroCta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.section>

      {/* My Annual Pass */}
      <motion.section
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="rounded-3xl border border-brand-100 bg-brand-50/70 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight text-brand-900">{t('member.home.myPass')}</h2>
            <p className="mt-1 text-xs leading-snug text-brand-800/75">
              {pass.status === 'active'
                ? t(`pass.tier.${pass.tier}`)
                : t('member.home.myPassActive')}
            </p>
            {pass.status === 'active' ? (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                <CheckCircle2 className="h-3 w-3" />
                {t(`pass.status.${pass.status}`)} · {validUntil}
              </span>
            ) : null}
          </div>
          <AnnualPassArt className="w-[7.5rem] shrink-0" />
        </div>
        <Link
          to="/qr"
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 text-sm font-bold text-white shadow-md shadow-brand-900/15 transition-transform active:scale-[0.98]"
        >
          <QrCode className="h-4 w-4" />
          {t('member.home.showQr')}
        </Link>
      </motion.section>

      {/* Quick actions */}
      <section>
        <QuickActions />
      </section>

      {/* Explore */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-base font-bold text-brand-900">{t('member.home.explore')}</h2>
          <Link to="/discover" className="flex items-center gap-0.5 text-xs font-semibold text-brand-700">
            {t('member.home.viewAll')}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ExploreCards />
      </section>

      {/* Benefits */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-brand-900">{t('member.home.benefitsTitle')}</h2>
        <BenefitsStrip />
      </section>

      {/* Promotions */}
      {bannersQuery.data && bannersQuery.data.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-900">{t('member.home.promotions')}</h2>
          <BannerCarousel banners={bannersQuery.data} />
        </section>
      ) : null}

      {/* Events */}
      {eventsQuery.data && eventsQuery.data.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-bold text-brand-900">{t('member.home.upcomingEvents')}</h2>
            <Link to="/events" className="flex items-center gap-0.5 text-xs font-semibold text-brand-700">
              {t('member.home.viewAll')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <EventsPreview events={eventsQuery.data} />
        </section>
      ) : null}

      {/* Perks */}
      {perksQuery.data && perksQuery.data.length > 0 ? (
        <section className="space-y-3 pb-6">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-bold text-brand-900">{t('member.home.memberPerks')}</h2>
            <Link to="/perks" className="flex items-center gap-0.5 text-xs font-semibold text-brand-700">
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
