import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { endpoints, queryKeys } from '@tsi/api-client';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Globe,
  HelpCircle,
  Languages,
  LogOut,
  type LucideIcon,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/store';

export function ProfileRoute() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);

  const memberQuery = useQuery({
    queryKey: queryKeys.member.me(),
    queryFn: () => endpoints.getMe(api),
  });

  const passQuery = useQuery({
    queryKey: queryKeys.pass.mine(),
    queryFn: () => endpoints.getMyPass(api),
  });

  const member = memberQuery.data;
  const pass = passQuery.data;

  if (memberQuery.isLoading || passQuery.isLoading || !member) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const quickLinks: { to: string; label: string; icon: LucideIcon }[] = [
    { to: '/qr', label: t('member.home.showQr'), icon: Ticket },
    { to: '/renewal', label: t('member.home.renew'), icon: CalendarDays },
    { to: '/perks', label: t('discover.perks'), icon: Sparkles },
    { to: '/notifications', label: t('notifications.title'), icon: Bell },
  ];

  const settings: { label: string; icon: LucideIcon; onClick?: () => void; value?: string }[] = [
    {
      label: t('member.profile.title'),
      icon: Languages,
      value: i18n.language,
      onClick: () => i18n.changeLanguage(i18n.language === 'id-ID' ? 'en-US' : 'id-ID'),
    },
    { label: 'Region', icon: Globe, value: 'Indonesia' },
    { label: 'Help & support', icon: HelpCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pb-6"
    >
      <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 text-xl font-bold text-white backdrop-blur">
              {member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-brand-200">{t('member.profile.title')}</p>
              <h1 className="truncate text-xl font-bold">{member.fullName}</h1>
              <p className="font-mono text-[11px] text-brand-200">{member.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</h2>
        <Card className="border-border/60 bg-white/85">
          <CardContent className="space-y-3 p-4 text-sm">
            <Row icon={Mail} label="Email" value={member.email} />
            {member.phoneE164 ? <Row icon={Phone} label="Phone" value={member.phoneE164} /> : null}
            {member.nationality ? <Row icon={MapPin} label="Nationality" value={member.nationality} /> : null}
          </CardContent>
        </Card>
      </section>

      {pass ? (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pass info
          </h2>
          <Card className="border-border/60 bg-white/85">
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tier</span>
                <span className="font-medium capitalize">{t(`pass.tier.${pass.tier}`)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                  {t(`pass.status.${pass.status}`)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid until</span>
                <span className="font-medium">
                  {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
                    new Date(pass.validUntil),
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visits used</span>
                <span className="font-mono">{pass.visitsUsed}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quick links
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

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Settings
        </h2>
        <Card className="border-border/60 bg-white/85">
          <CardContent className="p-1.5">
            {settings.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
              >
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-left">{s.label}</span>
                {s.value ? (
                  <span className="text-xs text-muted-foreground">{s.value}</span>
                ) : null}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border/60 bg-white/85">
          <CardContent className="p-1.5">
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
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Taman Safari Annual Pass · v0.1.0
        </p>
      </section>
    </motion.div>
  );
}

function Row({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-1 items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
