import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  staffId: string | null;
  gateId: string | null;
  displayName: string | null;
  role: string | null;
  expiresAt: number | null;
  set: (data: {
    accessToken: string;
    expiresIn: number;
    staffId: string;
    gateId: string;
    displayName?: string;
    role?: string;
  }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      staffId: null,
      gateId: null,
      displayName: null,
      role: null,
      expiresAt: null,
      set({ accessToken, expiresIn, staffId, gateId, displayName, role }) {
        set({
          accessToken,
          staffId,
          gateId,
          displayName: displayName ?? null,
          role: role ?? null,
          expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
        });
      },
      clear() {
        set({ accessToken: null, staffId: null, gateId: null, displayName: null, role: null, expiresAt: null });
      },
    }),
    {
      name: 'tsi-validator-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
