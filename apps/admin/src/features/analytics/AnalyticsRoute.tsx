import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '@/lib/api';

interface AnalyticsData {
  daily: { date: string; entries: number; activations: number; renewals: number }[];
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  return (await api.http.get('admin/analytics').json()) as AnalyticsData;
}

export function AnalyticsRoute() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'analytics'], queryFn: fetchAnalytics });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.analytics.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.analytics.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">30-day trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 20% 86%)" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(152 12% 38%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(35 22% 88%)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="entries" stroke="#287338" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="activations" stroke="#b08754" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="renewals" stroke="#5bac6a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
