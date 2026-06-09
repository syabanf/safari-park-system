import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  expiresAt: number | null;
  set: (data: { accessToken: string; expiresIn: number; email: string; displayName?: string; role?: string }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      email: null,
      displayName: null,
      role: null,
      expiresAt: null,
      set({ accessToken, expiresIn, email, displayName, role }) {
        set({
          accessToken,
          email,
          displayName: displayName ?? null,
          role: role ?? null,
          expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        });
      },
      clear() {
        set({ accessToken: null, email: null, displayName: null, role: null, expiresAt: null });
      },
    }),
    {
      name: 'tsi-admin-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
