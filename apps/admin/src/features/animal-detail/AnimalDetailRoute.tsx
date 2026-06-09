import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, PawPrint, Stethoscope, Utensils } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface AnimalDetail {
  id: string;
  name: string;
  species: string;
  sex: string;
  enclosure: string;
  age: number;
  status: string;
  conservation: string;
  keeper: string;
  diet: string;
  lastWeightKg: number;
  lastCheckup: string;
  vetLogs: { id: string; date: string; title: string; vet: string; notes: string }[];
  feedingSchedule: { time: string; meal: string }[];
  enrichmentLog: { id: string; date: string; activity: string; engagementPct: number }[];
}

async function fetchAnimal(id: string): Promise<AnimalDetail> {
  return (await api.http.get(`admin/animals/${id}`).json()) as AnimalDetail;
}

export function AnimalDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'animals', id],
    queryFn: () => fetchAnimal(id),
    enabled: !!id,
  });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <Link to="/animals" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to animals
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur">
              <PawPrint className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-brand-200">{data.conservation}</p>
              <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
              <p className="text-sm text-brand-100">{data.species} · {data.sex} · {data.age}y</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-brand-200">Status</p>
              <Badge variant={data.status === 'healthy' ? 'success' : 'warning'}>{data.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Row label="Enclosure">{data.enclosure}</Row>
            <Row label="Keeper">{data.keeper}</Row>
            <Row label="Diet">{data.diet}</Row>
            <Row label="Last weight">{data.lastWeightKg} kg</Row>
            <Row label="Last checkup">{fmt.format(new Date(data.lastCheckup))}</Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="h-4 w-4 text-earth-700" />
              Feeding schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.feedingSchedule.map((s) => (
              <div key={s.time} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                <span className="font-mono text-xs text-brand-700">{s.time}</span>
                <span className="text-sm">{s.meal}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-rose-600" />
              Recent enrichment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.enrichmentLog.map((e) => (
              <div key={e.id} className="rounded-xl bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{e.activity}</span>
                  <span className="font-mono text-xs text-brand-700">{e.engagementPct}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{fmt.format(new Date(e.date))}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-brand-700" />
            Vet logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {data.vetLogs.map((v, i) => (
              <motion.li
                key={v.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-white p-3"
              >
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{v.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt.format(new Date(v.date))} · {v.vet}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.notes}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
