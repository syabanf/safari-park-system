import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface MaintenanceDetail {
  id: string;
  title: string;
  gateId: string;
  gateLabel: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'scheduled' | 'resolved';
  assignee: string;
  openedAt: string;
  due: string;
  category: string;
  description: string;
  timeline: { id: string; label: string; timestamp: string; actor: string }[];
  parts: { sku: string; name: string; qty: number; status: string }[];
}

async function fetchDetail(id: string): Promise<MaintenanceDetail> {
  return (await api.http.get(`admin/maintenance/${id}`).json()) as MaintenanceDetail;
}

const severityVariant: Record<MaintenanceDetail['severity'], 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

export function MaintenanceDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'maintenance', id],
    queryFn: () => fetchDetail(id),
    enabled: !!id,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6">
      <Link to="/maintenance" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to tickets
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Maintenance ticket</p>
          <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {data.id} · {data.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={severityVariant[data.severity]}>{data.severity}</Badge>
          <Badge variant="warning">{data.status}</Badge>
        </div>
      </motion.header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{data.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Gate">
              <Link to={`/gates/${data.gateId}`} className="text-brand-700 hover:underline">
                {data.gateLabel}
              </Link>
            </Row>
            <Row label="Assignee">{data.assignee}</Row>
            <Row label="Opened">{formatter.format(new Date(data.openedAt))}</Row>
            <Row label="Due">{formatter.format(new Date(data.due))}</Row>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {data.timeline.map((t, i) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatter.format(new Date(t.timestamp))} · {t.actor}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Qty</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.parts.map((p) => (
                <tr key={p.sku} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-6 py-3">{p.name}</td>
                  <td className="px-6 py-3 font-mono">{p.qty}</td>
                  <td className="px-6 py-3">
                    <Badge variant={p.status === 'in-stock' ? 'success' : 'warning'}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
