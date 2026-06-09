import { useTranslation } from '@tsi/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@tsi/ui';
import { motion } from 'framer-motion';

const tiers = [
  { tier: 'Adult', priceIdr: 850_000, visits: 'Unlimited', validityDays: 365 },
  { tier: 'Child', priceIdr: 600_000, visits: 'Unlimited', validityDays: 365 },
  { tier: 'Senior', priceIdr: 500_000, visits: 'Unlimited', validityDays: 365 },
  { tier: 'Family (4 pax)', priceIdr: 2_800_000, visits: 'Unlimited', validityDays: 365 },
];

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function SettingsRoute() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing tiers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Tier</th>
                <th className="px-6 py-3 font-medium">Price (IDR)</th>
                <th className="px-6 py-3 font-medium">Visits</th>
                <th className="px-6 py-3 font-medium">Validity</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((row, idx) => (
                <motion.tr
                  key={row.tier}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-3 font-medium">{row.tier}</td>
                  <td className="px-6 py-3">{idr.format(row.priceIdr)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{row.visits}</td>
                  <td className="px-6 py-3 text-muted-foreground">{row.validityDays} days</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
