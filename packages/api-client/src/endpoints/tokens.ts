import type { ApiClient } from '../client';
import {
  type TokenBufferRequest,
  type TokenBufferResponse,
  tokenBufferResponseSchema,
} from '../schemas/tokens';

export async function fetchTokenBuffer(
  api: ApiClient,
  body: TokenBufferRequest,
): Promise<TokenBufferResponse> {
  const json = await api.http.post('tokens/buffer', { json: body }).json();
  return tokenBufferResponseSchema.parse(json);
}
