import { useTranslation } from '@tsi/i18n';
import { CalendarHeart, ParkingCircle, Repeat, TicketPercent } from 'lucide-react';

export function BenefitsStrip() {
  const { t } = useTranslation();

  const benefits = [
    { icon: Repeat, label: t('member.home.benefit1') },
    { icon: TicketPercent, label: t('member.home.benefit2') },
    { icon: CalendarHeart, label: t('member.home.benefit3') },
    { icon: ParkingCircle, label: t('member.home.benefit4') },
  ];

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-2 py-3.5">
      <div className="grid grid-cols-4 gap-1">
        {benefits.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-sm">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex h-7 items-start justify-center px-0.5 text-[10px] font-medium leading-[1.15] text-brand-900">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
