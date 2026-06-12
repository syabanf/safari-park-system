import { useTranslation } from '@tsi/i18n';

/** Title-case a raw enum value — the fallback when no translation key exists. */
export function humanize(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Hook returning a translator for filter option values. Looks up
 * `admin.filters.values.<value>` and falls back to a humanized form of the raw
 * value, so known enums (status, severity, type, species…) localize while
 * proper nouns (gate names, departments) stay readable.
 *
 * Usage: `const valueLabel = useValueLabel();` then `label: valueLabel(v)`.
 */
export function useValueLabel(): (value: string) => string {
  const { t } = useTranslation();
  return (value: string) => t(`admin.filters.values.${value}`, { defaultValue: humanize(value) });
}
