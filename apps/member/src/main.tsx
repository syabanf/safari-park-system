import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { App } from './App';
import { bootstrapI18n } from './i18n';
import { router } from './router';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

async function bootstrap() {
  // Mocks default ON — flip via VITE_USE_MOCKS=false when a real backend is wired.
  const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
  if (useMocks) {
    const { enableMocking } = await import('@tsi/test-utils/browser');
    // Service worker must live next to the app under its BASE_URL so its
    // default scope matches (single-root deploy puts each app under /<app>/).
    await enableMocking(`${import.meta.env.BASE_URL}mockServiceWorker.js`);
  }

  // Only register the PWA service worker when mocks are off — two SWs in the
  // same scope conflict and the PWA one would shadow MSW's interceptor.
  if (import.meta.env.PROD && !useMocks) {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: false });
  }

  const i18n = await bootstrapI18n();

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <App>
            <RouterProvider router={router} />
          </App>
          {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
      </I18nextProvider>
    </StrictMode>,
  );
}

bootstrap();
