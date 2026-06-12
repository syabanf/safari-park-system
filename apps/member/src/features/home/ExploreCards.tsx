import { useTranslation } from '@tsi/i18n';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=480&q=80&auto=format&fit=crop`;

export function ExploreCards() {
  const { t } = useTranslation();

  const cards = [
    { label: t('member.home.explore1'), image: img('1546182990-dffeafbe841d'), to: '/events' },
    { label: t('member.home.explore2'), image: img('1444080748397-f442aa95c3e5'), to: '/events' },
    { label: t('member.home.explore3'), image: img('1547721064-da6cfb341d50'), to: '/discover' },
    { label: t('member.home.explore4'), image: img('1600880292203-757bb62b4baf'), to: '/discover' },
  ];

  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="shrink-0"
          >
            <Link
              to={c.to}
              className="group relative block h-32 w-28 overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={c.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute inset-x-2 bottom-2 text-[11px] font-semibold leading-tight text-white drop-shadow">
                {c.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
