import { useOnline } from '@/hooks/useOnline';
import { api } from '@/lib/api';
import { track } from '@/lib/telemetry';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@tsi/api-client';
import { memberDb } from '@tsi/offline-storage';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { getDeviceId } from './deviceId';

const REFILL_THRESHOLD = 5;
const REFILL_COUNT = 10;
const TICK_MS = 5_000;

export function useTokenBuffer() {
  const online = useOnline();

  const activeCount = useLiveQuery(async () => {
    const now = Math.floor(Date.now() / 1000);
    return memberDb.tokenBuffer.where('exp').above(now).count();
  }, []);

  const refillMutation = useMutation({
    mutationFn: async () => {
      const response = await endpoints.fetchTokenBuffer(api, {
        count: REFILL_COUNT,
        deviceId: getDeviceId(),
      });
      await memberDb.tokenBuffer.bulkPut(response.tokens);
      track('qr.buffer.refilled', { count: response.tokens.length });
      return response;
    },
  });

  useEffect(() => {
    const prune = async () => {
      const now = Math.floor(Date.now() / 1000);
      const expired = await memberDb.tokenBuffer.where('exp').below(now).primaryKeys();
      if (expired.length > 0) {
        await memberDb.tokenBuffer.bulkDelete(expired);
      }
    };

    const maybeRefill = async () => {
      const count = activeCount ?? 0;
      if (count < REFILL_THRESHOLD && online && !refillMutation.isPending) {
        refillMutation.mutate();
      }
    };

    void prune();
    void maybeRefill();
    const id = window.setInterval(() => {
      void prune();
      void maybeRefill();
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [activeCount, online, refillMutation]);

  return {
    activeCount: activeCount ?? 0,
    refill: () => refillMutation.mutate(),
    isRefilling: refillMutation.isPending,
  };
}
