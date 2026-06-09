import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface IncidentDetail {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'closed';
  reportedBy: string;
  location: string;
  reportedAt: string;
  closedAt: string | null;
  injuries: number;
  description: string;
  actions: { id: string; label: string; timestamp: string; actor: string; status: 'done' | 'pending' }[];
  relatedDocs: string[];
}

async function fetchIncident(id: string): Promise<IncidentDetail> {
  return (await api.http.get(`admin/safety/${id}`).json()) as IncidentDetail;
}

const severityVariant = { low: 'success', medium: 'warning', high: 'destructive' } as const;
const statusVariant = { open: 'destructive', investigating: 'warning', closed: 'success' } as const;

export function SafetyDetailRoute() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'safety', id], queryFn: () => fetchIncident(id), enabled: !!id });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="space-y-6">
      <Link to="/safety" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to safety
      </Link>

      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.type} · {data.id}</p>
              <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{data.location} · {data.reportedBy} · {fmt.format(new Date(data.reportedAt))}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={severityVariant[data.severity]}>{data.severity}</Badge>
            <Badge variant={statusVariant[data.status]}>{data.status}</Badge>
          </div>
        </div>
      </motion.header>

      <Card>
        <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{data.description}</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Due / Done</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.actions.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-3 font-medium">{a.label}</td>
                  <td className="px-6 py-3 text-muted-foreground">{a.actor}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmt.format(new Date(a.timestamp))}</td>
                  <td className="px-6 py-3"><Badge variant={a.status === 'done' ? 'success' : 'warning'}>{a.status}</Badge></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Related documents</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.relatedDocs.map((d) => (
            <div key={d} className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 text-sm">
              <FileText className="h-4 w-4 text-brand-700" />
              <span>{d}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
