import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@tsi/i18n';
import { Badge, Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@tsi/ui';
import { motion } from 'framer-motion';
import {
  Bell,
  Building2,
  CreditCard,
  Handshake,
  Landmark,
  MapPin,
  PawPrint,
  Percent,
  Ticket,
  UserCog,
} from 'lucide-react';

interface Department { id: string; code: string; name: string; headcount: number; manager: string }
interface Role { id: string; code: string; name: string; department: string; baseSalary: number }
interface Tier { id: string; code: string; name: string; priceIdr: number; visits: string; validityDays: number }
interface Enclosure { id: string; code: string; name: string; capacity: number; occupants: number; lastInspection: string }
interface Tax { id: string; code: string; name: string; rate: number; appliesTo: string }
interface PaymentMethod { id: string; code: string; name: string; feePct: number; settlement: string }
interface NotificationTemplate { id: string; code: string; name: string; channel: string; lastEdited: string }
interface Location { id: string; code: string; name: string; address: string; timezone: string; activeGates: number; manager: string }
interface Species { id: string; code: string; name: string; latin: string; iucn: string; count: number }
interface Sponsor { id: string; code: string; name: string; category: string; tier: string; contractEnds: string }

interface MasterData {
  departments: Department[];
  roles: Role[];
  tiers: Tier[];
  enclosures: Enclosure[];
  taxes: Tax[];
  paymentMethods: PaymentMethod[];
  notificationTemplates: NotificationTemplate[];
  locations: Location[];
  species: Species[];
  sponsors: Sponsor[];
}

async function fetchMasterData(): Promise<MasterData> {
  return (await api.http.get('admin/master-data').json()) as MasterData;
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export function MasterDataRoute() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'master-data'], queryFn: fetchMasterData });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{t('admin.common.loading')}</p>;

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Master data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference data — referenced by every other module
        </p>
      </header>

      <Tabs defaultValue="departments">
        <TabsList className="flex-wrap">
          <TabsTrigger value="departments" icon={<Building2 className="h-3.5 w-3.5" />} count={data.departments.length}>Departments</TabsTrigger>
          <TabsTrigger value="roles" icon={<UserCog className="h-3.5 w-3.5" />} count={data.roles.length}>Roles</TabsTrigger>
          <TabsTrigger value="tiers" icon={<Ticket className="h-3.5 w-3.5" />} count={data.tiers.length}>Tiers & pricing</TabsTrigger>
          <TabsTrigger value="enclosures" icon={<MapPin className="h-3.5 w-3.5" />} count={data.enclosures.length}>Enclosures</TabsTrigger>
          <TabsTrigger value="locations" icon={<Landmark className="h-3.5 w-3.5" />} count={data.locations.length}>Locations</TabsTrigger>
          <TabsTrigger value="species" icon={<PawPrint className="h-3.5 w-3.5" />} count={data.species.length}>Species</TabsTrigger>
          <TabsTrigger value="sponsors" icon={<Handshake className="h-3.5 w-3.5" />} count={data.sponsors.length}>Sponsors</TabsTrigger>
          <TabsTrigger value="taxes" icon={<Percent className="h-3.5 w-3.5" />} count={data.taxes.length}>Tax & fees</TabsTrigger>
          <TabsTrigger value="payment" icon={<CreditCard className="h-3.5 w-3.5" />} count={data.paymentMethods.length}>Payment</TabsTrigger>
          <TabsTrigger value="templates" icon={<Bell className="h-3.5 w-3.5" />} count={data.notificationTemplates.length}>Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <Table headers={['Code', 'Name', 'Manager', 'Headcount']}>
            {data.departments.map((d, i) => (
              <Row key={d.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{d.code}</td>
                <td className="px-6 py-3 font-medium">{d.name}</td>
                <td className="px-6 py-3 text-muted-foreground">{d.manager}</td>
                <td className="px-6 py-3 font-mono">{d.headcount}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="roles">
          <Table headers={['Code', 'Role', 'Department', 'Base salary']}>
            {data.roles.map((r, i) => (
              <Row key={r.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{r.code}</td>
                <td className="px-6 py-3 font-medium">{r.name}</td>
                <td className="px-6 py-3 text-muted-foreground">{r.department}</td>
                <td className="px-6 py-3 font-mono text-xs">{idr.format(r.baseSalary)}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="tiers">
          <Table headers={['Code', 'Tier', 'Price', 'Visits', 'Validity']}>
            {data.tiers.map((tier, i) => (
              <Row key={tier.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{tier.code}</td>
                <td className="px-6 py-3 font-medium">{tier.name}</td>
                <td className="px-6 py-3 font-mono">{idr.format(tier.priceIdr)}</td>
                <td className="px-6 py-3 text-muted-foreground">{tier.visits}</td>
                <td className="px-6 py-3 text-muted-foreground">{tier.validityDays}d</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="enclosures">
          <Table headers={['Code', 'Enclosure', 'Capacity', 'Occupants', 'Last inspection']}>
            {data.enclosures.map((e, i) => (
              <Row key={e.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{e.code}</td>
                <td className="px-6 py-3 font-medium">{e.name}</td>
                <td className="px-6 py-3 font-mono">{e.capacity}</td>
                <td className="px-6 py-3 font-mono">
                  <span className={e.occupants >= e.capacity * 0.9 ? 'text-earth-700' : ''}>
                    {e.occupants}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmt.format(new Date(e.lastInspection))}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="locations">
          <Table headers={['Code', 'Park', 'Address', 'Timezone', 'Active gates', 'Manager']}>
            {data.locations.map((l, i) => (
              <Row key={l.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{l.code}</td>
                <td className="px-6 py-3 font-medium">{l.name}</td>
                <td className="px-6 py-3 text-xs text-muted-foreground">{l.address}</td>
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{l.timezone}</td>
                <td className="px-6 py-3 font-mono">{l.activeGates}</td>
                <td className="px-6 py-3 text-muted-foreground">{l.manager}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="species">
          <Table headers={['Code', 'Common name', 'Scientific name', 'IUCN', 'Count']}>
            {data.species.map((s, i) => (
              <Row key={s.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{s.code}</td>
                <td className="px-6 py-3 font-medium">{s.name}</td>
                <td className="px-6 py-3 italic text-muted-foreground">{s.latin}</td>
                <td className="px-6 py-3">
                  <Badge
                    variant={['CR', 'EN'].includes(s.iucn) ? 'destructive' : s.iucn === 'VU' ? 'default' : 'secondary'}
                  >
                    {s.iucn}
                  </Badge>
                </td>
                <td className="px-6 py-3 font-mono">{s.count}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="sponsors">
          <Table headers={['Code', 'Sponsor', 'Category', 'Tier', 'Contract ends']}>
            {data.sponsors.map((s, i) => (
              <Row key={s.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{s.code}</td>
                <td className="px-6 py-3 font-medium">{s.name}</td>
                <td className="px-6 py-3 text-muted-foreground">{s.category}</td>
                <td className="px-6 py-3">
                  <Badge variant={s.tier === 'Platinum' ? 'default' : 'secondary'}>{s.tier}</Badge>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmt.format(new Date(s.contractEnds))}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="taxes">
          <Table headers={['Code', 'Name', 'Rate', 'Applies to']}>
            {data.taxes.map((tax, i) => (
              <Row key={tax.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{tax.code}</td>
                <td className="px-6 py-3 font-medium">{tax.name}</td>
                <td className="px-6 py-3 font-mono">{tax.rate}%</td>
                <td className="px-6 py-3 text-muted-foreground">{tax.appliesTo}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="payment">
          <Table headers={['Code', 'Method', 'Fee', 'Settlement']}>
            {data.paymentMethods.map((p, i) => (
              <Row key={p.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-6 py-3 font-medium">{p.name}</td>
                <td className="px-6 py-3 font-mono">{p.feePct}%</td>
                <td className="px-6 py-3 text-muted-foreground">{p.settlement}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>

        <TabsContent value="templates">
          <Table headers={['Code', 'Name', 'Channel', 'Last edited']}>
            {data.notificationTemplates.map((tpl, i) => (
              <Row key={tpl.id} index={i}>
                <td className="px-6 py-3 font-mono text-xs">{tpl.code}</td>
                <td className="px-6 py-3 font-medium">{tpl.name}</td>
                <td className="px-6 py-3 text-muted-foreground">
                  <Badge variant="secondary">{tpl.channel}</Badge>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{fmt.format(new Date(tpl.lastEdited))}</td>
              </Row>
            ))}
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              {headers.map((h) => (
                <th key={h} className="px-6 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function Row({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.4) }}
      className="border-b last:border-0 hover:bg-muted/30"
    >
      {children}
    </motion.tr>
  );
}
