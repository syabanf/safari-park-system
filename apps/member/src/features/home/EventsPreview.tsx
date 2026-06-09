import { useTranslation } from '@tsi/i18n';
import { Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EventData } from './types';

interface Props {
  events: EventData[];
}

export function EventsPreview({ events }: Props) {
  const { i18n } = useTranslation();
  const formatter = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="space-y-2">
      {events.slice(0, 3).map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04 }}
        >
          <Link to={`/events/${e.id}`} className="block">
            <Card className="overflow-hidden border-border/60 bg-white/85 transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-0">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden">
                  {e.image ? (
                    <img
                      src={e.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-100 to-earth-100">
                      <CalendarDays className="h-5 w-5 text-brand-700" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 py-3 pr-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-800">
                      {e.tag}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{formatter.format(new Date(e.datetime))}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {e.location}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
