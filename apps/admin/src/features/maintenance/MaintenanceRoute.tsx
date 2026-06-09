import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MaintenanceTicket {
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
}

async function fetchTickets(): Promise<MaintenanceTicket[]> {
  const json = (await api.http.get('admin/maintenance').json()) as { tickets: MaintenanceTicket[] };
  return json.tickets;
}

const severityVariant: Record<MaintenanceTicket['severity'], 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

const statusVariant: Record<MaintenanceTicket['status'], 'secondary' | 'warning' | 'success' | 'destructive'> = {
  open: 'destructive',
  'in-progress': 'warning',
  scheduled: 'secondary',
  resolved: 'success',
};

export function MaintenanceRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'maintenance'],
    queryFn: fetchTickets,
  });

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;
  }

  const open = data.filter((t) => t.status === 'open').length;
  const inProgress = data.filter((t) => t.status === 'in-progress').length;
  const resolved = data.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Field tickets, preventive schedule, and gate hardware health
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <TileCard label="Open" value={open} icon={<Wrench className="h-4 w-4 text-rose-600" />} />
        <TileCard label="In progress" value={inProgress} icon={<Clock className="h-4 w-4 text-earth-700" />} />
        <TileCard label="Resolved this week" value={resolved} icon={<CheckCircle2 className="h-4 w-4 text-brand-700" />} />
        <TileCard label="MTTR" value="6h 12m" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tickets</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Gate</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Assignee</th>
                <th className="px-6 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ticket, i) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-3">
                    <Link to={`/maintenance/${ticket.id}`} className="hover:text-brand-700">
                      <div className="font-medium">{ticket.title}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{ticket.id} · {ticket.category}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <Link to={`/gates/${ticket.gateId}`} className="text-muted-foreground hover:text-brand-700 hover:underline">
                      {ticket.gateLabel}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={severityVariant[ticket.severity]}>{ticket.severity}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{ticket.assignee}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {formatter.format(new Date(ticket.due))}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function TileCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
          {icon ?? null}
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
