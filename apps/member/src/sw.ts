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
  ({ url, request }) =>
    request.method === 'GET' &&
    (url.pathname.endsWith('/api/v1/members/me') || url.pathname.endsWith('/api/v1/passes/me')),
  new NetworkFirst({
    cacheName: 'member-data-v1',
    networkTimeoutSeconds: 3,
  }),
);

const tokenBufferQueue = new BackgroundSyncPlugin('token-buffer-refill', {
  maxRetentionTime: 24 * 60,
});

registerRoute(
  ({ url, request }) => request.method === 'POST' && url.pathname.endsWith('/api/v1/tokens/buffer'),
  new NetworkOnly({ plugins: [tokenBufferQueue] }),
  'POST',
);

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
