import i18n, { type i18n as I18nInstance, type Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export interface CreateI18nOptions {
  resources: Resource;
  defaultNs?: string;
  ns?: string[];
  supportedLngs?: string[];
  fallbackLng?: string;
  debug?: boolean;
}

export async function createI18n(options: CreateI18nOptions): Promise<I18nInstance> {
  const instance = i18n.createInstance();
  await instance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: options.resources,
      ns: options.ns ?? ['common'],
      defaultNS: options.defaultNs ?? 'common',
      supportedLngs: options.supportedLngs ?? ['id-ID', 'en-US'],
      fallbackLng: options.fallbackLng ?? 'en-US',
      debug: options.debug ?? false,
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      react: { useSuspense: false },
    });
  return instance;
}

export { useTranslation, Trans } from 'react-i18next';
export type { Resource } from 'i18next';
