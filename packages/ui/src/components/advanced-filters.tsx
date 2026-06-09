import { Check, ChevronDown, Filter, Search, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface MultiSelectFilter {
  key: string;
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export interface DateRangeFilter {
  key: string;
  label: string;
  value: { from: string | null; to: string | null };
  onChange: (next: { from: string | null; to: string | null }) => void;
}

interface AdvancedFiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (q: string) => void;
  multiSelect?: MultiSelectFilter[];
  dateRange?: DateRangeFilter;
  onClear?: () => void;
  rightSlot?: ReactNode;
}

export function AdvancedFilters({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  multiSelect = [],
  dateRange,
  onClear,
  rightSlot,
}: AdvancedFiltersProps) {
  const activeChips = [
    ...multiSelect.flatMap((m) =>
      m.selected.map((s) => ({
        key: `${m.key}:${s}`,
        label: `${m.label}: ${m.options.find((o) => o.value === s)?.label ?? s}`,
        clear: () => m.onChange(m.selected.filter((v) => v !== s)),
      })),
    ),
    ...(dateRange && (dateRange.value.from || dateRange.value.to)
      ? [
          {
            key: 'date',
            label: `${dateRange.label}: ${dateRange.value.from ?? '...'} → ${dateRange.value.to ?? '...'}`,
            clear: () => dateRange.onChange({ from: null, to: null }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white/80 p-3 backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        {onSearchChange ? (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {multiSelect.map((ms) => (
            <MultiSelectMenu key={ms.key} filter={ms} />
          ))}
          {dateRange ? <DateRangeMenu filter={dateRange} /> : null}
          {rightSlot}
        </div>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-3 w-3 text-muted-foreground" />
          {activeChips.map((c) => (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800"
            >
              {c.label}
              <button
                type="button"
                onClick={c.clear}
                className="rounded-full hover:bg-brand-100"
                aria-label={`Clear ${c.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="ml-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MultiSelectMenu({ filter }: { filter: MultiSelectFilter }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = (v: string) => {
    if (filter.selected.includes(v)) {
      filter.onChange(filter.selected.filter((x) => x !== v));
    } else {
      filter.onChange([...filter.selected, v]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium transition-colors',
          filter.selected.length > 0 ? 'border-brand-300 bg-brand-50 text-brand-800' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {filter.label}
        {filter.selected.length > 0 ? (
          <span className="rounded-full bg-brand-700 px-1.5 py-0 text-[10px] font-bold text-white">
            {filter.selected.length}
          </span>
        ) : null}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 min-w-[180px] overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          <ul className="max-h-72 overflow-auto py-1 text-sm">
            {filter.options.map((opt) => {
              const checked = filter.selected.includes(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'grid h-4 w-4 place-items-center rounded border',
                          checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-border',
                        )}
                      >
                        {checked ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span>{opt.label}</span>
                    </span>
                    {opt.count !== undefined ? (
                      <span className="text-[10px] text-muted-foreground">{opt.count}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function DateRangeMenu({ filter }: { filter: DateRangeFilter }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = !!(filter.value.from || filter.value.to);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium transition-colors',
          active ? 'border-brand-300 bg-brand-50 text-brand-800' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {filter.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-72 space-y-2 rounded-xl border border-border bg-white p-3 shadow-lg">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">From</span>
            <input
              type="date"
              value={filter.value.from ?? ''}
              onChange={(e) => filter.onChange({ ...filter.value, from: e.target.value || null })}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">To</span>
            <input
              type="date"
              value={filter.value.to ?? ''}
              onChange={(e) => filter.onChange({ ...filter.value, to: e.target.value || null })}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
          </label>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => filter.onChange({ from: null, to: null })}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-brand-700 px-3 py-1 text-[11px] font-medium text-white"
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
