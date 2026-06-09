import { webLifecycleAdapter } from '@tsi/platform-adapters';
import { useEffect, useState } from 'react';

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => webLifecycleAdapter.isOnline());

  useEffect(() => {
    const offOnline = webLifecycleAdapter.onOnline(() => setOnline(true));
    const offOffline = webLifecycleAdapter.onOffline(() => setOnline(false));
    return () => {
      offOnline();
      offOffline();
    };
  }, []);

  return online;
}
