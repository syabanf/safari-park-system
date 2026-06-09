import { Banner } from '@tsi/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BannerData } from './types';

interface Props {
  banners: BannerData[];
  intervalMs?: number;
}

export function BannerCarousel({ banners, intervalMs = 5000 }: Props) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    timerRef.current = window.setInterval(advance, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [advance, intervalMs, paused, banners.length]);

  if (!banners.length) return null;
  const current = banners[index]!;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative h-[200px] overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Banner
              title={current.title}
              subtitle={current.subtitle}
              tag={current.tag}
              accent={current.accent}
              ctaLabel={current.ctaLabel}
              onCta={() => navigate(current.ctaTarget)}
              image={current.image}
              className="h-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-brand-700' : 'w-1.5 bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
