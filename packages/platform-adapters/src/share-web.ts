import type { ShareAdapter, SharePayload } from './share';

export const webShareAdapter: ShareAdapter = {
  canShare(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  },

  async share(payload: SharePayload): Promise<void> {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === 'function') {
      await nav.share(payload);
      return;
    }
    if (payload.url && nav.clipboard) {
      await nav.clipboard.writeText(payload.url);
    }
  },
};
