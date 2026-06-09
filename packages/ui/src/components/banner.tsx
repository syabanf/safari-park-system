import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export type BannerAccent = 'brand' | 'earth' | 'rose' | 'slate';

const accentMap: Record<BannerAccent, string> = {
  brand: 'from-brand-700 via-brand-800 to-brand-900 text-brand-50',
  earth: 'from-earth-600 via-earth-700 to-earth-900 text-earth-50',
  rose: 'from-rose-600 via-rose-700 to-rose-900 text-rose-50',
  slate: 'from-slate-700 via-slate-800 to-slate-900 text-slate-50',
};

const overlayMap: Record<BannerAccent, string> = {
  brand: 'from-brand-900/85 via-brand-800/40 to-transparent',
  earth: 'from-earth-900/85 via-earth-800/40 to-transparent',
  rose: 'from-rose-900/85 via-rose-800/40 to-transparent',
  slate: 'from-slate-900/85 via-slate-800/40 to-transparent',
};

interface BannerProps {
  title: string;
  subtitle?: string;
  tag?: string;
  accent?: BannerAccent;
  ctaLabel?: string;
  onCta?: () => void;
  image?: string;
  children?: ReactNode;
  className?: string;
}

export function Banner({
  title,
  subtitle,
  tag,
  accent = 'brand',
  ctaLabel,
  onCta,
  image,
  children,
  className,
}: BannerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl text-white shadow-lg shadow-black/10',
        !image && `bg-gradient-to-br p-5 ${accentMap[accent]}`,
        className,
      )}
    >
      {image ? (
        <>
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className={cn('absolute inset-0 bg-gradient-to-tr', overlayMap[accent])} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
        </>
      )}

      <div className={cn('relative flex h-full flex-col justify-end', image && 'p-5')}>
        {tag ? (
          <span className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            {tag}
          </span>
        ) : null}
        <h3 className="text-lg font-semibold leading-tight drop-shadow">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm opacity-90 drop-shadow">{subtitle}</p> : null}
        {children}
        {ctaLabel ? (
          <button
            type="button"
            onClick={onCta}
            className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/30"
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
