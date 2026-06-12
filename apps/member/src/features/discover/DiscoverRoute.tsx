import { useTranslation } from '@tsi/i18n';
import { Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Gift, MapPin, Newspaper, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DiscoverItem {
  to: string;
  labelKey: string;
  descKey?: string;
  icon: LucideIcon;
  accent: 'brand' | 'earth' | 'rose' | 'slate';
}

const items: DiscoverItem[] = [
  { to: '/events', labelKey: 'discover.events', icon: CalendarDays, accent: 'brand' },
  { to: '/promotions', labelKey: 'discover.promotions', icon: Gift, accent: 'rose' },
  { to: '/perks', labelKey: 'discover.perks', icon: Sparkles, accent: 'earth' },
  { to: '/map', labelKey: 'discover.map', icon: MapPin, accent: 'brand' },
  { to: '/notifications', labelKey: 'notifications.title', icon: Newspaper, accent: 'slate' },
];

const accentMap = {
  brand: 'bg-brand-100 text-brand-800',
  earth: 'bg-earth-100 text-earth-800',
  rose: 'bg-rose-100 text-rose-800',
  slate: 'bg-slate-100 text-slate-800',
} as const;

export function DiscoverRoute() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('discover.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('discover.subtitle')}</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Link to={item.to} className="block">
                <Card className="border-border/60 bg-white/85 transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl ${accentMap[item.accent]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold">{t(item.labelKey)}</p>
                    <div className="mt-2 flex items-center gap-0.5 text-xs text-brand-700">
                      {t('discover.explore')}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
