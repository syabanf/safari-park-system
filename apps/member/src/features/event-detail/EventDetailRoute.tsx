import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface EventDetail {
  id: string;
  title: string;
  summary: string;
  tag: string;
  location: string;
  datetime: string;
  durationMin: number;
  capacity: number;
  booked: number;
  host: string;
  image?: string;
  requirements: string[];
  schedule: { time: string; label: string }[];
  similar: string[];
}

async function fetchEventDetail(id: string): Promise<EventDetail> {
  return (await api.http.get(`events/${id}`).json()) as EventDetail;
}

export function EventDetailRoute() {
  const { id = '' } = useParams();
  const { i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventDetail(id),
    enabled: !!id,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const spotsLeft = data.capacity - data.booked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pb-6"
    >
      <Link
        to="/events"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to events
      </Link>

      <Card className="overflow-hidden border-border/60 text-white">
        <div className="relative h-48 w-full overflow-hidden">
          {data.image ? (
            <img src={data.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-700 to-brand-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-900/40 to-brand-900/10" />
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur">
              {data.tag}
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <h1 className="text-2xl font-bold leading-tight drop-shadow-lg">{data.title}</h1>
            <p className="mt-1 text-sm text-brand-50/95 drop-shadow">{data.summary}</p>
          </div>
        </div>
        <CardContent className="bg-gradient-to-br from-brand-800 to-brand-900 p-5">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatter.format(new Date(data.datetime))} · {data.durationMin} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{data.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {data.booked} / {data.capacity} booked
              </span>
            </div>
          </div>

          <Button className="mt-4 w-full bg-white text-brand-900 hover:bg-white/90" size="lg" disabled={spotsLeft <= 0}>
            {spotsLeft > 0 ? `RSVP — ${spotsLeft} spots left` : 'Sold out'}
          </Button>
        </CardContent>
      </Card>

      <section>
        <Card className="border-border/60 bg-white/85">
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-3 border-l-2 border-brand-200 pl-4">
              {data.schedule.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-brand-200 bg-white" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.time}</p>
                  <p className="text-sm font-medium">{s.label}</p>
                </motion.li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border/60 bg-white/85">
          <CardHeader>
            <CardTitle className="text-base">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Hosted by {data.host}</p>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
