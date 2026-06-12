import { cn } from '../lib/utils';

interface AnnualPassArtProps {
  /** Optional class for the wrapper (control size via width). */
  className?: string;
  /** Show the "ANNUAL PASS" wordmark. Default true. */
  showWordmark?: boolean;
}

/**
 * The recurring green Annual Pass card visual — a dark-green card with a row of
 * safari-animal silhouettes and the ANNUAL PASS lockup. Used on the member Home
 * ("My Annual Pass") and Profile hero. Pure SVG, no image dependency.
 */
export function AnnualPassArt({ className, showWordmark = true }: AnnualPassArtProps) {
  return (
    <div
      className={cn(
        'relative aspect-[1.6/1] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 shadow-lg shadow-brand-900/30',
        className,
      )}
    >
      {/* soft glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-400/30 blur-2xl" />

      {/* logo mark */}
      <div className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-md bg-white/90">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-brand-800" fill="none" aria-hidden="true">
          <path d="M12 3 4 9v1h16V9l-8-6Z" fill="currentColor" />
          <circle cx="9.5" cy="13" r="1.4" fill="currentColor" />
          <path d="M6 20c0-2.5 2.7-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      {showWordmark ? (
        <div className="absolute right-3 top-3 text-right leading-none">
          <p className="text-[11px] font-extrabold uppercase tracking-tight text-white">Annual</p>
          <p className="text-[11px] font-extrabold uppercase tracking-tight text-brand-200">Pass</p>
        </div>
      ) : null}

      {/* animal silhouette band */}
      <svg
        viewBox="0 0 320 120"
        className="absolute inset-x-0 bottom-0 w-full text-brand-600/50"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
      >
        {/* ground */}
        <path d="M0 110 H320 V120 H0 Z" className="fill-brand-950/30" />
        {/* foliage left */}
        <path
          d="M2 120c0-18 6-30 4-46 6 10 10 14 14 30 2-22 8-34 6-52 8 14 12 22 12 50 4-16 10-22 12-36 2 24 0 38-2 54Z"
          className="fill-brand-500/40"
        />
        {/* elephant */}
        <path
          d="M120 110c-2-14-12-22-26-22-16 0-26 9-27 22h6c1-7 6-12 14-13l-2 13h5l1-13h12l1 13h5c8 1 12 6 13 13Zm-50-25c-3 0-5 2-5 6 0 3 2 5 5 5s5-2 5-5-2-6-5-6Z"
          fill="currentColor"
        />
        {/* giraffe */}
        <path
          d="M205 110l-2-40c0-5-3-9-8-9l-3-20c0-3-2-5-5-5s-5 2-5 5l1 20c-4 1-7 5-7 10l3 39h5l-2-38c0-3 2-5 5-5l2 43Z"
          fill="currentColor"
        />
        {/* rhino */}
        <path
          d="M300 110c-1-12-10-20-24-20-7 0-13 2-17 7l-5-3 2 6c-2 2-3 5-3 10h5c0-9 8-15 18-15 11 0 18 6 19 15Z"
          fill="currentColor"
        />
        {/* foliage right */}
        <path
          d="M318 120c0-16-6-26-4-42-6 9-9 13-12 27-3-20-7-30-6-48-7 12-10 20-11 46Z"
          className="fill-brand-500/40"
        />
      </svg>
    </div>
  );
}
