import type { AppLifecycleAdapter } from './lifecycle';

export const webLifecycleAdapter: AppLifecycleAdapter = {
  onResume(cb: () => void): () => void {
    const handler = () => {
      if (document.visibilityState === 'visible') cb();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  },

  onPause(cb: () => void): () => void {
    const handler = () => {
      if (document.visibilityState === 'hidden') cb();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  },

  onOnline(cb: () => void): () => void {
    window.addEventListener('online', cb);
    return () => window.removeEventListener('online', cb);
  },

  onOffline(cb: () => void): () => void {
    window.addEventListener('offline', cb);
    return () => window.removeEventListener('offline', cb);
  },

  isOnline(): boolean {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
  },
};
