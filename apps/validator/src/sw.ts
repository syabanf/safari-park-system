/// <reference lib="webworker" />
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.destination === 'document',
  new StaleWhileRevalidate({ cacheName: 'app-shell-v1' }),
);

registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({ cacheName: 'static-resources-v1' }),
);

registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({ cacheName: 'static-assets-v1' }),
);

registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.endsWith('/api/v1/keys/active'),
  new StaleWhileRevalidate({ cacheName: 'pubkeys-v1' }),
);

registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.includes('/api/v1/passes/'),
  new NetworkFirst({
    cacheName: 'pass-lookups-v1',
    networkTimeoutSeconds: 5,
  }),
);

const redemptionsQueue = new BackgroundSyncPlugin('pending-redemptions', {
  maxRetentionTime: 24 * 60,
});

registerRoute(
  ({ url, request }) => request.method === 'POST' && url.pathname.endsWith('/api/v1/redemptions'),
  new NetworkOnly({ plugins: [redemptionsQueue] }),
  'POST',
);

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
