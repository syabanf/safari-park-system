import { Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PerkData } from './types';

interface Props {
  perks: PerkData[];
}

export function PerksPreview({ perks }: Props) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex snap-x snap-mandatory gap-3">
        {perks.slice(0, 4).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="min-w-[72%] shrink-0 snap-start"
          >
            <Link to="/perks" className="block">
              <Card className="overflow-hidden border-border/60 bg-white/85 transition-shadow hover:shadow-md">
                <div className="relative h-24 w-full overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand-100 to-earth-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white/85 text-brand-700 backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="absolute bottom-2 left-3 text-[10px] font-semibold uppercase tracking-widest text-white drop-shadow">
                    {p.category}
                  </p>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold leading-tight">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.summary}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
