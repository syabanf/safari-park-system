import { validatorDb } from '@tsi/offline-storage';
import { JtiReplaySet, verifyToken } from '@tsi/qr-core';
import { useEffect, useMemo, useState } from 'react';

interface VerificationContext {
  loaded: boolean;
  verify: (jws: string) => ReturnType<typeof verifyToken>;
}

export function useVerification(): VerificationContext {
  const [loaded, setLoaded] = useState(false);
  const replay = useMemo(() => new JtiReplaySet(), []);
  const [keys, setKeys] = useState<Awaited<ReturnType<typeof loadKeys>>>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadKeys();
      if (cancelled) return;
      setKeys(stored);
      const recent = await validatorDb.consumedJti.toArray();
      for (const entry of recent) replay.add(entry.jti, entry.exp);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [replay]);

  return {
    loaded,
    verify(jws: string) {
      return verifyToken(jws, {
        publicKeys: keys,
        isReplayed: (jti) => replay.has(jti),
      });
    },
  };
}

async function loadKeys() {
  return validatorDb.publicKeys.toArray();
}
