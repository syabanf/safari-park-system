import type { ApiClient } from '../client';
import { type ActiveKeysResponse, activeKeysResponseSchema } from '../schemas/keys';

export async function fetchActiveKeys(api: ApiClient): Promise<ActiveKeysResponse> {
  const json = await api.http.get('keys/active').json();
  return activeKeysResponseSchema.parse(json);
}
