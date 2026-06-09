import { createApiClient } from '@tsi/api-client';
import { useAuthStore } from '@/features/auth/store';

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  getAuthToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => {
    useAuthStore.getState().clear();
  },
});
