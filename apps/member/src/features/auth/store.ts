import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  displayName: string | null;
  personaId: string | null;
  expiresAt: number | null;
  set: (data: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    displayName?: string;
    personaId?: string;
  }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      displayName: null,
      personaId: null,
      expiresAt: null,
      set({ accessToken, refreshToken, expiresIn, displayName, personaId }) {
        set({
          accessToken,
          refreshToken: refreshToken ?? null,
          displayName: displayName ?? null,
          personaId: personaId ?? null,
          expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        });
      },
      clear() {
        set({
          accessToken: null,
          refreshToken: null,
          displayName: null,
          personaId: null,
          expiresAt: null,
        });
      },
    }),
    {
      name: 'tsi-member-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
