import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent } from '@tsi/ui';
import { motion } from 'framer-motion';
import { Heart, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Animal {
  id: string;
  name: string;
  species: string;
  sex: string;
  enclosure: string;
  age: number;
  status: 'healthy' | 'monitoring' | 'treatment';
  conservation: string;
}

async function fetchAnimals(): Promise<Animal[]> {
  const json = (await api.http.get('admin/animals').json()) as { animals: Animal[] };
  return json.animals;
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  healthy: 'success',
  monitoring: 'warning',
  treatment: 'destructive',
};

const conservationVariant: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  'Critically Endangered': 'destructive',
  Endangered: 'warning',
  Vulnerable: 'warning',
  'Near Threatened': 'secondary',
};

export function AnimalsRoute() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'animals'], queryFn: fetchAnimals });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const totals = {
    total: data.length,
    healthy: data.filter((a) => a.status === 'healthy').length,
    monitoring: data.filter((a) => a.status === 'monitoring').length,
    species: new Set(data.map((a) => a.species)).size,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Animals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welfare records, conservation status, enclosures</p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiTile label="Animals registered" value={totals.total} />
        <KpiTile label="Species" value={totals.species} />
        <KpiTile label="Under monitoring" value={totals.monitoring} accent="warning" />
        <KpiTile label="Healthy" value={totals.healthy} accent="success" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
          >
            <Link to={`/animals/${a.id}`} className="block">
              <Card className="overflow-hidden border-border/60 transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-earth-100 text-brand-700">
                        <PawPrint className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.species}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant[a.status] ?? 'secondary'}>{a.status}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <Mini label="Sex" value={a.sex} />
                    <Mini label="Age" value={`${a.age}y`} />
                    <Mini label="Enclosure" value={a.enclosure} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                    <Badge variant={conservationVariant[a.conservation] ?? 'secondary'} className="text-[10px]">
                      {a.conservation}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-xs font-medium">{value}</p>
    </div>
  );
}

function KpiTile({ label, value, accent }: { label: string; value: number; accent?: 'success' | 'warning' }) {
  const cls = accent === 'warning' ? 'text-earth-800' : accent === 'success' ? 'text-brand-800' : '';
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`mt-2 text-2xl font-bold tracking-tight ${cls}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
