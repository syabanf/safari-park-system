import { Card, CardContent } from '@tsi/ui';
import { Cloud, MapPin, Users } from 'lucide-react';
import type { ParkStatus } from './types';

interface Props {
  status: ParkStatus;
}

const crowdLabel = {
  low: 'Quiet',
  moderate: 'Steady',
  high: 'Busy',
};

const crowdColor = {
  low: 'text-brand-700 bg-brand-100',
  moderate: 'text-earth-800 bg-earth-100',
  high: 'text-rose-700 bg-rose-100',
};

export function ParkStatusCard({ status }: Props) {
  return (
    <Card className="overflow-hidden border-border/60 bg-white/80 backdrop-blur">
      <div className="relative h-32 w-full overflow-hidden">
        {status.heroImage ? (
          <img src={status.heroImage} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-200 via-brand-300 to-earth-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 drop-shadow" />
            <div>
              <p className="text-sm font-semibold drop-shadow">{status.parkName}</p>
              <p className="text-[11px] opacity-90 drop-shadow">{status.hours}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur ${
              status.status === 'open' ? 'bg-brand-500/90 text-white' : 'bg-rose-500/90 text-white'
            }`}
          >
            {status.status}
          </span>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-muted/60 p-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Cloud className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Weather</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{status.weather.tempC}°C</p>
            <p className="text-[10px] text-muted-foreground">{status.weather.conditionEn}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Crowd</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${crowdColor[status.crowdLevel]}`}>
                {crowdLabel[status.crowdLevel]}
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-muted/60 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Up next</p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {status.featuredEvent.title}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">{status.featuredEvent.location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
