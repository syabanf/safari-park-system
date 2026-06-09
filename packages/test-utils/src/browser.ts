import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function enableMocking(swUrl = '/mockServiceWorker.js'): Promise<void> {
  await worker.start({
    serviceWorker: { url: swUrl },
    onUnhandledRequest: 'bypass',
  });
}
