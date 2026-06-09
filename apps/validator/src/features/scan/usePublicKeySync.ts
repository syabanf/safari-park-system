import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { endpoints, queryKeys } from '@tsi/api-client';
import { validatorDb } from '@tsi/offline-storage';
import { useEffect } from 'react';

export function usePublicKeySync() {
  const query = useQuery({
    queryKey: queryKeys.keys.active(),
    queryFn: () => endpoints.fetchActiveKeys(api),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!query.data) return;
    void validatorDb.publicKeys.bulkPut(query.data.keys);
  }, [query.data]);

  return query;
}
