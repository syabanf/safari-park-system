import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/api';

interface PassBreakdown {
  byTier: { tier: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

async function fetchPasses(): Promise<PassBreakdown> {
  return (await api.http.get('admin/passes/breakdown').json()) as PassBreakdown;
}

const tierColors = ['#287338', '#5bac6a', '#b08754', '#d4be96'];
const statusColors: Record<string, string> = {
  active: '#287338',
  expired: '#9a3a3a',
  suspended: '#b08754',
  pending: '#a5a5a5',
};

export function PassesRoute() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'passes'], queryFn: fetchPasses });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.passes.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.passes.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.byTier}
                  dataKey="count"
                  nameKey="tier"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.byTier.map((_, i) => (
                    <Cell key={i} fill={tierColors[i % tierColors.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(35 22% 88%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.byStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.byStatus.map((entry) => (
                    <Cell key={entry.status} fill={statusColors[entry.status] ?? '#287338'} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(35 22% 88%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
