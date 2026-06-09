import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  accent: 'brand' | 'earth' | 'rose' | 'slate';
  heroEmoji: string;
  image?: string;
  validUntil: string;
  ctaLabel: string;
}

async function fetchPromotions(): Promise<Promotion[]> {
  const json = (await api.http.get('promotions').json()) as { promotions: Promotion[] };
  return json.promotions;
}

const accentText = {
  brand: 'text-brand-800',
  earth: 'text-earth-800',
  rose: 'text-rose-700',
  slate: 'text-slate-700',
};

const accentOverlay = {
  brand: 'from-brand-900/75',
  earth: 'from-earth-900/75',
  rose: 'from-rose-900/75',
  slate: 'from-slate-900/75',
};

export function PromotionsRoute() {
  const { i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['promotions'], queryFn: fetchPromotions });

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <Link
        to="/discover"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Member-only offers and seasonal deals
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-3 pb-6">
          {data.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Card className="overflow-hidden border-border/60 bg-white">
                <div className="relative h-40 w-full overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand-200 to-earth-200" />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t ${accentOverlay[p.accent]} via-black/15 to-transparent`} />
                  <div className="absolute left-3 top-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/90 text-2xl shadow-sm backdrop-blur">
                    {p.heroEmoji}
                  </div>
                  <span className={`absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur ${accentText[p.accent]}`}>
                    {p.tag}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-base font-semibold leading-tight drop-shadow">{p.title}</h3>
                    <p className="text-xs opacity-90 drop-shadow">{p.subtitle}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed text-foreground/90">{p.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Until {dateFormatter.format(new Date(p.validUntil))}
                    </span>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${accentText[p.accent]} bg-white shadow-sm ring-1 ring-border hover:shadow`}
                    >
                      {p.ctaLabel}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
