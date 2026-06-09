import { memberDb } from '@tsi/offline-storage';
import type { TokenBufferEntry } from '@tsi/qr-core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';

const SAFETY_WINDOW_SEC = 2;
const DISPLAY_TICK_MS = 1_000;

interface RotatingQRState {
  token: TokenBufferEntry | null;
  secondsRemaining: number;
}

export function useRotatingQR(): RotatingQRState {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), DISPLAY_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const token = useLiveQuery(async () => {
    const candidates = await memberDb.tokenBuffer
      .where('exp')
      .above(now + SAFETY_WINDOW_SEC)
      .sortBy('exp');
    return candidates[0] ?? null;
  }, [now]);

  if (!token) return { token: null, secondsRemaining: 0 };

  const secondsRemaining = Math.max(0, token.exp - now);
  return { token, secondsRemaining };
}
