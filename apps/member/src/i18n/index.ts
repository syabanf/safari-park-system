import { createI18n } from '@tsi/i18n';
import sharedEn from '@tsi/i18n/locales/en-US.json';
import sharedId from '@tsi/i18n/locales/id-ID.json';
import appEn from './locales/en-US.json';
import appId from './locales/id-ID.json';

export function bootstrapI18n() {
  return createI18n({
    resources: {
      'id-ID': { common: { ...sharedId, ...appId } },
      'en-US': { common: { ...sharedEn, ...appEn } },
    },
    ns: ['common'],
    defaultNs: 'common',
    supportedLngs: ['id-ID', 'en-US'],
    fallbackLng: 'en-US',
  });
}
