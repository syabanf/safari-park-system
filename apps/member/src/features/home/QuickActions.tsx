import { useTranslation } from '@tsi/i18n';
import { motion } from 'framer-motion';
import { CalendarRange, Gift, type LucideIcon, Ticket, TicketCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions: { label: string; icon: LucideIcon; to: string }[] = [
    { label: t('member.home.qa.buyPass'), icon: Ticket, to: '/renewal' },
    { label: t('member.home.qa.myTickets'), icon: TicketCheck, to: '/qr' },
    { label: t('member.home.qa.planner'), icon: CalendarRange, to: '/events' },
    { label: t('member.home.qa.memberPerks'), icon: Gift, to: '/perks' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {actions.map((a, i) => (
        <motion.button
          key={a.to}
          type="button"
          onClick={() => navigate(a.to)}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-white px-1.5 pb-2.5 pt-3 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <a.icon className="h-5 w-5" />
          </span>
          <span className="flex h-7 items-center text-center text-[10px] font-semibold leading-[1.15] text-brand-900">
            {a.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
