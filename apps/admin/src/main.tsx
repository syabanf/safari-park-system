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
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { enableMocking } = await import('@tsi/test-utils/browser');
    await enableMocking();
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
